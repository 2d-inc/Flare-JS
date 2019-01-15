import ActorProceduralPath from "./ActorProceduralPath.js";
import {vec2} from "gl-matrix";
import {PointType} from "./PathPoint.js";

export default class ActorStar extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
        this._Points = 5;
        this._InnerRadius = 0.0;
    }

    get innerRadius()
    {
        return this._InnerRadius;
    }

    set innerRadius(radius)
    {
        if(this._InnerRadius === radius)
        {
            return;
        }
        this._InnerRadius = radius;
        this.invalidatePath();
    }

	makeInstance(resetActor)
	{
		const node = new ActorStar();
        node.copy(this, resetActor);
		return node;
    }
    
    copy(node, resetActor)
    {
        super.copy(node, resetActor);
        this._Points = node._Points;
        this._InnerRadius = node._InnerRadius;
    }

    getOBB(transform)
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

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
        
		const radiusX = this.width/2;
        const radiusY = this.height/2;
        
        let angle = -Math.PI/2.0;
        
        const inc = (Math.PI*2.0)/this.sides;

        const sx = [radiusX, radiusX*this._InnerRadius];
        const sy = [radiusY, radiusY*this._InnerRadius];
        addPoint([0.0, -radiusY]);
        for(let i = 0; i < this.sides; i++)
        {
            addPoint([Math.cos(angle)*sx[i%2], Math.sin(angle)*sy[i%2]]);
            angle += inc;
        }

		return [vec2.fromValues(min_x, min_y), vec2.fromValues(max_x, max_y)];
    }

	getPathPoints()
	{
        const {_Points, _InnerRadius} = this;
		const sides = _Points * 2;

		let pathPoints = [];
		const radiusX = Math.max(0, this.width/2);
		const radiusY = Math.max(0, this.height/2);

		let angle = -Math.PI/2.0;
		let inc = (Math.PI*2.0)/sides;
		let sx = [radiusX, radiusX*_InnerRadius];
		let sy = [radiusY, radiusY*_InnerRadius];
		for(let i = 0; i < sides; i++)
		{
			pathPoints.push({
				pointType: PointType.Straight, 
				translation: [Math.cos(angle)*sx[i%2], Math.sin(angle)*sy[i%2]]
			});
			angle += inc;
		}

		return pathPoints;
	}

    get sides()
    {
        return this._Points * 2;
    }
}