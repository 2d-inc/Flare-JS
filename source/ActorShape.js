import ActorNode from "./ActorNode.js";
import ActorPath from "./ActorPath.js";
import {RadialGradientFill, GradientFill, ColorFill, ColorStroke, GradientStroke, RadialGradientStroke} from "./ColorComponent.js";

import {vec2, mat2d} from "gl-matrix";

export default class ActorShape extends ActorNode
{
	constructor()
	{
		super();
		this._DrawOrder = 0;
		this._IsHidden = false;

		this._Fills = null;
		this._Strokes = null;
	}

	addFill(fill)
	{
		if(!this._Fills)
		{
			this._Fills = [];
		}
		this._Fills.push(fill);
	}

	addStroke(stroke)
	{
		if(!this._Strokes)
		{
			this._Strokes = [];
		}
		this._Strokes.push(stroke);
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

	computeAABB()
	{
		let aabb = null;
		for(let path of this._Children)
		{
			if(path.constructor !== ActorPath)
			{
				continue;
			}

			// This is the axis aligned bounding box in the space of the parent (this case our shape).
			let pathAABB = path.getPathAABB();

			if(!aabb)
			{
				aabb = pathAABB;
			}
			else
			{
				// Combine.
				aabb[0] = Math.min(aabb[0], pathAABB[0]);
				aabb[1] = Math.min(aabb[1], pathAABB[1]);

				aabb[2] = Math.max(aabb[2], pathAABB[2]);
				aabb[3] = Math.max(aabb[3], pathAABB[3]);
			}
		}

		let world = this._WorldTransform;
		//vec2.transformMat2d(vec2.create(), [], world);

		var min_x = Number.MAX_VALUE;
		var min_y = Number.MAX_VALUE;
		var max_x = -Number.MAX_VALUE;
		var max_y = -Number.MAX_VALUE;

		var points = [
			vec2.set(vec2.create(), aabb[0], aabb[1]),
			vec2.set(vec2.create(), aabb[2], aabb[1]),
			vec2.set(vec2.create(), aabb[2], aabb[3]),
			vec2.set(vec2.create(), aabb[0], aabb[3])
		];
		for(var i = 0; i < points.length; i++)
		{
			var pt = points[i];
			var wp = vec2.transformMat2d(pt, pt, world);
			if(wp[0] < min_x)
			{
				min_x = wp[0];
			}
			if(wp[1] < min_y)
			{
				min_y = wp[1];
			}

			if(wp[0] > max_x)
			{
				max_x = wp[0];
			}
			if(wp[1] > max_y)
			{
				max_y = wp[1];
			}
		}

		return new Float32Array([min_x, min_y, max_x, max_y]);
	}

	dispose(actor, graphics)
	{

	}

	draw(graphics)
	{
		if(this._RenderCollapsed || this._IsHidden)
		{
			return;
		}

		let ctx = graphics.ctx;
		ctx.save();
		ctx.globalAlpha = this._RenderOpacity;
		this.drawShape(ctx, true);

		let {_Fills:fills, _Strokes:strokes} = this;
		
		let transform = this._WorldTransform;
		ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
		if(fills)
		{
			for(let fill of fills)
			{
				fill.fill(ctx);
			}
		}
		if(strokes)
		{
			for(let stroke of strokes)
			{
				if(stroke._Width > 0)
				{
					stroke.stroke(ctx);
				}
			}
		}

		ctx.restore();

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

	drawShape(ctx, clip)
	{
		let shape = this.node;

		// Find clips.
		// if(clip)
		// {
		// 	let clipSearch = this.node;
		// 	let clips = null;
		// 	while(clipSearch)
		// 	{
		// 		if(clipSearch.clips)
		// 		{
		// 			clips = clipSearch.clips;
		// 			break;
		// 		}
		// 		clipSearch = clipSearch.parent;
		// 	}

		// 	if(clips)
		// 	{
		// 		for(let clip of clips)
		// 		{
		// 			let shapes = new Set();
		// 			clip.all(function(node)
		// 			{
		// 				if(node.constructor === ActorShape)
		// 				{
		// 					shapes.add(node);
		// 				}
		// 			});
		// 			for(let shape of shapes)
		// 			{
		// 				ctx.beginPath();
		// 				for(let node of shape.children)
		// 				{
		// 					if(node.constructor !== ActorPath)
		// 					{
		// 						continue;
		// 					}
		// 					node.stageItem.drawPath(ctx);
		// 				}
		// 			}
		// 		}
		// 		ctx.clip();
		// 	}
		// }

		ctx.beginPath();
		for(let path of this._Children)
		{
			if(path.constructor !== ActorPath || path.isHidden)
			{
				continue;
			}

			path.draw(ctx);
		}
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