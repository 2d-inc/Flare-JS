import {vec2} from "gl-matrix";

export class PointType
{
	static get Straight()
	{
		return 0;
	}

	static get Mirror()
	{
		return 1;
	}

	static get Disconnected()
	{
		return 2;
	}

	static get Asymmetric()
	{
		return 3;
	}
}

export class PathPoint
{
	constructor()
	{
		this._PointType = PointType.Straight;
		this._Translation = vec2.create();
	}

	makeInstance()
	{
		return null;
	}

	copy(from)
	{
		vec2.copy(this._Translation, from._Translation);
	}
}

export class StraightPathPoint extends PathPoint
{
	constructor()
	{
		super();
		this._Radius = 0;
	}

	makeInstance()
	{
		var node = new StraightPathPoint();
		StraightPathPoint.prototype.copy.call(node, this);
		return node;	
	}

	copy(from)
	{
		super.copy(from);
		this._Radius = from._Radius;
	}
}

export class CubicPathPoint extends PathPoint
{
	constructor()
	{
		super();
		this._In = vec2.create();
		this._Out = vec2.create();
	}

	makeInstance()
	{
		var node = new StraightPathPoint();
		StraightPathPoint.prototype.copy.call(node, this);
		return node;	
	}

	copy(from)
	{
		super.copy(from);
		vec2.copy(this._In, from._In);
		vec2.copy(this._Out, from._Out);
	}
}