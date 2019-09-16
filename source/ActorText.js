import ActorDrawable from "./ActorDrawable.js";
import ActorPaintable from "./ActorPaintable.js";
import TextAlign from "./TextAlign.js";
import TextOverflow from "./TextOverflow.js";
import TextShaper from "./TextShaper.js";

export default class ActorText extends ActorDrawable
{
	constructor(actor)
	{
		super(actor);
		this._Styles = [];
		this._Text = "";
		this._Styling = new Uint16Array([0, 0, Number.MAX_SAFE_INTEGER, 0]);
		this._Shaper = new TextShaper();
	}

	get align() { return this._Shaper.align; }
	set align(value) { this._Shaper.align = value; }

	get overflow() { return this._Shaper.overflow; }
	set overflow(value) { this._Shaper.overflow = value; }

	get maxLines() { return this._Shaper.maxLines; }
	set maxLines(value) { this._Shaper.maxLines = value; }

	get lineHeight() { return this._Shaper.lineHeight; }
	set lineHeight(value) { this._Shaper.lineHeight = value; }

	get maxSize() { return this._Shaper.maxSize; }
	set maxSize(value) { this._Shaper.maxSize = value; }

	get maxLines() { return this._Shaper.maxLines; }
	set maxLines(value) { this._Shaper.maxLines = value; }

	get noOrphans() { return this._Shaper.noOrphans; }
	set noOrphans(value) { this._Shaper.noOrphans = value; }

	addStyle(style)
	{
		this._Styles.push(style);
	}

	makeInstance(resetActor)
	{
		const node = new ActorText();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Text = node._Text;
		this._Styling = new Uint16Array(node._Styling);

		// Copy shaper properties
		this.align = node.align;
		this.overflow = node.overflow;
		this.maxSize = node.maxSize;
		this.maxLines = node.maxLines;
		this.lineHeight = node.lineHeight;
		this.noOrphans = node.noOrphans;
	}

	draw(graphics)
	{
		if (this._RenderCollapsed || this._IsHidden)
		{
			return;
		}

		const { _Text, _Styles, _Styling, _Shaper, worldTransform } = this;
		if (!_Shaper.layout(_Text, _Styles, _Styling))
		{
			// layout is invalid.
			return;
		}

		_Shaper.updatePaths(graphics, _Text, _Styles, _Styling);

        graphics.save();
        graphics.transform(worldTransform);

        // const paint = graphics.makePaint(true);
        // graphics.setPaintFill(paint);
        // graphics.setPaintColor(paint, [1, 0, 0, 1]);
        // graphics.drawRect(0, 0, 100, 100, paint);
		//this.clip(graphics);

		const { clipPath } = _Shaper;
		if (clipPath)
		{
		//	graphics.clipPath(clipPath);
		}

		for (const style of _Styles)
		{
			style.draw(graphics);
		}

		graphics.restore();
	}
}