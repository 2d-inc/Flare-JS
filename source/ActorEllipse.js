import ActorProceduralPath from "./ActorProceduralPath.js";

export default class ActorEllipse extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
    }

    resolveComponentIndices(components)
	{
        ActorProceduralPath.prototype.resolveComponentIndices.call(this, components);
    }
    
    makeInstance(resetActor)
	{
		const node = new ActorEllipse();
		node.copy(this, resetActor);
		return node;
	}

    draw(ctx)
    {
        const transform = this._WorldTransform;
        ctx.save();
        ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

        const radiusX = this._Width/2;
        const radiusY = this._Height/2;
        ctx.moveTo(radiusX, 0.0);
        ctx.ellipse(0.0, 0.0, radiusX, radiusY, 0.0, 0, Math.PI*2.0, false);
        ctx.restore();
    }
}