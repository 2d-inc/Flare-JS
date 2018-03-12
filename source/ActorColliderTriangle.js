import ActorCollider from "./ActorCollider.js";

export default class ActorColliderTriangle extends ActorCollider
{
	constructor()
	{
		super();
		this._Width = 0.0;
		this._Height = 0.0;
	}

	get width()
	{
		return this._Width;
	}

	get height()
	{
		return this._Height;
	}

	makeInstance(resetActor)
	{
		let node = new ActorColliderTriangle();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._Width = node._Width;
		this._Height = node._Height;
	}
}