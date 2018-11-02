import ActorProceduralPath from "./ActorProceduralPath.js";

export default class ActorRectangle extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
        this._CornerRadius = 0.0;
    }

    resolveComponentIndices(components)
	{
        ActorProceduralPath.prototype.resolveComponentIndices.call(this, components);
    }
    
    makeInstance(resetActor)
	{
		const node = new ActorRectangle();
        node.copy(this, resetActor);
		return node;
    }
    
    copy(node, resetActor)
    {
        super.copy(node, resetActor);
        this._CornerRadius = node._CornerRadius;
    }

    draw(ctx)
    {
        const transform = this._WorldTransform;
        ctx.save();
        ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

        const halfWidth = Math.max(0, this._Width/2);
        const halfHeight = Math.max(0, this._Height/2);
        ctx.moveTo(-halfWidth, -halfHeight);
        let r = this._CornerRadius;
        if(r > 0)
        {
            this._DrawRoundedRect(ctx, -halfWidth, -halfHeight, this._Width, this._Height, r);
        }
        else
        {
            ctx.rect(-halfWidth, -halfHeight, this._Width, this._Height);
        }
        ctx.restore();
    }

    _DrawRoundedRect(ctx, x, y, width, height, radius) 
    {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
}