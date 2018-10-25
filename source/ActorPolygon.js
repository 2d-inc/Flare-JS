import ActorProceduralPath from "./ActorProceduralPath.js";
import {vec2} from "gl-matrix";

export default class ActorPolygon extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
        this._Sides = 5;
    }

    resolveComponentIndices(components)
	{
        ActorProceduralPath.prototype.resolveComponentIndices.call(this, components);
    }
    
    makeInstance(resetActor)
	{
		const node = new ActorPolygon();
        node.copy(this, resetActor);
		return node;
    }
    
    copy(node, resetActor)
    {
        super.copy(node, resetActor);
        this._Sides = node._Sides;
    }

    draw(ctx)
    {
        const transform = this._WorldTransform;
        ctx.save();
        ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

        const radiusX = this._Width/2;
        const radiusY = this._Height/2;
        const sides = this._Sides;

        ctx.moveTo(0.0, -radiusY);
        let angle = -Math.PI/2.0;
        const inc = (Math.PI*2.0)/sides;
        for(let i = 0; i < sides; i++)
        {
            ctx.lineTo(
                Math.cos(angle)*radiusX,
                Math.sin(angle)*radiusY
            );
            angle += inc;
        }
        ctx.closePath();
        ctx.restore();
    }

    getPathAABB() 
    {
        let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;
        
        const transform = this._WorldTransform;

		function addPoint(pt)
		{
			if(transform)
			{
				pt = vec2.transformMat2d(vec2.create(), pt, transform);
			}
			if(pt[0] < min_x)
			{
				min_x = pt[0];
			}
			if(pt[1] < min_y)
			{
				min_y = pt[1];
			}
			if(pt[0] > max_x)
			{
				max_x = pt[0];
			}
			if(pt[1] > max_y)
			{
				max_y = pt[1];
			}
		}

		const sides = this._Sides;
		const radiusX = this.width/2;
		const radiusY = this.height/2;
		let angle = -Math.PI/2.0;
		let inc = (Math.PI*2.0)/sides;
		addPoint([0.0, -radiusY]);
		for(let i = 0; i < sides; i++)
		{
			addPoint([Math.cos(angle)*radiusX, Math.sin(angle)*radiusY]);
			angle += inc;
		}

		return [vec2.fromValues(min_x, min_y), vec2.fromValues(max_x, max_y)]; 
    }
}