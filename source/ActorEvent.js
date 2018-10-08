import ActorComponent from "./ActorComponent.js";

export default class ActorEvent extends ActorComponent
{
	constructor()
	{
		super();
	}

	makeInstance(resetActor)
	{
		const node = new ActorEvent();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
	}
}