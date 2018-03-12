import BezierAnimationCurve from "./BezierAnimationCurve.js";

const MAX_FACTOR = 0.99999;
const MIN_FACTOR = 1.0-MAX_FACTOR;

export default class KeyFrame
{
	constructor()
	{
		this._Value = 0.0;
		this._Time = 0.0;
		this._Type = 0;
		this._InFactor = 0;
		this._InValue = 0;
		this._OutFactor = 0;
		this._OutValue = 0;
		this._Curve = null;
	}

	setNext(nxt)
	{
		var t = this._Type;
		var ts = KeyFrame.Type;

		if(this._Value.constructor === Float32Array)
		{
			this._Curve = null;
			this._TmpBuffer = new Float32Array(this._Value.length);
			this.interpolate = KeyFrame.prototype.interpolateVertexBuffer;
		}
		else if(!nxt || (t === ts.Linear && nxt._type === ts.Linear) || t === ts.Hold)
		{
			this._Curve = null;
			this.interpolate = t === ts.Hold ? KeyFrame.prototype.interpolateHold : KeyFrame.prototype.interpolateLinear;
		}
		else
		{
			var timeRange = nxt._Time - this._Time;
			var outTime = this._Time + timeRange * Math.max(MIN_FACTOR, Math.min(MAX_FACTOR, this._OutFactor));
			var inTime = nxt._Time - timeRange * Math.max(MIN_FACTOR, Math.min(MAX_FACTOR, nxt._InFactor));

			this._Curve = new BezierAnimationCurve([this._Time, this._Value], [outTime, this._OutValue], [inTime, nxt._InValue], [nxt._Time, nxt._Value]);
			this.interpolate = KeyFrame.prototype.interpolateCurve;
		}
	}

	interpolateVertexBuffer(t, nxt)
	{
		var mix = (t - this._Time)/(nxt._Time-this._Time);
		var mixi = 1.0 - mix;
		var wr = this._TmpBuffer;
		var from = this._Value;
		var to = nxt._Value;
		var l = to.length;

		for(var i = 0; i < l; i++)
		{
			wr[i] = from[i] * mixi + to[i] * mix;
		}

		return wr;
	}

	interpolateHold(t, nxt)
	{
		return this._Value;
	}

	interpolateCurve(t, nxt)
	{
		return this._Curve.get(t);
	}

	interpolateLinear(t, nxt)
	{
		var mix = (t - this._Time)/(nxt._Time-this._Time);
		return this._Value * (1.0-mix) + nxt._Value * mix;
	}
}

KeyFrame.Type =
{
	Hold:0,
	Linear:1,
	Mirrored:2,
	Asymmetric:3,
	Disconnected:4,
	Progression:5
};