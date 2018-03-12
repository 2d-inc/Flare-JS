import ActorNode from "./ActorNode.js";

export default class ActorRootBone extends ActorNode
{
	constructor()
	{
		super();
	}
	
	makeInstance(resetActor)
	{
		var node = new ActorRootBone();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
	}
}