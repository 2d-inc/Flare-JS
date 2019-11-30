import ActorLayerEffect from "./ActorLayerEffect.js";
import MaskType from "./MaskType.js";

export default class ActorMask extends ActorLayerEffect
{
	constructor(actor)
	{
		super(actor);
		this._Source = null;
		this._SourceIndex = -1;
		this._MaskType = MaskType.Alpha;
	}

	get source() { return this._Source; }
	get maskType() { return this._MaskType; }

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._SourceIndex = node._SourceIndex;
		this._MaskType = node._SourceType;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		this._Source = components[this._SourceIndex];
	}

	makeInstance(resetActor)
	{
		const node = new ActorMask();
		node.copy(this, resetActor);
		return node;
	}
}