import ActorTargetedConstraint from "./ActorTargetedConstraint.js";
import { mat2d } from "gl-matrix";
import { Decompose, Compose } from "./Decompose.js";
import TransformSpace from "./TransformSpace.js";

const PI2 = Math.PI*2;

export default class ActorTransformConstraint extends ActorTargetedConstraint
{
	constructor(actor)
	{
		super(actor);

		this._SourceSpace = TransformSpace.World;
		this._DestSpace = TransformSpace.World;

		this._ComponentsA = new Float32Array(6);
		this._ComponentsB = new Float32Array(6);
	}

	makeInstance(resetActor)
	{
		let node = new ActorTransformConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._SourceSpace = node._SourceSpace;
		this._DestSpace = node._DestSpace;
	}

	constrain(tip)
	{
		let target = this._Target;
		if(!target)
		{
			return;
		}

		let parent = this._Parent;

		let { _ComponentsA:componentsA, _ComponentsB:componentsB, _Strength:t, _SourceSpace:sourceSpace, _DestSpace:destSpace } = this;

		let transformA = parent.worldTransform;
		let transformB = mat2d.clone(target.worldTransform);
		if(sourceSpace === TransformSpace.Local)
		{
			let grandParent = target.parent;
			if(grandParent)
			{
				let inverse = mat2d.invert(mat2d.create(), grandParent.worldTransform);
				transformB = mat2d.mul(inverse, inverse, transformB);
			}
		}
		if(destSpace === TransformSpace.Local)
		{
			let grandParent = parent.parent;
			if(grandParent)
			{
				mat2d.mul(transformB, grandParent.worldTransform, transformB);
			}
		}
		Decompose(transformA, componentsA);
		Decompose(transformB, componentsB);

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

		let ti = 1.0-t;

		componentsB[4] = angleA + diff * t;
		componentsB[0] = componentsA[0] * ti + componentsB[0] * t;
		componentsB[1] = componentsA[1] * ti + componentsB[1] * t;
		componentsB[2] = componentsA[2] * ti + componentsB[2] * t;
		componentsB[3] = componentsA[3] * ti + componentsB[3] * t;
		componentsB[5] = componentsA[5] * ti + componentsB[5] * t;

		Compose(parent.worldTransform, componentsB);
	}
}