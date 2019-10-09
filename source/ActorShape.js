import ActorDrawable from "./ActorDrawable.js";
import DirtyFlags from "./DirtyFlags.js";
import { vec2, mat2d } from "gl-matrix";
const { WorldTransformDirty } = DirtyFlags;

export default class ActorShape extends ActorDrawable
{
	constructor(actor)
	{
		super(actor);

		this._Paths = [];
		this._Fills = null;
		this._Strokes = null;
		this._TransformAffectsStroke = false;
	}

	get fill()
	{
		const { _Fills } = this;
		return (_Fills && _Fills.length && _Fills[0]) || null;
	}

	get transformAffectsStroke()
	{
		return this._TransformAffectsStroke;
	}

	get paths()
	{
		return this._Paths;
	}

	addFill(fill)
	{
		if (!this._Fills)
		{
			this._Fills = [];
		}
		this._Fills.push(fill);
	}

	addStroke(stroke)
	{
		if (!this._Strokes)
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
		if (clips.length)
		{
			let aabb = null;
			for (const clipList of clips)
			{
				for (const clip of clipList)
				{
					const { node } = clip;
					if (!node)
					{
						continue;
					}
					node.all(function(node)
					{
						if (node.constructor === ActorShape)
						{
							let bounds = node.computeAABB();
							if (!aabb)
							{
								aabb = bounds;
							}
							else
							{
								if (bounds[0] < aabb[0])
								{
									aabb[0] = bounds[0];
								}
								if (bounds[1] < aabb[1])
								{
									aabb[1] = bounds[1];
								}
								if (bounds[2] > aabb[2])
								{
									aabb[2] = bounds[2];
								}
								if (bounds[3] > aabb[3])
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
		if (this._Strokes)
		{
			for (const stroke of this._Strokes)
			{
				if (stroke.width > maxStroke)
				{
					maxStroke = stroke.width;
				}
			}
		}
		for (const path of this._Paths)
		{
			if (path.numPoints < 2)
			{
				continue;
			}

			// This is the axis aligned bounding box in the space of the parent (this case our shape).
			const pathAABB = path.getPathAABB();

			if (!aabb)
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

		const padStroke = maxStroke / 2.0;
		aabb[0] -= padStroke;
		aabb[1] -= padStroke;
		aabb[2] += padStroke;
		aabb[3] += padStroke;

		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		if (!aabb)
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
		for (let i = 0; i < points.length; i++)
		{
			const pt = points[i];
			const wp = vec2.transformMat2d(pt, pt, world);
			if (wp[0] < min_x)
			{
				min_x = wp[0];
			}
			if (wp[1] < min_y)
			{
				min_y = wp[1];
			}

			if (wp[0] > max_x)
			{
				max_x = wp[0];
			}
			if (wp[1] > max_y)
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
		if (this._RenderCollapsed || this._IsHidden)
		{
			return;
		}

		graphics.save();
		this.clip(graphics);
		const { _TransformAffectsStroke, worldTransform } = this;
		const shapePath = _TransformAffectsStroke ? this.getShapePathLocal(graphics) : this.getShapePath(graphics);
		if (_TransformAffectsStroke)
		{
			graphics.transform(worldTransform);
		}
		const { _Fills: fills, _Strokes: strokes } = this;

		if (fills)
		{
			for (const fill of fills)
			{
				fill.fill(graphics, shapePath);
			}
		}
		if (strokes)
		{
			for (const stroke of strokes)
			{
				if (stroke._Width > 0)
				{
					stroke.stroke(graphics, shapePath);
				}
			}
		}

		graphics.restore();
	}

	invalidatePath()
	{
		const { stroke } = this;
		if (stroke)
		{
			stroke.markPathEffectsDirty();
		}
	}

	getShapePath(graphics)
	{
		const paths = this._Paths;
		const shapePath = graphics.makePath(true);
		for (const path of paths)
		{
			if (path.isHidden)
			{
				continue;
			}
			graphics.addPath(shapePath, path.getPath(graphics), path.getPathTransform());
		}

		return shapePath;
	}

	getShapePathLocal(graphics)
	{
		const paths = this._Paths;
		const shapePath = graphics.makePath(true);
		const { worldTransform } = this;
		const inverse = mat2d.create();
		if (!mat2d.invert(inverse, worldTransform))
		{
			return shapePath;
		}
		for (const path of paths)
		{
			if (path.isHidden)
			{
				continue;
			}
			const t = mat2d.mul(mat2d.create(), inverse, path.getPathTransform());
			graphics.addPath(shapePath, path.getPath(graphics), t);
		}

		return shapePath;
	}

	update(dirt)
	{
		super.update(dirt);
		if ((dirt & WorldTransformDirty) === WorldTransformDirty)
		{
			this.invalidatePath();
		}
	}

	addPath(path)
	{
		const { _Paths } = this;
		const idx = _Paths.indexOf(path);
		if (idx !== -1)
		{
			return false;
		}
		_Paths.push(path);
		return true;
	}

	removePath(path)
	{
		const { _Paths } = this;
		const idx = _Paths.indexOf(path);
		if (idx !== -1)
		{
			_Paths.splice(idx, 1);
			return true;
		}
		return false;
	}

	makeInstance(resetActor)
	{
		const node = new ActorShape();
		node._IsInstance = true;
		node.copy(this, resetActor);
		return node;
	}

	copy(from, resetActor)
	{
		super.copy(from, resetActor);
		this._TransformAffectsStroke = from._TransformAffectsStroke;
	}
}