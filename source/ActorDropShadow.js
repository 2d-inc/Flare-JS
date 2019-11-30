import ActorShadow from "./ActorShadow.js";

export default class ActorDropShadow extends ActorShadow
{
	constructor(actor)
	{
		super(actor);
    }
    
	makeInstance(resetActor)
	{
		const node = new ActorDropShadow();
		node.copy(this, resetActor);
		return node;
	}
}