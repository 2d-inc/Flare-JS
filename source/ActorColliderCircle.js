import ActorCollider from "./ActorCollider.js";

export default class ActorColliderCircle extends ActorCollider
{
	constructor()
	{
		super();
		this._Radius = 0.0;
	}

	get radius()
	{
		return this._Radius;
	}

	makeInstance(resetActor)
	{
		let node = new ActorColliderCircle();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._Radius = node._Radius;
	}
}