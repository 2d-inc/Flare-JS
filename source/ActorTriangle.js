import ActorProceduralPath from "./ActorProceduralPath.js";
import {vec2} from "gl-matrix";
import {PointType} from "./PathPoint.js";

export default class ActorTriangle extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
    }

	makeInstance(resetActor)
	{
		const node = new ActorTriangle();
		node.copy(this, resetActor);
		return node;
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
		addPoint([0.0, -radiusY-10]);
		addPoint([radiusX, radiusY]);
		addPoint([-radiusX, radiusY]);

		return [vec2.fromValues(min_x, min_y), vec2.fromValues(max_x, max_y)];
    }
	
	getPathPoints()
	{
		let pathPoints = [];
		const radiusX = this.width/2;
		const radiusY = this.height/2;

		pathPoints.push({
			pointType: PointType.Straight, 
			translation: [0.0, -radiusY]
		});
		pathPoints.push({
			pointType: PointType.Straight, 
			translation: [radiusX, radiusY]
		});
		pathPoints.push({
			pointType: PointType.Straight, 
			translation: [-radiusX, radiusY]
		});
		return pathPoints;
	}
}