import ActorComponent from "./ActorComponent.js";

export default class ActorLayerEffect extends ActorComponent
{
	constructor(actor)
	{
		super(actor);
		this._IsActive = true;
	}

    get isActive() { return this._IsActive; }
    
    copy(component, resetActor)
	{
        super.copy(component, resetActor);
        this._IsActive = component._IsActive;
	}
}