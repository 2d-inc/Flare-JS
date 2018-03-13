import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";

export default class ActorShape extends ActorNode
{
	constructor()
	{
		super();
		this._DrawOrder = 0;
		this._IsHidden = false;
	}

	get isHidden()
	{
		return this._IsHidden;
	}

	set isHidden(hidden)
	{
		this._IsHidden = hidden;
	}

	initialize(actor, graphics)
	{
		
	}

	draw(graphics)
	{
		if(this._RenderCollapsed || this._IsHidden)
		{
			return;
		}

		// var t = this._WorldTransform;
		// switch(this._BlendMode)
		// {
		// 	case ActorShape.BlendModes.Normal:
		// 		graphics.enableBlending();
		// 		break;
		// 	case ActorShape.BlendModes.Multiply:
		// 		graphics.enableMultiplyBlending();
		// 		break;
		// 	case ActorShape.BlendModes.Screen:
		// 		graphics.enableScreenBlending();
		// 		break;
		// 	case ActorShape.BlendModes.Additive:
		// 		graphics.enableAdditiveBlending();
		// 		break;

		// }

		// let uvBuffer =  this._SequenceUVBuffer || null;
		// let uvOffset;
		// if(this._SequenceUVBuffer)
		// {
		// 	let numFrames = this._SequenceFrames.length;
		// 	let frame = this._SequenceFrame%numFrames;
		// 	if(uvOffset < 0)
		// 	{
		// 		frame += numFrames;
		// 	}
		// 	uvOffset = this._SequenceFrames[frame].offset;
		// }

		// graphics.prep(this._Texture, White, this._RenderOpacity, t, this._VertexBuffer, this._ConnectedBones ? this._BoneMatrices : null, this._DeformVertexBuffer, uvBuffer, uvOffset);
		// graphics.draw(this._IndexBuffer);
	}

	resolveComponentIndices(components)
	{
		ActorNode.prototype.resolveComponentIndices.call(this, components);
	}

	makeInstance(resetActor)
	{
		var node = new ActorShape();
		node._IsInstance = true;
		ActorShape.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._DrawOrder = node._DrawOrder;
		this._IsHidden = node._IsHidden;
	}
}