import ActorAxisConstraint from "./ActorAxisConstraint.js";
import { vec2, mat2d } from "gl-matrix";
import TransformSpace from "./TransformSpace.js";

export default class ActorTranslationConstraint extends ActorAxisConstraint
{
	constructor(actor)
	{
		super(actor);
	}

	makeInstance(resetActor)
	{
		let node = new ActorTranslationConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	constrain(tip)
	{
		let target = this._Target;

		let parent = this._Parent;
		let grandParent = parent._Parent;

		let { _Strength:t, _SourceSpace:sourceSpace, _DestSpace:destSpace , _MinMaxSpace:minMaxSpace } = this;

		let transformA = parent.worldTransform;
		let translationA = vec2.set(vec2.create(), transformA[4], transformA[5]);
		let translationB = vec2.create();
		if(!target)
		{
			vec2.copy(translationB, translationA);
		}
		else
		{
			let transformB = mat2d.clone(target.worldTransform);
			if(sourceSpace === TransformSpace.Local)
			{
				let sourceGrandParent = target.parent;
				if(sourceGrandParent)
				{
					let inverse = mat2d.invert(mat2d.create(), sourceGrandParent.worldTransform);
					transformB = mat2d.mul(inverse, inverse, transformB);
				}
			}
			vec2.set(translationB, transformB[4], transformB[5]);

			if(!this._CopyX)
			{
				translationB[0] = destSpace === TransformSpace.Local ? 0.0 : translationA[0];
			}
			else
			{
				translationB[0] *= this._ScaleX;	
				if(this._Offset)
				{
					translationB[0] += parent._Translation[0];
				}
			}

			if(!this._CopyY)
			{
				translationB[1] = destSpace === TransformSpace.Local ? 0.0 : translationA[1];
			}
			else
			{
				translationB[1] *= this._ScaleY;

				if(this._Offset)
				{
					translationB[1] += parent._Translation[1];
				}
			}

			if(destSpace === TransformSpace.Local)
			{
				// Destination space is in parent transform coordinates.
				if(grandParent)
				{
					vec2.transformMat2d(translationB, translationB, grandParent.worldTransform);
				}
			}
		}
		
		let clampLocal = (minMaxSpace === TransformSpace.Local && grandParent) ? true : false;
		if(clampLocal)
		{
			// Apply min max in local space, so transform to local coordinates first.
			let temp = mat2d.invert(mat2d.create(), grandParent.worldTransform);
			// Get our target world coordinates in parent local.
			vec2.transformMat2d(translationB, translationB, temp);
		}
		if(this._EnableMaxX && translationB[0] > this._MaxX)
		{
			translationB[0] = this._MaxX;	
		}
		if(this._EnableMinX && translationB[0] < this._MinX)
		{
			translationB[0] = this._MinX;	
		}
		if(this._EnableMaxY && translationB[1] > this._MaxY)
		{
			translationB[1] = this._MaxY;	
		}
		if(this._EnableMinY && translationB[1] < this._MinY)
		{
			translationB[1] = this._MinY;	
		}
		if(clampLocal)
		{
			// Transform back to world.
			vec2.transformMat2d(translationB, translationB, grandParent.worldTransform);
		}

		let ti = 1.0-t;

		// Just interpolate world translation
		transformA[4] = translationA[0] * ti + translationB[0] * t;
		transformA[5] = translationA[1] * ti + translationB[1] * t;
	}
}