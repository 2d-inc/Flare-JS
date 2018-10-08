import ActorNode from "./ActorNode.js";
import {vec2,mat2d} from "gl-matrix";

export default class ActorProceduralPath extends ActorNode
{
    constructor(actor)
    {
        super(actor);
        this._Width = 0;
        this._Height = 0;
    }

    resolveComponentIndices(components)
	{
        ActorNode.prototype.resolveComponentIndices.call(this, components);
    }
 
    makeInstance(resetActor)
    {
        const node = ActorProceduralPath();
        ActorProceduralPath.prototype.copy.call(node, this, resetActor);
        return node;
    }

    copy(node, resetActor)
    {
        super.copy(node, resetActor);

        this._Width = node._Width;
        this._Height = node._Height;
    }
}