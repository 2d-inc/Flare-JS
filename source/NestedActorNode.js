import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";

export default class NestedActorNode extends ActorNode
{
	constructor()
	{
		super();

		this._DrawOrder = 0;
		this._Asset = null;
		this._Instance = null;
		this._Actor = null;
	}

	makeInstance(resetActor)
	{
		var node = new NestedActorNode();
		node.copy(this, resetActor);
		
		if(this._Asset.actor)
		{
			node._Actor = this._Asset.actor.makeInstance();
		}
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._Asset = node._Asset;
		this._DrawOrder = node._DrawOrder;
	}

	initialize(actor, graphics)
	{
		if(this._Actor)
		{
			this._Actor.initialize(graphics);
		}
	}

	updateWorldTransform()
	{
		super.updateWorldTransform();
		if(this._Actor)
		{
			this._Actor.root.overrideWorldTransform(this._WorldTransform);
		}
	}

	computeAABB()
	{
		if(this._Actor)
		{
			return this._Actor.computeAABB();
		}	
		return null;
	}

	draw(graphics)
	{
		if(this._Actor)
		{
			this._Actor.draw(graphics);
		}
	}

	advance(seconds)
	{
		super.advance(seconds);
		if(this._Actor)
		{
			this._Actor.advance(seconds);
		}
	}
}