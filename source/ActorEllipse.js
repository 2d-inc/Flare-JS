import ActorProceduralPath from "./ActorProceduralPath.js";
import {PointType} from "./PathPoint.js";
const CircleConstant = 0.552284749831;

export default class ActorEllipse extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
    }
    
    makeInstance(resetActor)
	{
		const node = new ActorEllipse();
		node.copy(this, resetActor);
		return node;
    }
    
    getPathPoints()
	{
		let pathPoints = [];
		const radiusX = Math.max(0, this.width/2);
		const radiusY = Math.max(0, this.height/2);

		pathPoints.push({
			pointType: PointType.Disconnected,
			in: [-radiusX * CircleConstant, -radiusY],
			translation: [0.0, -radiusY],
			out: [radiusX * CircleConstant, -radiusY]
		});
		pathPoints.push({
			pointType: PointType.Disconnected,
			in: [radiusX, -radiusY * CircleConstant],
			translation: [radiusX, 0.0],
			out: [radiusX, radiusY * CircleConstant]
		});
		pathPoints.push({
			pointType: PointType.Disconnected,
			in: [radiusX * CircleConstant, radiusY],
			translation: [0.0, radiusY],
			out: [-radiusX * CircleConstant, radiusY]
		});
		pathPoints.push({
			pointType: PointType.Disconnected,
			in: [-radiusX, radiusY * CircleConstant],
			translation: [-radiusX, 0.0],
			out: [-radiusX, -radiusY * CircleConstant]
		});
		return pathPoints;
	}
}