import ActorComponent from "./ActorComponent.js";
import ActorJellyBone from "./ActorJellyBone.js";
import ActorBoneBase from "./ActorBoneBase.js";
import { mat2d, vec2 } from "gl-matrix";

// https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
const JellyMax = 16;
const OptimalDistance = 4*(Math.sqrt(2)-1)/3;
const CurveConstant = OptimalDistance * Math.sqrt(2) * 0.5;

function ForwardDiffBezier(c0, c1, c2, c3, points, count, offset)
{
	let f = count;

	const p0 = c0;

	const p1 = 3.0 * (c1 - c0) / f;

	f *= count;
	const p2 = 3.0 * (c0 - 2.0 * c1 + c2) / f;
	
	f *= count;
	const p3 = (c3 - c0 + 3.0 * (c1 - c2)) / f;

	c0 = p0;
	c1 = p1 + p2 + p3;
	c2 = 2 * p2 + 6 * p3;
	c3 = 6 * p3;

	for (let a = 0; a <= count; a++) 
	{
		points[a][offset] = c0;
		c0 += c1;
		c1 += c2;
		c2 += c3;
	}
}

function NormalizeCurve(curve, numSegments)
{
	const points = [];
	const curvePointCount = curve.length;
	const distances = new Float32Array(curvePointCount);
	distances[0] = 0;
	for(let i = 0; i < curvePointCount-1; i++)
	{
		const p1 = curve[i];
		const p2 = curve[i+1];
		distances[i + 1] = distances[i] + vec2.distance(p1, p2);
	}
	const totalDistance = distances[curvePointCount-1];

	const segmentLength = totalDistance/numSegments;
	let pointIndex = 1;
	for(let i = 1; i <= numSegments; i++)
	{
		const distance = segmentLength * i;

		while(pointIndex < curvePointCount-1 && distances[pointIndex] < distance)
		{
			pointIndex++;
		}

		const d = distances[pointIndex];
		const lastCurveSegmentLength = d - distances[pointIndex-1];
		const remainderOfDesired = d - distance;
		const ratio = remainderOfDesired / lastCurveSegmentLength;
		const iratio = 1.0-ratio;

		const p1 = curve[pointIndex-1];
		const p2 = curve[pointIndex];
		points.push([p1[0]*ratio+p2[0]*iratio, p1[1]*ratio+p2[1]*iratio]);
	}

	return points;
}

const EPSILON = 0.001; // Intentionally aggressive.

function FuzzyEquals(a, b) 
{
    const a0 = a[0], a1 = a[1];
    const b0 = b[0], b1 = b[1];
    return (Math.abs(a0 - b0) <= EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)));
}

export default class JellyComponent extends ActorComponent
{
	constructor()
	{
		super();

		this._EaseIn = 0.0;
		this._EaseOut = 0.0;
		this._ScaleIn = 0.0;
		this._ScaleOut = 0.0;
		this._InTargetIdx = 0;
		this._OutTargetIdx = 0;
		this._InTarget = null;
		this._OutTarget = null;

		this._Bones = [];
		this._InPoint = vec2.create();
		this._InDirection = vec2.create();
		this._OutPoint = vec2.create();
		this._OutDirection = vec2.create();
	}

	makeInstance(resetActor)
	{
		const node = new JellyComponent();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._EaseIn = node._EaseIn;
		this._EaseOut = node._EaseOut;
		this._ScaleIn = node._ScaleIn;
		this._ScaleOut = node._ScaleOut;
		this._InTargetIdx = node._InTargetIdx;
		this._OutTargetIdx = node._OutTargetIdx;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);

		if(this._InTargetIdx !== 0)
		{
			this._InTarget = components[this._InTargetIdx];
		}
		if(this._OutTargetIdx !== 0)
		{
			this._OutTarget = components[this._OutTargetIdx];
		}

		// Add dependencies.
		const {_Actor:actor, _Parent:bone} = this;
		let dependencyConstraints = [];
		if(bone)
		{
			actor.addDependency(this, bone);
			dependencyConstraints = dependencyConstraints.concat(Array.from(bone.allConstraints));
			let firstBone = bone.firstBone;
			if(firstBone)
			{
				actor.addDependency(this, firstBone);
				dependencyConstraints = dependencyConstraints.concat(Array.from(firstBone.allConstraints));

				// If we don't have an out target and the child jelly does have an in target
				// we are dependent on that target's position.
				if(!this.outTarget && firstBone.jelly && firstBone.jelly.inTarget)
				{
					actor.addDependency(this, firstBone.jelly.inTarget);
					dependencyConstraints = dependencyConstraints.concat(Array.from(firstBone.jelly.inTarget.allConstraints));
				}
			}
			let parentBone = bone.parent instanceof ActorBoneBase && bone.parent;
			let parentBoneJelly = parentBone && parentBone.jelly;
			if(parentBoneJelly && parentBoneJelly.outTarget)
			{
				actor.addDependency(this, parentBoneJelly.outTarget);
				dependencyConstraints = dependencyConstraints.concat(Array.from(parentBoneJelly.outTarget.allConstraints));
			}
		}

		if(this._InTarget)
		{
			actor.addDependency(this, this._InTarget);
			dependencyConstraints = dependencyConstraints.concat(Array.from(this._InTarget.allConstraints));
		}
		if(this._OutTarget)
		{
			actor.addDependency(this, this._OutTarget);
			dependencyConstraints = dependencyConstraints.concat(Array.from(this._OutTarget.allConstraints));
		}

		dependencyConstraints = new Set(dependencyConstraints);
		
		for(const constraint of dependencyConstraints)
		{
			actor.addDependency(this, constraint);
		}
	}

	completeResolve()
	{
		super.completeResolve();
		
		const {_Actor:actor, _Parent:bone} = this;
		bone._Jelly = this;

		// Get jellies.
		const children = bone._Children;
		if(!children)
		{
			return;
		}
		for(const child of children)
		{
			if(child.constructor === ActorJellyBone)
			{
				this._Bones.push(child);
				actor.addDependency(child, this);
			}
		}
	}

	updateJellies()
	{
		const bone = this._Parent;
		// We are in local bone space.
		const tipPosition = vec2.set(vec2.create(), bone._Length, 0.0);
		const jc = this._Cache;

		const jellies = this._Bones;
		if(!jellies)
		{
			return;
		}

		if(jc && FuzzyEquals(jc.tip, tipPosition) && FuzzyEquals(jc.out, this._OutPoint) && FuzzyEquals(jc.in, this._InPoint) && jc.sin === this._ScaleIn && jc.sout === this._ScaleOut)
		{
			return;
		}

		this._Cache =
		{
			tip:tipPosition,
			out:vec2.clone(this._OutPoint),
			in:vec2.clone(this._InPoint),
			sin:this._ScaleIn,
			sout:this._ScaleOut
		};

		const q0 = vec2.create();
		const q1 = this._InPoint;
		const q2 = this._OutPoint;
		const q3 = tipPosition;


		const subdivisions = JellyMax;
		const points = [];
		for(let i = 0; i <= subdivisions; i++)
		{
			points.push(new Float32Array(2));
		}

		ForwardDiffBezier(q0[0], q1[0], q2[0], q3[0], points, subdivisions, 0);
		ForwardDiffBezier(q0[1], q1[1], q2[1], q3[1], points, subdivisions, 1);

		const normalizedPoints = NormalizeCurve(points, jellies.length);

		let lastPoint = points[0];

		let scale = this._ScaleIn;
		const scaleInc = (this._ScaleOut - this._ScaleIn)/(jellies.length-1);
		for(let i = 0; i < normalizedPoints.length; i++)
		{
			const jelly = jellies[i];
			const p = normalizedPoints[i];

			// We could set these by component and allow the mark to happen only if things have changed
			// but it's really likely that we have to mark dirty here, so might as well optimize the general case.
			vec2.copy(jelly._Translation, lastPoint);
			jelly._Length = vec2.distance(p, lastPoint);
			jelly._Scale[1] = scale;
			scale += scaleInc;

			const diff = vec2.subtract(vec2.create(), p, lastPoint);
			jelly._Rotation = Math.atan2(diff[1], diff[0]);
			jelly.markTransformDirty();
			lastPoint = p;
		}
	}

	get tipPosition()
	{
		const bone = this._Parent;
		return vec2.set(vec2.create(), bone._Length, 0.0);
	}

	update(dirt)
	{
		const bone = this._Parent;

		const parentBone = bone.parent instanceof ActorBoneBase && bone.parent;
		const parentBoneJelly = parentBone && parentBone.jelly;
		const inverseWorld = mat2d.invert(mat2d.create(), bone.worldTransform);
		if(!inverseWorld)
		{
			console.warn("Failed to invert transform space", bone.worldTransform);
			return;
		}
		
		if(this._InTarget)
		{
			const translation = this._InTarget.worldTranslation;
			vec2.transformMat2d(this._InPoint, translation, inverseWorld);
			vec2.normalize(this._InDirection, this._InPoint);
		}
		else if(parentBone)
		{
			if(parentBone._FirstBone === bone && parentBoneJelly && parentBoneJelly._OutTarget)
			{
				const translation = parentBoneJelly._OutTarget.worldTranslation;
				const localParentOut = vec2.transformMat2d(vec2.create(), translation, inverseWorld);
				vec2.normalize(localParentOut, localParentOut);
				vec2.negate(this._InDirection, localParentOut);
			}
			else
			{
				const d1 = vec2.set(vec2.create(), 1, 0);
				const d2 = vec2.set(vec2.create(), 1, 0);

				vec2.transformMat2(d1, d1, parentBone.worldTransform);
				vec2.transformMat2(d2, d2, bone.worldTransform);

				const sum = vec2.add(vec2.create(), d1, d2);
				const localIn = vec2.transformMat2(this._InDirection, sum, inverseWorld);
				vec2.normalize(localIn, localIn);
			}
			vec2.scale(this._InPoint, this._InDirection, this._EaseIn*bone._Length*CurveConstant);
		}
		else
		{			
			vec2.set(this._InDirection, 1, 0);
			vec2.set(this._InPoint, this._EaseIn*bone._Length*CurveConstant, 0);
		}

		if(this._OutTarget)
		{
			const translation = this._OutTarget.worldTranslation;
			vec2.transformMat2d(this._OutPoint, translation, inverseWorld);
			const tip = vec2.set(vec2.create(), bone._Length, 0.0);
			vec2.subtract(this._OutDirection, this._OutPoint, tip);
			vec2.normalize(this._OutDirection, this._OutDirection);
		}
		else if(bone._FirstBone)
		{
			const firstBone = bone._FirstBone;
			const firstBoneJelly = firstBone.jelly;
			if(firstBoneJelly && firstBoneJelly._InTarget)
			{
				const translation = firstBoneJelly._InTarget.worldTranslation;
				const worldChildInDir = vec2.subtract(vec2.create(), firstBone.worldTranslation, translation);
				vec2.transformMat2(this._OutDirection, worldChildInDir, inverseWorld);
			}
			else
			{
				const d1 = vec2.set(vec2.create(), 1, 0);
				const d2 = vec2.set(vec2.create(), 1, 0);

				vec2.transformMat2(d1, d1, firstBone.worldTransform);
				vec2.transformMat2(d2, d2, bone.worldTransform);

				const sum = vec2.add(vec2.create(), d1, d2);
				vec2.negate(sum, sum);
				vec2.transformMat2(this._OutDirection, sum, inverseWorld);
			}
			vec2.normalize(this._OutDirection, this._OutDirection);
			const scaledOut = vec2.scale(vec2.create(), this._OutDirection, this._EaseOut*bone._Length*CurveConstant);
			vec2.set(this._OutPoint, bone._Length, 0.0);
			vec2.add(this._OutPoint, this._OutPoint, scaledOut);
		}
		else
		{
			vec2.set(this._OutDirection, -1, 0);

			const scaledOut = vec2.scale(vec2.create(), this._OutDirection, this._EaseOut*bone._Length*CurveConstant);
			vec2.set(this._OutPoint, bone._Length, 0.0);
			vec2.add(this._OutPoint, this._OutPoint, scaledOut);
		}
		
		this.updateJellies();
	}
}