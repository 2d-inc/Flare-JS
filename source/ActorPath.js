import ActorSkinnable from "./ActorSkinnable.js";
import { ActorBasePath, makeRenderPoints } from "./ActorBasePath.js";
import ActorNode from "./ActorNode.js";
import { vec2, mat2d } from "gl-matrix";
import { PointType } from "./PathPoint.js";
import Graphics from "./Graphics.js";

const CircleConstant = 0.552284749831;
const InverseCircleConstant = 1.0 - CircleConstant;
const Identity = mat2d.create();

export default class ActorPath extends ActorBasePath(ActorSkinnable(ActorNode))
{
	constructor()
	{
		super();
		this._IsClosed = false;
		this._IsHidden = false;
		this._Points = [];
		this._RenderPath = null;
		this._IsRenderPathDirty = true;
	}

	get isHidden()
	{
		return this._IsHidden;
	}

	set isHidden(hidden)
	{
		this._IsHidden = hidden;
	}

	get isClosed()
	{
		return this._IsClosed;
	}

	set isClosed(closed)
	{
		this._IsClosed = closed;
	}

	initialize(actor, graphics)
	{
		this._RenderPath = graphics.makePath();
	}

	get numPoints()
	{
		return this._Points.length;
	}

	makeInstance(resetActor)
	{
		const node = new ActorPath();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._IsClosed = node._IsClosed;
		this._IsHidden = node._IsHidden;

		const pointCount = node._Points.length;
		this._Points = new Array(pointCount);
		for (let i = 0; i < pointCount; i++)
		{
			let p = node._Points[i];
			this._Points[i] = p.makeInstance();
		}
	}

	get deformedPoints()
	{
		let boneTransforms = null;
		if (this._Skin)
		{
			boneTransforms = this._Skin.boneMatrices;
		}
		const { _Points: points, worldTransform } = this;
		if (!boneTransforms)
		{
			return points;
		}

		const deformedPoints = [];
		for (const point of points)
		{
			deformedPoints.push(point.skin(worldTransform, boneTransforms));
		}
		return deformedPoints;
	}

	static makeRenderPoints(points, isClosed)
	{
		const renderPoints = [];

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
								let next = points[(i + 1) % pl];
								previous = previous.pointType === PointType.Straight ? previous.translation : previous.out;
								next = next.pointType === PointType.Straight ? next.translation : next.in;

								const pos = point.translation;

								const toPrev = vec2.subtract(vec2.create(), previous, pos);
								const toPrevLength = vec2.length(toPrev);
								toPrev[0] /= toPrevLength;
								toPrev[1] /= toPrevLength;

								const toNext = vec2.subtract(vec2.create(), next, pos);
								const toNextLength = vec2.length(toNext);
								toNext[0] /= toNextLength;
								toNext[1] /= toNextLength;

								const renderRadius = Math.min(toPrevLength, Math.min(toNextLength, radius));

								let translation = vec2.scaleAndAdd(vec2.create(), pos, toPrev, renderRadius);
								const current = {
									pointType: PointType.Disconnected,
									translation: translation,
									out: vec2.scaleAndAdd(vec2.create(), pos, toPrev, InverseCircleConstant * renderRadius),
									in: translation
								};
								renderPoints.push(current);

								translation = vec2.scaleAndAdd(vec2.create(), pos, toNext, renderRadius);

								previous = {
									pointType: PointType.Disconnected,
									translation: translation,
									in: vec2.scaleAndAdd(vec2.create(), pos, toNext, InverseCircleConstant * renderRadius),
									out: translation
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

	getPathRenderTransform()
	{
		if (!this.isConnectedToBones)
		{
			return this.worldTransform;
		}
		else
		{
			return Identity;
		}
	}

	getPathTransform()
	{
		if (!this.isConnectedToBones)
		{
			return this.worldTransform;
		}
		else
		{
			return Identity;
		}
	}

	invalidateDrawable()
	{
		this._IsRenderPathDirty = true;
		this._RenderPath.setIsVolatile(true);
		this.shape.invalidatePath();
	}

	getPath(graphics)
	{
		const { _RenderPath, _IsRenderPathDirty } = this;
		if (!_IsRenderPathDirty)
		{
			return _RenderPath;
		}

		_RenderPath.rewind();

		const { deformedPoints, isClosed } = this;
		const renderPoints = makeRenderPoints(deformedPoints, isClosed);
		return Graphics.pointPath(_RenderPath, renderPoints, isClosed);
	}
}