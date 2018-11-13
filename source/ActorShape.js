import ActorNode from "./ActorNode.js";
import ActorPath from "./ActorPath.js";
import ActorProceduralPath from "./ActorProceduralPath.js";
import {RadialGradientFill, GradientFill, ColorFill, ColorStroke, GradientStroke, RadialGradientStroke} from "./ColorComponent.js";

import {vec2, mat2d} from "gl-matrix";

export default class ActorShape extends ActorNode
{
	constructor()
	{
		super();
		this._DrawOrder = 0;
		this._IsHidden = false;

		this._Paths = null;
		this._Fills = null;
		this._Strokes = null;
	}

	get paths()
	{
		return this._Paths;
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
		for(const path of this._Children)
		{
			if (path.constructor !== ActorPath && !(path instanceof ActorProceduralPath))
			{
				continue;
			}

			if(path.numPoints < 2)
			{
				continue;
			}

			// This is the axis aligned bounding box in the space of the parent (this case our shape).
			const pathAABB = path.getPathAABB();

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

		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		if(!aabb)
		{
			return null;
		}
		let world = this._WorldTransform;
		//vec2.transformMat2d(vec2.create(), [], world);


		const points = [
			vec2.set(vec2.create(), aabb[0], aabb[1]),
			vec2.set(vec2.create(), aabb[2], aabb[1]),
			vec2.set(vec2.create(), aabb[2], aabb[3]),
			vec2.set(vec2.create(), aabb[0], aabb[3])
		];
		for(let i = 0; i < points.length; i++)
		{
			const pt = points[i];
			const wp = vec2.transformMat2d(pt, pt, world);
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

		const ctx = graphics.ctx;
		ctx.save();
		ctx.globalAlpha = this._RenderOpacity;
		this.clip(ctx);
		const shapePath = this.getShapePath();

		const {_Fills:fills, _Strokes:strokes} = this;
		
		if(fills)
		{
			for(const fill of fills)
			{
				fill.fill(ctx, shapePath);
			}
		}
		if(strokes)
		{
			for(const stroke of strokes)
			{
				if(stroke._Width > 0)
				{
					stroke.stroke(ctx, shapePath);
				}
			}
		}

		const aabb = this.computeAABB();
		if(aabb)
		{
			ctx.fillStyle = "rgba(255,0,0,0.25)";
			ctx.beginPath();
			ctx.moveTo(aabb[0], aabb[1]);
			ctx.lineTo(aabb[2], aabb[1]);
			ctx.lineTo(aabb[2], aabb[3]);
			ctx.lineTo(aabb[0], aabb[3]);
			ctx.closePath();
			ctx.fill();
		}
	}

	getShapePath()
	{
		const paths = this._Paths;
		const shapePath = new Path2D();
		for(const path of paths)
		{
			if(path.isHidden)
			{
				continue;
			}
			shapePath.addPath(path.getPath(), path.getPathTransform());
		}

		return shapePath;
	}

	clip(ctx)
	{
		// Find clips.
		let clipSearch = this;
		let clips = null;
		while(clipSearch)
		{
			if(clipSearch.clips)
			{
				clips = clipSearch.clips;
				break;
			}
			clipSearch = clipSearch.parent;
		}

		if(clips)
		{
			const path = new Path2D();
			for(let clip of clips)
			{
				let shapes = new Set();
				clip.all(function(node)
				{
					if(node.constructor === ActorShape)
					{
						shapes.add(node);
					}
				});
				for(let shape of shapes)
				{
					const paths = shape.paths;
					for(const path of paths)
					{
						path.addPath(path.getPath(), path.getPathTransform());
					}
				}
			}
			ctx.clip(path);
		}
	}

	drawShape(ctx, clip)
	{
		const shape = this.node;

		// Find clips.
		if(clip)
		{
			let clipSearch = this;
			let clips = null;
			while(clipSearch)
			{
				if(clipSearch._Clips)
				{
					clips = clipSearch._Clips;
					break;
				}
				clipSearch = clipSearch._Parent;
			}

			if(clips)
			{
				for(const clip of clips)
				{
					const shapes = new Set();
					clip.all(function(node)
					{
						if(node.constructor === ActorShape && !(node instanceof ActorProceduralPath))
						{
							shapes.add(node);
						}
					});
					for(const shape of shapes)
					{
						ctx.beginPath();
						for(const node of shape._Children)
						{
							if(node.constructor !== ActorPath && !(node instanceof ActorProceduralPath))
							{
								continue;
							}
							node.draw(ctx);
						}
					}
				}
				ctx.clip();
			}
		}

		ctx.beginPath();
		for(const path of this._Children)
		{
			if(path.constructor !== ActorPath && !(path instanceof ActorProceduralPath) || path.isHidden)
			{
				continue;
			}

			path.draw(ctx);
		}
	}

	completeResolve()
	{
		super.completeResolve();
		this._Paths = this._Children.filter(child => child.constructor === ActorPath || (child instanceof ActorProceduralPath));
	}	

	makeInstance(resetActor)
	{
		const node = new ActorShape();
		node._IsInstance = true;
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._DrawOrder = node._DrawOrder;
		this._IsHidden = node._IsHidden;
	}
}