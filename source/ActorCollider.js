import ActorNode from "./ActorNode.js";

export default class ActorCollider extends ActorNode
{
	constructor()
	{
		super();
		this._IsCollisionEnabled = true;
	}

	get isCollisionEnabled()
	{
		return this._IsCollisionEnabled;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._IsCollisionEnabled = node._IsCollisionEnabled;
	}
}