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
    
    getPath()
	{
        const path = new Path2D();
        const radiusX = this._Width/2;
        const radiusY = this._Height/2;
        path.moveTo(radiusX, 0.0);
        path.ellipse(0.0, 0.0, radiusX, radiusY, 0.0, 0, Math.PI*2.0, false);
		return path;
	}
}