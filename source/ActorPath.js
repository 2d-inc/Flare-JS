import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";
import {PathPoint, PointType} from "./PathPoint.js";

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
		for(var i = 0; i < points.length; i++)
		{
			var pt = points[i];
			var wp = vec2.transformMat2d(pt, pt, transform);
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
		var node = new ActorPath();
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
}