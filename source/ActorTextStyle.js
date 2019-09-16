import ActorComponent from "./ActorComponent.js";
import ActorPaintable from "./ActorPaintable.js";

export default class ActorTextStyle extends ActorPaintable(ActorComponent)
{
	constructor(actor)
	{
		super(actor);
		this._Font = null;
		this._FontSize = 12;
		this.renderPath = null;
	}

	get renderOpacity()
	{
		return this._Parent.renderOpacity;
	}

	get font() { return this._Font; }
	get fontSize() { return this._FontSize; }

	// Used by contained stroke/fills.
	get blendMode()
	{
		return this._Parent.blendMode;
	}

	makeInstance(resetActor)
	{
		const node = new ActorTextStyle();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Font = node._Font;
		this._FontSize = node._FontSize;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if (this._Parent)
		{
			this._Parent.addStyle(this);
		}
	}

	draw(graphics)
	{
		const { renderPath } = this;
		if (!renderPath) { return; }

		// const paint = graphics.makePaint(true);
		// graphics.setPaintFill(paint);
		// graphics.setPaintColor(paint, [1, 0, 0, 1]);
		// //graphics.drawRect(0, 0, 100, 100, paint);
		// graphics.drawPath(renderPath, paint);
		this.paint(graphics, renderPath);
	}
}