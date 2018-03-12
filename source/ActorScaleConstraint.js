import ActorAxisConstraint from "./ActorAxisConstraint.js";
import { vec2, mat2d } from "gl-matrix";
import TransformSpace from "./TransformSpace.js";
import { Decompose, Compose } from "./Decompose.js";

export default class ActorScaleConstraint extends ActorAxisConstraint
{
	constructor(actor)
	{
		super(actor);

		this._ComponentsA = new Float32Array(6);
		this._ComponentsB = new Float32Array(6);
	}

	makeInstance(resetActor)
	{
		let node = new ActorScaleConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	constrain(tip)
	{
		let target = this._Target;

		let parent = this._Parent;
		let grandParent = parent._Parent;

		let { _ComponentsA:componentsA, _ComponentsB:componentsB,_Strength:t, _SourceSpace:sourceSpace, _DestSpace:destSpace , _MinMaxSpace:minMaxSpace } = this;

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

			if(!this._CopyX)
			{
				componentsB[2] = destSpace === TransformSpace.Local ? 1.0 : componentsA[2];
			}
			else
			{
				componentsB[2] *= this._ScaleX;	
				if(this._Offset)
				{
					componentsB[2] *= parent._Scale[0];
				}
			}

			if(!this._CopyY)
			{
				componentsB[3] = destSpace === TransformSpace.Local ? 0.0 : componentsA[3];
			}
			else
			{
				componentsB[3] *= this._ScaleY;

				if(this._Offset)
				{
					componentsB[3] *= parent._Scale[1];
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
		if(this._EnableMaxX && componentsB[2] > this._MaxX)
		{
			componentsB[2] = this._MaxX;	
		}
		if(this._EnableMinX && componentsB[2] < this._MinX)
		{
			componentsB[2] = this._MinX;	
		}
		if(this._EnableMaxY && componentsB[3] > this._MaxY)
		{
			componentsB[3] = this._MaxY;	
		}
		if(this._EnableMinY && componentsB[3] < this._MinY)
		{
			componentsB[3] = this._MinY;	
		}
		if(clampLocal)
		{
			// Transform back to world.
			Compose(transformB, componentsB);
			mat2d.mul(transformB, grandParent.worldTransform, transformB);
			Decompose(transformB, componentsB);
		}

		let ti = 1.0-t;

		componentsB[4] = componentsA[4];
		componentsB[0] = componentsA[0];
		componentsB[1] = componentsA[1];
		componentsB[2] = componentsA[2] * ti + componentsB[2] * t;
		componentsB[3] = componentsA[3] * ti + componentsB[3] * t;
		componentsB[5] = componentsA[5];

		Compose(parent.worldTransform, componentsB);
	}
}