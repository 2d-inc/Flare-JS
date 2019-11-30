import ActorShadow from "./ActorShadow.js";

export default class ActorInnerShadow extends ActorShadow
{
	constructor(actor)
	{
		super(actor);
    }
    
	makeInstance(resetActor)
	{
		const node = new ActorInnerShadow();
		node.copy(this, resetActor);
		return node;
	}
}