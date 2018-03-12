import ActorTargetedConstraint from "./ActorTargetedConstraint.js";
import {vec2,mat2d} from "gl-matrix";
import ActorNode from "./ActorNode.js";
import ActorBone from "./ActorNode.js";
import { Decompose } from "./Decompose.js";

const PI2 = Math.PI*2;

export default class ActorIKConstraint extends ActorTargetedConstraint
{
	constructor(actor)
	{
		super(actor);

		this._InvertDirection = false;
		this._InfluencedBones = [];

		this._FKChain = null;
		this._BoneData = null;
	}

	makeInstance(resetActor)
	{
		let node = new ActorIKConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._InvertDirection = node._InvertDirection;
		this._InfluencedBones = [];
		if(node._InfluencedBones)
		{
			for (var i = 0; i < node._InfluencedBones.length; i++)
			{
				var ib = node._InfluencedBones[i];
				if(!ib)
				{
					continue;
				}
				if(ib.constructor === ActorBone)
				{
					this._InfluencedBones.push(ib._Idx);
				}
				else
				{
					this._InfluencedBones.push(ib);
				}
			}
		}
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);

		let bones = this._InfluencedBones;
		if(!bones || !bones.length)
		{
			return;
		}

		for(let j = 0; j < bones.length; j++)
		{
			let componentIndex = bones[j];
			if(componentIndex.constructor !== Number)
			{
				componentIndex = componentIndex._Idx;
			}
			let bone = components[componentIndex];
			bones[j] = bone;
		}
	}

	markDirty()
	{
		for(let item of this._FKChain)
		{
			item.bone.markTransformDirty();
		}
	}

	completeResolve()
	{
		super.completeResolve();
		
		let bones = this._InfluencedBones;
		if(!bones || !bones.length)
		{
			return;
		}

		// Initialize solver.
		let start = bones[0];
		let end = bones[bones.length-1];
		let chain = this._FKChain = [];
		let boneData = this._BoneData = [];
		while(end && end !== start._Parent)
		{
			chain.unshift({bone:end, ikAngle:0, transformComponents:new Float32Array(6), in:false});
			end = end._Parent;
		}

		let allIn = chain.length < 3;
		for(let i = 0; i < chain.length; i++)
		{
			let fk = chain[i];
			fk.idx = i;
			fk.in = allIn;
		}

		for(let bone of bones)
		{
			let fk = chain.find(fk => fk.bone === bone);
			if(!fk)
			{
				console.warn("Bone not in chain?", fk, bone);
				continue;
			}
			boneData.push(fk);
		}

		if(!allIn)
		{
			for(let i = 0; i < boneData.length-1; i++)
			{
				let fk = boneData[i];
				fk.in = true;
				chain[fk.idx+1].in = true;
			}
		}

		// Mark dependencies.
		let actor = this._Actor;
		for(let bone of bones)
		{
			// Don't mark dependency on parent as ActorComponent already does this.
			if(bone === this.parent)
			{
				continue;
			}
			actor.addDependency(this, bone);
		}
		if(this._Target)
		{
			actor.addDependency(this, this._Target);
		}

		// N.B. Dependency on target already set in ActorTargetedConstrain.

		// All the first level children of the influenced bones should depend on the final bone.
		if(chain.length)
		{
			let tip = chain[chain.length-1];
			for(let fk of chain)
			{
				if(fk === tip)
				{
					continue;
				}
				let bone = fk.bone;
				let children = bone._Children;
				for(let child of children)
				{
					if(!(child instanceof ActorNode))
					{
						continue;
					}
					let item = chain.find(item => item.bone === child);
					if(item)
					{
						// we are in the FK chain.
						continue;
					}
					actor.addDependency(child, tip.bone);
				}
			}
		}
	}

	constrain(tip)
	{
		const target = this._Target;
		if(target)
		{
			let wt = target.worldTransform;
			this.solve(vec2.set(vec2.create(), wt[4], wt[5]), this._Strength);
		}
	}

	solve1(fk1, worldTargetTranslation)
	{
		let iworld = fk1.parentWorldInverse;
		var pA = fk1.bone.worldTranslation;
		var pBT = vec2.copy(vec2.create(), worldTargetTranslation);

		// To target in worldspace
		let toTarget = vec2.subtract(vec2.create(), pBT, pA);
		// Note this is directional, hence not transformMat2d
		let toTargetLocal = vec2.transformMat2(vec2.create(), toTarget, iworld);
		var r = Math.atan2(toTargetLocal[1], toTargetLocal[0]);
		
		constrainRotation(fk1, r);
		fk1.ikAngle = r;

		return true;
	}

	solve2(fk1, fk2, worldTargetTranslation)
	{
		const invertDirection = this._InvertDirection;
		let b1 = fk1.bone;
		let b2 = fk2.bone;
		let chain = this._FKChain;
		let firstChild = chain[fk1.idx+1];

		let iworld = fk1.parentWorldInverse;

		var pA = b1.worldTranslation;
		var pC = firstChild.bone.worldTranslation;
		var pB = b2.tipWorldTranslation;
		var pBT = vec2.copy(vec2.create(), worldTargetTranslation);

		pA = vec2.transformMat2d(pA, pA, iworld);
		pC = vec2.transformMat2d(pC, pC, iworld);
		pB = vec2.transformMat2d(pB, pB, iworld);
		pBT = vec2.transformMat2d(pBT, pBT, iworld);

		// http://mathworld.wolfram.com/LawofCosines.html
		var av = vec2.subtract(vec2.create(), pB, pC);
		var a = vec2.length(av);

		var bv = vec2.subtract(vec2.create(), pC, pA);
		var b = vec2.length(bv);

		var cv = vec2.subtract(vec2.create(), pBT, pA);
		var c = vec2.length(cv);

		var A = Math.acos(Math.max(-1,Math.min(1,(-a*a+b*b+c*c)/(2*b*c))));
		var C = Math.acos(Math.max(-1, Math.min(1,(a*a+b*b-c*c)/(2*a*b))));

		let r1, r2;
		if(b2.parent != b1)
		{
			let secondChild = chain[fk1.idx+2];
			
			let iworld = secondChild.parentWorldInverse;

			pC = firstChild.bone.worldTranslation;
			pB = b2.tipWorldTranslation;

			let av = vec2.subtract(vec2.create(), pB, pC);
			let avLocal = vec2.transformMat2(vec2.create(), av, iworld);
			let angleCorrection = -Math.atan2(avLocal[1], avLocal[0]);

			if(invertDirection)
			{
				r1 = Math.atan2(cv[1],cv[0]) - A;
				r2 = -C+Math.PI + angleCorrection;
			}
			else
			{
				r1 = A + Math.atan2(cv[1],cv[0]);
				r2 = C-Math.PI + angleCorrection;
			}
		}
		else if(invertDirection)
		{
			r1 = Math.atan2(cv[1],cv[0]) - A;
			r2 = -C+Math.PI;
		}
		else
		{
			r1 = A + Math.atan2(cv[1],cv[0]);
			r2 = C-Math.PI;
		}

		constrainRotation(fk1, r1);
		constrainRotation(firstChild, r2);
		if(firstChild !== fk2)
		{
			let bone = fk2.bone;
			mat2d.mul(bone.worldTransform, bone.parent.worldTransform, bone.transform);
		}

		// Simple storage, need this for interpolation.
		fk1.ikAngle = r1;
		firstChild.ikAngle = r2;

		return true;
	}

	solve(worldTargetTranslation, strength)
	{
		let bones = this._BoneData;
		if(!bones.length)
		{
			return;
		}

		// Decompose the chain.
		let fkChain = this._FKChain;
		for(let i = 0; i < fkChain.length; i++)
		{
			let fk = fkChain[i];
			let parentWorld = fk.bone.parent.worldTransform;
			var parentWorldInverse = mat2d.invert(mat2d.create(), parentWorld);
			let local = mat2d.mul(fk.bone.transform, parentWorldInverse, fk.bone.worldTransform);
			Decompose(local, fk.transformComponents);
			fk.parentWorldInverse = parentWorldInverse;
		}

		if(bones.length === 1)
		{
			this.solve1(bones[0], worldTargetTranslation);
		}
		else if(bones.length == 2)
		{
			this.solve2(bones[0], bones[1], worldTargetTranslation);
		}
		else
		{
			let tip = bones[bones.length-1];
			for(let i = 0; i < bones.length-1; i++)
			{
				let fk = bones[i];
				this.solve2(fk, tip, worldTargetTranslation);
				for(let j = fk.idx+1; j < fkChain.length-1; j++)
				{
					let fk = fkChain[j];
					let parentWorld = fk.bone.parent.worldTransform;
					fk.parentWorldInverse = mat2d.invert(mat2d.create(), parentWorld);
				}
			}
		}

		// At the end, mix the FK angle with the IK angle by strength
		let m = strength;
		if(m != 1.0)
		{
			for(let fk of fkChain)
			{
				if(!fk.in)
				{
					let bone = fk.bone;
					mat2d.mul(bone.worldTransform, bone.parent.worldTransform, bone.transform);
					continue;
				}
				let fromAngle = fk.transformComponents[4]%PI2;
				let toAngle = fk.ikAngle%PI2;
				let diff = toAngle - fromAngle;
				if(diff > Math.PI)
				{
					diff -= PI2;
				}
				else if(diff < -Math.PI)
				{
					diff += PI2;
				}
				let angle = fromAngle + diff * m;
				constrainRotation(fk, angle);
			}
		}
	}
}

function constrainRotation(fk, rotation)
{
	let parentWorld = fk.bone.parent.worldTransform;

	let transform = fk.bone.transform;
	let c = fk.transformComponents;

	if(rotation === 0)
	{
		mat2d.identity(transform);
	}
	else
	{
		mat2d.fromRotation(transform, rotation);
	}
	// Translate
	transform[4] = c[0];
	transform[5] = c[1];
	// Scale
	let scaleX = c[2];
	let scaleY = c[3];
	transform[0] *= scaleX;
	transform[1] *= scaleX;
	transform[2] *= scaleY;
	transform[3] *= scaleY;
	// Skew
	let skew = c[5];
	if(skew !== 0)
	{
		transform[2] = transform[0] * skew + transform[2];
		transform[3] = transform[1] * skew + transform[3];
	}

	mat2d.mul(fk.bone.worldTransform, parentWorld, transform);
}
