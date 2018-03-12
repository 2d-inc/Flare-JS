import ActorCollider from "./ActorCollider.js";

export default class ActorColliderLine extends ActorCollider
{
	constructor()
	{
		super();
		this._Vertices = new Float32Array();
	}

	get vertices()
	{
		return this._Vertices;
	}

	makeInstance(resetActor)
	{
		let node = new ActorColliderLine();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._Vertices = node._Vertices;
	}
}