import BezierAnimationCurve from "./BezierAnimationCurve.js";

const MAX_FACTOR = 0.99999;
const MIN_FACTOR = 1.0-MAX_FACTOR;

let TempBuffer = new Float32Array(32);

function InterpolateVertexBuffer(buffer, from, to, mix)
{
	if(buffer.length < to.length)
	{
		buffer = new Float32Array(to.length);
	}

	var mixi = 1.0 - mix;
	var l = to.length;

	for(var i = 0; i < l; i++)
	{
		buffer[i] = from[i] * mixi + to[i] * mix;
	}

	return buffer;
}

export class KeyFrame
{
	constructor()
	{
		this._Value = 0.0;
		this._Time = 0.0;
		this._Type = 0;
		this._Interpolator = null;
	}

	setNext(nxt)
	{
		if(this._Value.constructor === Float32Array)
		{
			this.interpolate = KeyFrame.prototype.interpolateVertexBuffer;
		}
		else
		{
			this.interpolate = KeyFrame.prototype.interpolateFloat;
		}
	}

	interpolateVertexBuffer(mix, nxt)
	{
		return (TempBuffer=InterpolateVertexBuffer(TempBuffer, this._Value, nxt._Value, mix));
	}

	interpolateFloat(mix, nxt)
	{
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