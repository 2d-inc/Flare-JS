import ActorDrawable from "./ActorDrawable.js";

export default class ActorLayerNode extends ActorDrawable
{
    makeInstance(resetActor)
	{
		const node = new ActorLayerNode();
		node.copy(this, resetActor);
		return node;	
    }
    
    draw(graphics)
	{
    }
}