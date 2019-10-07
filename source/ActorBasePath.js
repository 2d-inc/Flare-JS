import ActorShape from "./ActorShape.js";
import { PointType } from "./PathPoint.js";
import { vec2, mat2d } from "gl-matrix";

const CircleConstant = 0.552284749831;
const InverseCircleConstant = 1.0 - CircleConstant;

export const ActorBasePath = (ActorBasePath) => class extends ActorBasePath
{
	constructor(actor)
	{
		super(actor);
		this._Shape = null;
		this._IsRootPath = false;
	}

	get isRootPath() { return this._IsRootPath; }
	get shape() { return this._Shape; }
	get isConnectedToBones() { return false; }

	updateShape()
	{
		const { _Shape } = this;
		if (_Shape)
		{
			_Shape.removePath(this);
		}
		let shape = this.parent;
		while (shape && shape.constructor !== ActorShape)
		{
			shape = shape.parent;
		}
		this._Shape = shape;
		this._IsRootPath = shape === this.parent;
		if (shape)
		{
			shape.addPath(this);
		}
	}

	completeResolve()
	{
		super.completeResolve();
		this.updateShape();
	}

	getPathOBB()
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		const { deformedPoints, isClosed } = this;
		const renderPoints = makeRenderPoints(deformedPoints, isClosed);
		for (let point of renderPoints)
		{
			let t = point.translation;

			let x = t[0];
			let y = t[1];

			if (x < min_x)
			{
				min_x = x;
			}
			if (y < min_y)
			{
				min_y = y;
			}
			if (x > max_x)
			{
				max_x = x;
			}
			if (y > max_y)
			{
				max_y = y;
			}

			if (point.pointType !== PointType.Straight)
			{
				let t = point.in;
				x = t[0];
				y = t[1];
				if (x < min_x)
				{
					min_x = x;
				}
				if (y < min_y)
				{
					min_y = y;
				}
				if (x > max_x)
				{
					max_x = x;
				}
				if (y > max_y)
				{
					max_y = y;
				}

				t = point.out;
				x = t[0];
				y = t[1];
				if (x < min_x)
				{
					min_x = x;
				}
				if (y < min_y)
				{
					min_y = y;
				}
				if (x > max_x)
				{
					max_x = x;
				}
				if (y > max_y)
				{
					max_y = y;
				}
			}
		}

		return [min_x, min_y, max_x, max_y];
	}

	getPathAABB()
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		const obb = this.getPathOBB();

		const points = [
			vec2.fromValues(obb[0], obb[1]),
			vec2.fromValues(obb[2], obb[1]),
			vec2.fromValues(obb[2], obb[3]),
			vec2.fromValues(obb[0], obb[3])
		];
		let { _Transform: transform, isConnectedToBones, isRootPath } = this;

		if (isConnectedToBones)
		{
			// If we're connected to bones, convert the path coordinates into local parent space.
			transform = mat2d.invert(mat2d.create(), this.shape._WorldTransform);
		}
		else if (!isRootPath)
		{
			// Path isn't root, so get transform in shape space.
			let invert = mat2d.create();
			if (mat2d.invert(invert, this.shape._WorldTransform))
			{
				transform = mat2d.multiply(mat2d.create(), invert, this._WorldTransform);
			}
		}

		for (let i = 0; i < points.length; i++)
		{
			const pt = points[i];
			const wp = transform ? vec2.transformMat2d(pt, pt, transform) : pt;
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

		return [min_x, min_y, max_x, max_y];
	}
}

export function makeRenderPoints(points, isClosed)
{
	let renderPoints = [];

	if (points.length)
	{
		let pl = points.length;
		let previous = isClosed ? points[points.length - 1] : null;
		for (let i = 0; i < points.length; i++)
		{
			let point = points[i];

			switch (point.pointType)
			{
				case PointType.Straight:
				{
					const radius = point.radius;
					if (radius > 0)
					{
						if (!isClosed && (i === 0 || i === pl - 1))
						{
							renderPoints.push(point);
							previous = point;
						}
						else
						{
							//let previous = renderPoints[(i-1+pointLength)%pointLength];
							let next = points[(i + 1) % pl];
							//previous = points[i-1];
							previous = previous.pointType === PointType.Straight ? previous.translation : previous.out;
							next = next.pointType === PointType.Straight ? next.translation : next.in;

							let pos = point.translation;

							let toPrev = vec2.subtract(vec2.create(), previous, pos);
							let toPrevLength = vec2.length(toPrev);
							toPrev[0] /= toPrevLength;
							toPrev[1] /= toPrevLength;

							let toNext = vec2.subtract(vec2.create(), next, pos);
							let toNextLength = vec2.length(toNext);
							toNext[0] /= toNextLength;
							toNext[1] /= toNextLength;

							let renderRadius = Math.min(toPrevLength, Math.min(toNextLength, radius));

							let translation = vec2.scaleAndAdd(vec2.create(), pos, toPrev, renderRadius);
							let current = {
								e: true, // Mark this is an ephemeral point
								o: point.o || point,
								n: previous,
								pointType: PointType.Disconnected,
								translation: translation,
								out: vec2.scaleAndAdd(vec2.create(), pos, toPrev, InverseCircleConstant * renderRadius),
								in: translation //vec2.scaleAndAdd(vec2.create(), translation, toPrev, arcConstant*renderRadius)
							};
							renderPoints.push(current);

							translation = vec2.scaleAndAdd(vec2.create(), pos, toNext, renderRadius);

							previous = {
								e: true, // Mark this is an ephemeral point
								o: point.o || point,
								n: next,
								pointType: PointType.Disconnected,
								translation: translation,
								in: vec2.scaleAndAdd(vec2.create(), pos, toNext, InverseCircleConstant * renderRadius),
								out: translation //vec2.scaleAndAdd(vec2.create(), translation, toNext, arcConstant*renderRadius)
							};
							renderPoints.push(previous);
						}
					}
					else
					{
						renderPoints.push(point);
						previous = point;
					}
					break;
				}
				case PointType.Mirror:
				case PointType.Disconnected:
				case PointType.Asymmetric:
					renderPoints.push(point);
					previous = point;
					break;
			}
		}
	}
	return renderPoints;
}