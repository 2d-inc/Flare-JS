import ActorLayerEffect from "./ActorLayerEffect.js";

export default class ActorBlur extends ActorLayerEffect
{
	constructor(actor)
	{
		super(actor);
        this._BlurX = 0;
        this._BlurY = 0;
	}

    get blurX() { return this._BlurX; }
    get blurY() { return this._BlurY; }
    
    copy(component, resetActor)
	{
        super.copy(component, resetActor);
        this._BlurX = component._BlurX;
        this._BlurY = component._BlurY;
	}

	makeInstance(resetActor)
	{
		const node = new ActorBlur();
		node.copy(this, resetActor);
		return node;
	}
}