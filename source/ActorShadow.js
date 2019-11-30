import ActorBlur from "./ActorBlur.js";
import BlendMode from "./BlendMode.js";

export default class ActorShadow extends ActorBlur
{
	constructor(actor)
	{
		super(actor);
        this._OffsetX = 0;
        this._OffsetY = 0;
        this._Color = new Float32Array(4);
        this._BlendMode = BlendMode.SrcOver;
	}

    get offsetX() { return this._OffsetX; }
    get offsetY() { return this._OffsetY; }
    get color() { return this._Color; }
    get blendMode() { return this._BlendMode; }
    
    copy(component, resetActor)
	{
        super.copy(component, resetActor);
        this._OffsetX = component._OffsetX;
        this._OffsetY = component._OffsetY;
        this._Color[0] = component._Color[0];
        this._Color[1] = component._Color[1];
        this._Color[2] = component._Color[2];
        this._Color[3] = component._Color[3];
        this._BlendMode = component._BlendMode;
	}

	makeInstance(resetActor)
	{
		const node = new ActorShadow();
		node.copy(this, resetActor);
		return node;
	}
}