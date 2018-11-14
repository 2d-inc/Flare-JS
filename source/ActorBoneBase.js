import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";

export default class ActorBoneBase extends ActorNode
{
	constructor()
	{
		super();

		this._Length = 0;
	}

	get tipWorldTranslation()
	{
		const transform = mat2d.create();
		transform[4] = this._Length;
		mat2d.mul(transform, this._WorldTransform, transform);
		return vec2.set(vec2.create(), transform[4], transform[5]);
	}

	get length()
	{
		return this._Length;
	}

	set length(l)
	{
		if(this._Length === l)
		{
			return;
		}
		this._Length = l;
		this.markTransformDirty();
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._Length = node._Length;
	}

	get firstBone()
	{
		let children = this._Children;
		for(let child of children)
		{
			if(child instanceof ActorBoneBase)
			{
				return child;
			}
		}

		return null;
	}
}