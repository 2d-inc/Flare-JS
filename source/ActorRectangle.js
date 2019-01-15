import ActorProceduralPath from "./ActorProceduralPath.js";
import {PointType} from "./PathPoint.js";

export default class ActorRectangle extends ActorProceduralPath
{
    constructor(actor)
    {
        super(actor);
        this._CornerRadius = 0.0;
    }
    
    get cornerRadius()
    {
        return this._CornerRadius;
    }

    set cornerRadius(value)
    {
        if(this._CornerRadius === value)
        {
            return;
        }
        this._CornerRadius = value;
        this.invalidatePath();
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

	getPathPoints()
	{
		const {width, height, cornerRadius} = this;
		const halfWidth = width/2;
		const halfHeight = height/2;
		let radius = cornerRadius || 0;
		if (width < 2 * radius) radius = width / 2;
		if (height < 2 * radius) radius = height / 2;
		return [
			{
				pointType: PointType.Straight, 
				translation: [-halfWidth, -halfHeight],
				radius: radius
			},
			{
				pointType: PointType.Straight, 
				translation: [halfWidth, -halfHeight],
				radius: radius
			},
			{
				pointType: PointType.Straight, 
				translation: [halfWidth, halfHeight],
				radius: radius
			},
			{
				pointType: PointType.Straight, 
				translation: [-halfWidth, halfHeight],
				radius: radius
			}
		];
	}
}