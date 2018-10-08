import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";
import {PathPoint, PointType} from "./PathPoint.js";

const CircleConstant = 0.552284749831;
const InverseCircleConstant = 1.0-CircleConstant;

export default class ActorPath extends ActorNode
{
	constructor()
	{
		super();
		this._IsClosed = false;
		this._IsHidden = false;
		this._Points = [];
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
		
	}

	getPathOBB()
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		for(let point of this._Points)
		{
			let t = point.translation;
			let x = t[0];
			let y = t[1];
			if(x < min_x)
			{
				min_x = x;
			}
			if(y < min_y)
			{
				min_y = y;
			}
			if(x > max_x)
			{
				max_x = x;
			}
			if(y > max_y)
			{
				max_y = y;
			}

			if(point.pointType !== PointType.Straight)
			{
				let t = point.in;
				x = t[0];
				y = t[1];
				if(x < min_x)
				{
					min_x = x;
				}
				if(y < min_y)
				{
					min_y = y;
				}
				if(x > max_x)
				{
					max_x = x;
				}
				if(y > max_y)
				{
					max_y = y;
				}

				t = point.out;
				x = t[0];
				y = t[1];
				if(x < min_x)
				{
					min_x = x;
				}
				if(y < min_y)
				{
					min_y = y;
				}
				if(x > max_x)
				{
					max_x = x;
				}
				if(y > max_y)
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


		let obb = this.getPathOBB();

		let points = [
			vec2.fromValues(obb[0], obb[1]),
			vec2.fromValues(obb[2], obb[1]),
			vec2.fromValues(obb[2], obb[3]),
			vec2.fromValues(obb[0], obb[3])
		];
		let transform = this._Transform;
		for(let i = 0; i < points.length; i++)
		{
			const pt = points[i];
			const wp = vec2.transformMat2d(pt, pt, transform);
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

		return [min_x, min_y, max_x, max_y];
	}


	resolveComponentIndices(components)
	{
		ActorNode.prototype.resolveComponentIndices.call(this, components);
	}

	makeInstance(resetActor)
	{
		const node = new ActorPath();
		ActorPath.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._IsClosed = node._IsClosed;
		this._IsHidden = node._IsHidden;

		const pointCount = node._Points.length;
		this._Points = new Array(pointCount);
		for(let i = 0; i < pointCount; i++)
		{
			let p = node._Points[i];
			this._Points[i] = p.makeInstance();
		}
	}

	draw(ctx)
	{
		let transform = this._WorldTransform;
		ctx.save();
		ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

		let points = this._Points;

		if(points.length)
		{
			let renderPoints = [];
			let pl = points.length;
			const isClosed = this._IsClosed;
			let previous = isClosed ? points[points.length-1] : null;
			for(let i = 0; i < points.length; i++)
			{
				let point = points[i];
				
				switch(point.pointType)
				{
					case PointType.Straight:
					{
						const radius = point.radius;
						if(radius > 0)
						{
							if(!isClosed && (i === 0 || i === pl-1))
							{
								renderPoints.push(point);
								previous = point;
							}
							else
							{
								let next = points[(i+1)%pl];
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
								renderPoints.push({
									pointType:PointType.Disconnected,
									translation:translation,
									out:vec2.scaleAndAdd(vec2.create(), pos, toPrev, InverseCircleConstant*renderRadius),
									in:translation//vec2.scaleAndAdd(vec2.create(), translation, toPrev, arcConstant*renderRadius)
								});

								translation = vec2.scaleAndAdd(vec2.create(), pos, toNext, renderRadius);

								previous = {
									pointType:PointType.Disconnected,
									translation:translation,
									in:vec2.scaleAndAdd(vec2.create(), pos, toNext, InverseCircleConstant*renderRadius),
									out:translation//vec2.scaleAndAdd(vec2.create(), translation, toNext, arcConstant*renderRadius)
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
			let firstPoint = renderPoints[0];
			ctx.moveTo(firstPoint.translation[0], firstPoint.translation[1]);
			for(let i = 0, l = isClosed ? renderPoints.length : renderPoints.length-1, pl = renderPoints.length; i < l; i++)
			{
				let point = renderPoints[i];
				let nextPoint = renderPoints[(i+1)%pl];
				let cin = nextPoint.pointType === PointType.Straight ? null : nextPoint.in, cout = point.pointType === PointType.Straight ? null : point.out;
				if(cin === null && cout === null)
				{
					ctx.lineTo(nextPoint.translation[0], nextPoint.translation[1]);	
				}
				else
				{
					if(cout === null)
					{
						cout = point.translation;
					}
					if(cin === null)
					{
						cin = nextPoint.translation;
					}
					ctx.bezierCurveTo(
						cout[0], cout[1],

						cin[0], cin[1],

						nextPoint.translation[0], nextPoint.translation[1]);
				}
			}
			if(isClosed)
			{
				ctx.closePath();
			}
		}
		ctx.restore();	
	}
}