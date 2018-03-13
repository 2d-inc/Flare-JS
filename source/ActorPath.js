import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";

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