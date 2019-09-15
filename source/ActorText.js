import ActorDrawable from "./ActorDrawable.js";
import ActorPaintable from "./ActorPaintable.js";

export default class ActorText extends ActorPaintable(ActorDrawable)
{
	constructor(actor)
	{
		super(actor);
    }
}