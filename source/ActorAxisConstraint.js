import ActorTargetedConstraint from "./ActorTargetedConstraint.js";
import TransformSpace from "./TransformSpace.js";

export default class ActorAxisConstraint extends ActorTargetedConstraint
{
	constructor(actor)
	{
		super(actor);

		this._CopyX = false;
		this._CopyY = false;
		this._ScaleX = 1;
		this._ScaleY = 1;
		this._EnableMinX = false;
		this._MinX = 0;
		this._EnableMaxX = false;
		this._MaxX = 0;
		this._EnableMinY = false;
		this._MinY = 0;
		this._EnableMaxY = false;
		this._MaxY = 0;
		this._Offset = false;
		this._SourceSpace = TransformSpace.World;
		this._DestSpace = TransformSpace.World;
		this._MinMaxSpace = TransformSpace.World;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._CopyX = node._CopyX;
		this._CopyY = node._CopyY;
		this._ScaleX = node._ScaleX;
		this._ScaleY = node._ScaleY;
		this._EnableMinX = node._EnableMinX;
		this._MinX = node._MinX;
		this._EnableMaxX = node._EnableMaxX;
		this._MaxX = node._MaxX;
		this._EnableMinY = node._EnableMinY;
		this._MinY = node._MinY;
		this._EnableMaxY = node._EnableMaxY;
		this._MaxY = node._MaxY;
		this._Offset = node._Offset;
		this._SourceSpace = node._SourceSpace;
		this._DestSpace = node._DestSpace;
		this._MinMaxSpace = node._MinMaxSpace;
	}

	onDirty(dirt)
	{
		this.markDirty();
	}
}