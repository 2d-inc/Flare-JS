import ActorTargetedConstraint from "./ActorTargetedConstraint.js";
import { vec2, mat2d } from "gl-matrix";
import { Decompose, Compose } from "./Decompose.js";
import TransformSpace from "./TransformSpace.js";

const PI2 = Math.PI*2;

export default class ActorRotationConstraint extends ActorTargetedConstraint
{
	constructor(actor)
	{
		super(actor);

		this._Copy = false;
		this._EnableMin = false;
		this._EnableMax = false;
		this._Offset = false;

		this._Min = -PI2;
		this._Max = PI2;
		this._Scale = 1.0;

		this._SourceSpace = TransformSpace.World;
		this._DestSpace = TransformSpace.World;
		this._MinMaxSpace = TransformSpace.World;

		this._ComponentsA = new Float32Array(6);
		this._ComponentsB = new Float32Array(6);

	}

	onDirty(dirt)
	{
		this.markDirty();
	}

	makeInstance(resetActor)
	{
		let node = new ActorRotationConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Copy = node._Copy;
		this._EnableMin = node._EnableMin;
		this._EnableMax = node._EnableMax;
		this._Offset = node._Offset;

		this._Min = node._Min;
		this._Max = node._Max;
		this._Scale = node._Scale;

		this._SourceSpace = node._SourceSpace;
		this._DestSpace = node._DestSpace;
		this._MinMaxSpace = node._MinMaxSpace;
	}

	constrain(tip)
	{
		let target = this._Target;

		let parent = this._Parent;
		let grandParent = parent._Parent;

		let { _ComponentsA:componentsA, _ComponentsB:componentsB, _Strength:t, _SourceSpace:sourceSpace, _DestSpace:destSpace , _MinMaxSpace:minMaxSpace } = this;


		let transformA = parent.worldTransform;
		let transformB = mat2d.create();
		Decompose(transformA, componentsA);
		if(!target)
		{
			mat2d.copy(transformB, transformA);
			componentsB[0] = componentsA[0];
			componentsB[1] = componentsA[1];
			componentsB[2] = componentsA[2];
			componentsB[3] = componentsA[3];
			componentsB[4] = componentsA[4];
			componentsB[5] = componentsA[5];
		}
		else
		{
			mat2d.copy(transformB, target.worldTransform);
			if(sourceSpace === TransformSpace.Local)
			{
				let sourceGrandParent = target.parent;
				if(sourceGrandParent)
				{
					let inverse = mat2d.invert(mat2d.create(), sourceGrandParent.worldTransform);
					transformB = mat2d.mul(inverse, inverse, transformB);
				}
			}
			Decompose(transformB, componentsB);

			if(!this._Copy)
			{
				componentsB[4] = destSpace === TransformSpace.Local ? 0.0 : componentsA[4];
			}
			else
			{
				componentsB[4] *= this._Scale;	
				if(this._Offset)
				{
					componentsB[4] += parent._Rotation;
				}
			}

			if(destSpace === TransformSpace.Local)
			{
				// Destination space is in parent transform coordinates.
				// Recompose the parent local transform and get it in world, then decompose the world for interpolation.
				if(grandParent)
				{
					Compose(transformB, componentsB);
					mat2d.mul(transformB, grandParent.worldTransform, transformB);
					Decompose(transformB, componentsB);
				}
			}
		}
		
		let clampLocal = (minMaxSpace === TransformSpace.Local && grandParent) ? true : false;
		if(clampLocal)
		{
			// Apply min max in local space, so transform to local coordinates first.
			Compose(transformB, componentsB);
			let inverse = mat2d.invert(mat2d.create(), grandParent.worldTransform);
			mat2d.mul(transformB, inverse, transformB);
			Decompose(transformB, componentsB);
		}
		if(this._EnableMax && componentsB[4] > this._Max)
		{
			componentsB[4] = this._Max;
		}
		if(this._EnableMin && componentsB[4] < this._Min)
		{
			componentsB[4] = this._Min;
		}
		if(clampLocal)
		{
			// Transform back to world.
			Compose(transformB, componentsB);
			mat2d.mul(transformB, grandParent.worldTransform, transformB);
			Decompose(transformB, componentsB);
		}

		let angleA = componentsA[4]%PI2;
		let angleB = componentsB[4]%PI2;
		let diff = angleB - angleA;
		if(diff > Math.PI)
		{
			diff -= PI2;
		}
		else if(diff < -Math.PI)
		{
			diff += PI2;
		}

		componentsB[4] = angleA + diff * t;
		componentsB[0] = componentsA[0];
		componentsB[1] = componentsA[1];
		componentsB[2] = componentsA[2];
		componentsB[3] = componentsA[3];
		componentsB[5] = componentsA[5];

		Compose(parent.worldTransform, componentsB);
	}
}