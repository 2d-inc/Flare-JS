import ActorPath from "./ActorPath.js";
import ActorDrawable from "./ActorDrawable.js";
import ActorProceduralPath from "./ActorProceduralPath.js";
import DirtyFlags from "./DirtyFlags.js";
import {vec2} from "gl-matrix";
const {WorldTransformDirty} = DirtyFlags;

export default class ActorShape extends ActorDrawable
{
	constructor(actor)
	{
		super(actor);

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

	get stroke()
	{
		return this._Strokes && this._Strokes.length && this._Strokes[0];
	}

	initialize(actor, graphics)
	{
		
	}

	computeAABB()
	{
		const clips = this.getClips();
		if(clips.length)
		{
			let aabb = null;
			for(const clipList of clips)
			{
				for(const clip of clipList)
				{
					clip.all(function(node)
					{
						if(node.constructor === ActorShape)
						{
							let bounds = node.computeAABB();
							if(!aabb)
							{
								aabb = bounds;
							}
							else
							{
								if(bounds[0] < aabb[0])
								{
									aabb[0] = bounds[0];
								}
								if(bounds[1] < aabb[1])
								{
									aabb[1] = bounds[1];
								}
								if(bounds[2] > aabb[2])
								{
									aabb[2] = bounds[2];
								}
								if(bounds[3] > aabb[3])
								{
									aabb[3] = bounds[3];
								}
							}
						}
					});
				}
			}
			return aabb;
		}

		let aabb = null;
		let maxStroke = 0.0;
		if(this._Strokes)
		{
			for(const stroke of this._Strokes)
			{
				if(stroke.width > maxStroke)
				{
					maxStroke = stroke.width;
				}
			}
		}
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

		const padStroke = maxStroke/2.0;
		aabb[0] -= padStroke;
		aabb[1] -= padStroke;
		aabb[2] += padStroke;
		aabb[3] += padStroke;

		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		if(!aabb)
		{
			return null;
		}
		let world = this._WorldTransform;


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

		graphics.save();
		this.clip(graphics);
		const shapePath = this.getShapePath(graphics);

		const {_Fills:fills, _Strokes:strokes} = this;
		
		if(fills)
		{
			for(const fill of fills)
			{
				fill.fill(graphics, shapePath);
			}
		}
		if(strokes)
		{
			for(const stroke of strokes)
			{
				if(stroke._Width > 0)
				{
					stroke.stroke(graphics, shapePath);
				}
			}
		}
		
		graphics.restore();
	}

	invalidatePath()
	{
		const {stroke} = this;
		if(stroke)
		{
			stroke.markPathEffectsDirty();
		}
	}

	getShapePath(graphics)
	{
		const paths = this._Paths;
		const shapePath = graphics.makePath(true);
		for(const path of paths)
		{
			if(path.isHidden)
			{
				continue;
			}
			graphics.addPath(shapePath, path.getPath(graphics), path.getPathTransform());
		}

		return shapePath;
	}

	update(dirt)
	{
		super.update(dirt);
		if((dirt & WorldTransformDirty) === WorldTransformDirty)
		{
			this.invalidatePath();
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
}