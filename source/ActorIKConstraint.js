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
			for (let i = 0; i < node._InfluencedBones.length; i++)
			{
				const ib = node._InfluencedBones[i];
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

		const bones = this._InfluencedBones;
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
			const bone = components[componentIndex];
			bones[j] = bone;

			// Mark peer constraints, N.B. that we're not adding it to the parent bone
			// as we're constraining it anyway.
			if(bone !== this.parent)
			{
				bone.addPeerConstraint(this);
			}
		}
	}

	markDirty()
	{
		const {_FKChain} = this;
		if(_FKChain === null) { return; }
		for(const item of _FKChain)
		{
			item.bone.markTransformDirty();
		}
	}

	completeResolve()
	{
		super.completeResolve();
		
		const bones = this._InfluencedBones;
		if(!bones || !bones.length)
		{
			return;
		}

		// Initialize solver.
		const start = bones[0];
		let end = bones[bones.length-1];
		const chain = this._FKChain = [];
		const boneData = this._BoneData = [];
		while(end && end !== start._Parent)
		{
			chain.unshift({bone:end, ikAngle:0, transformComponents:new Float32Array(6), in:false});
			end = end._Parent;
		}

		const allIn = chain.length < 3;
		for(let i = 0; i < chain.length; i++)
		{
			let fk = chain[i];
			fk.idx = i;
			fk.in = allIn;
		}

		for(const bone of bones)
		{
			const fk = chain.find(fk => fk.bone === bone);
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
				const fk = boneData[i];
				fk.in = true;
				chain[fk.idx+1].in = true;
			}
		}

		// Mark dependencies.
		const actor = this._Actor;
		for(const bone of bones)
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
			const tip = chain[chain.length-1];
			for(const fk of chain)
			{
				if(fk === tip)
				{
					continue;
				}
				const bone = fk.bone;
				const children = bone._Children;
				for(const child of children)
				{
					if(!(child instanceof ActorNode))
					{
						continue;
					}
					const item = chain.find(item => item.bone === child);
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
			const wt = target.worldTransform;
			this.solve(vec2.set(vec2.create(), wt[4], wt[5]), this._Strength);
		}
	}

	solve1(fk1, worldTargetTranslation)
	{
		const iworld = fk1.parentWorldInverse;
		const pA = fk1.bone.worldTranslation;
		const pBT = vec2.copy(vec2.create(), worldTargetTranslation);

		// To target in worldspace
		const toTarget = vec2.subtract(vec2.create(), pBT, pA);
		// Note this is directional, hence not transformMat2d
		const toTargetLocal = vec2.transformMat2(vec2.create(), toTarget, iworld);
		const r = Math.atan2(toTargetLocal[1], toTargetLocal[0]);
		
		constrainRotation(fk1, r);
		fk1.ikAngle = r;

		return true;
	}

	solve2(fk1, fk2, worldTargetTranslation)
	{
		const invertDirection = this._InvertDirection;
		const b1 = fk1.bone;
		const b2 = fk2.bone;
		const chain = this._FKChain;
		const firstChild = chain[fk1.idx+1];

		const iworld = fk1.parentWorldInverse;

		let pA = b1.worldTranslation;
		let pC = firstChild.bone.worldTranslation;
		let pB = b2.tipWorldTranslation;
		let pBT = vec2.copy(vec2.create(), worldTargetTranslation);

		pA = vec2.transformMat2d(pA, pA, iworld);
		pC = vec2.transformMat2d(pC, pC, iworld);
		pB = vec2.transformMat2d(pB, pB, iworld);
		pBT = vec2.transformMat2d(pBT, pBT, iworld);

		// http://mathworld.wolfram.com/LawofCosines.html
		const av = vec2.subtract(vec2.create(), pB, pC);
		const a = vec2.length(av);

		const bv = vec2.subtract(vec2.create(), pC, pA);
		const b = vec2.length(bv);

		const cv = vec2.subtract(vec2.create(), pBT, pA);
		const c = vec2.length(cv);

		const A = Math.acos(Math.max(-1,Math.min(1,(-a*a+b*b+c*c)/(2*b*c))));
		const C = Math.acos(Math.max(-1, Math.min(1,(a*a+b*b-c*c)/(2*a*b))));

		let r1, r2;
		if(b2.parent != b1)
		{
			const secondChild = chain[fk1.idx+2];
			
			const iworld = secondChild.parentWorldInverse;

			pC = firstChild.bone.worldTranslation;
			pB = b2.tipWorldTranslation;

			const av = vec2.subtract(vec2.create(), pB, pC);
			const avLocal = vec2.transformMat2(vec2.create(), av, iworld);
			const angleCorrection = -Math.atan2(avLocal[1], avLocal[0]);

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
			const bone = fk2.bone;
			mat2d.mul(bone.worldTransform, bone.parent.worldTransform, bone.transform);
		}

		// Simple storage, need this for interpolation.
		fk1.ikAngle = r1;
		firstChild.ikAngle = r2;

		return true;
	}

	solve(worldTargetTranslation, strength)
	{
		const bones = this._BoneData;
		if(!bones.length)
		{
			return;
		}

		// Decompose the chain.
		const fkChain = this._FKChain;
		for(let i = 0; i < fkChain.length; i++)
		{
			const fk = fkChain[i];
			const parentWorld = fk.bone.parent.worldTransform;
			const parentWorldInverse = mat2d.invert(mat2d.create(), parentWorld);
			const local = mat2d.mul(fk.bone.transform, parentWorldInverse, fk.bone.worldTransform);
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
			const tip = bones[bones.length-1];
			for(let i = 0; i < bones.length-1; i++)
			{
				const fk = bones[i];
				this.solve2(fk, tip, worldTargetTranslation);
				for(let j = fk.idx+1; j < fkChain.length-1; j++)
				{
					const fk = fkChain[j];
					const parentWorld = fk.bone.parent.worldTransform;
					fk.parentWorldInverse = mat2d.invert(mat2d.create(), parentWorld);
				}
			}
		}

		// At the end, mix the FK angle with the IK angle by strength
		const m = strength;
		if(m != 1.0)
		{
			for(const fk of fkChain)
			{
				if(!fk.in)
				{
					const bone = fk.bone;
					mat2d.mul(bone.worldTransform, bone.parent.worldTransform, bone.transform);
					continue;
				}
				const fromAngle = fk.transformComponents[4]%PI2;
				const toAngle = fk.ikAngle%PI2;
				let diff = toAngle - fromAngle;
				if(diff > Math.PI)
				{
					diff -= PI2;
				}
				else if(diff < -Math.PI)
				{
					diff += PI2;
				}
				const angle = fromAngle + diff * m;
				constrainRotation(fk, angle);
			}
		}
	}
}

function constrainRotation(fk, rotation)
{
	const parentWorld = fk.bone.parent.worldTransform;

	const transform = fk.bone.transform;
	const c = fk.transformComponents;

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
	const scaleX = c[2];
	const scaleY = c[3];
	transform[0] *= scaleX;
	transform[1] *= scaleX;
	transform[2] *= scaleY;
	transform[3] *= scaleY;
	// Skew
	const skew = c[5];
	if(skew !== 0)
	{
		transform[2] = transform[0] * skew + transform[2];
		transform[3] = transform[1] * skew + transform[3];
	}

	mat2d.mul(fk.bone.worldTransform, parentWorld, transform);
}
