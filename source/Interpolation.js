import BezierEasing from "bezier-easing";

export class Hold
{
	getEasedMix(mix)
	{
		return 0;
	}
}

Hold.instance = new Hold();

export class Linear
{
	getEasedMix(mix)
	{
		return mix;
	}
}

Linear.instance = new Linear();

export class Cubic
{
	constructor(x1, y1, x2, y2)
	{
		this._Bezier = BezierEasing(x1, y1, x2, y2);
	}

	getEasedMix(mix)
	{
		return this._Bezier(mix);
	}
}