const ActorPaintable = (base) => class extends base
{
	constructor(actor)
	{
		super(actor);
		this._Paths = null;
		this._Fills = null;
		this._Strokes = null;
	}

	get paths()
	{
		return this._Paths;
	}

	addFill(fill)
	{
		if (!this._Fills)
		{
			this._Fills = [];
		}
		this._Fills.push(fill);
	}

	addStroke(stroke)
	{
		if (!this._Strokes)
		{
			this._Strokes = [];
		}
		this._Strokes.push(stroke);
	}

	get stroke()
	{
		return this._Strokes && this._Strokes.length && this._Strokes[0];
	}

	paint(graphics, path)
	{
		const { _Fills: fills, _Strokes: strokes } = this;

		if (fills)
		{
			for (const fill of fills)
			{
				fill.fill(graphics, path);
			}
		}
		if (strokes)
		{
			for (const stroke of strokes)
			{
				if (stroke._Width > 0)
				{
					stroke.stroke(graphics, path);
				}
			}
		}
	}
}

export default ActorPaintable;