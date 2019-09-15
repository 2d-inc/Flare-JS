import ActorComponent from "./ActorComponent.js";
import ActorPaintable from "./ActorPaintable.js";

export default class ActorTextStyle extends ActorPaintable(ActorComponent)
{
	constructor(actor)
	{
		super(actor);
		this._Font = null;
		this._FontSize = 12;
	}

	makeInstance(resetActor)
	{
		const node = new ActorTextStyle();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Font = node._Font;
		this._FontSize = node._FontSize;
	}
}