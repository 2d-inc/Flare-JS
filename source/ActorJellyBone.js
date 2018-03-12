import ActorBoneBase from "./ActorBoneBase.js";

export default class ActorJellyBone extends ActorBoneBase
{
	makeInstance(resetActor)
	{
		var node = new ActorJellyBone();
		node.copy(this, resetActor);
		return node;	
	}	
}