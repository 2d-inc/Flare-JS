import ActorDrawable from "./ActorDrawable.js";
import ActorPaintable from "./ActorPaintable.js";
import TextAlign from "./TextAlign.js";
import TextOverflow from "./TextOverflow.js";

export default class ActorText extends ActorPaintable(ActorDrawable)
{
	constructor(actor)
	{
		super(actor);
        this._Styles = [];
        this._Text = "";
        this._Align = TextAlign.Left;
        this._Overflow = TextOverflow.Clip;
        this._MaxSize = 0;
        this._MaxLines = 0;
        this._LineHeight = 0;
        this._NoOrphans = false;
        this._Styling = new Uint16Array([0, 0, Number.MAX_SAFE_INTEGER, 0]);
	}

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
        this._Align = node._Align;
        this._Overflow = node._Overflow;
        this._MaxSize = node._MaxSize;
        this._MaxLines = node._MaxLines;
        this._LineHeight = node._LineHeight;
        this._NoOrphans = node._NoOrphans;
        this._Styling = new Uint16Array(node._Styling);
	}

}