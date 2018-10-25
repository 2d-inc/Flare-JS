import ActorBoneBase from "./ActorBoneBase.js";

export default class ActorJellyBone extends ActorBoneBase
{
	makeInstance(resetActor)
	{
		const node = new ActorJellyBone();
		node.copy(this, resetActor);
		return node;	
	}	
}