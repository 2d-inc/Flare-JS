import ActorNode from "./ActorNode.js";


export default class ActorTargetNode extends ActorNode
{
    makeInstance(resetActor)
	{
		const node = new ActorTargetNode();
		node.copy(this, resetActor);
		return node;	
	}
}