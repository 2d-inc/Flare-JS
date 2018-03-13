export default class Graphics
{
	constructor(canvas)
	{
		if(!canvas)
		{
			canvas = document.createElement("canvas");
		}
		this._Canvas = canvas;
		this._Context = canvas.getContext("2d");	
	}

	get canvas()
	{
		return this._Canvas;
	}

	get ctx()
	{
		return this._Context;
	}

	get width()
	{
		return this._Canvas.width;
	}

	get height()
	{
		return this._Canvas.height;
	}

	clear(color)
	{
		let ctx = this._Context;
		let cvs = this._Canvas;
		ctx.save();
		if(color)
		{
			ctx.fillStyle = "rgba(" + Math.round(color[0]*255) + "," + Math.round(color[1]*255) + "," + Math.round(color[2]*255) + "," + color[3] + ")";
			ctx.rect(0, 0, cvs.width, cvs.height);
			ctx.fill();
		}
		else
		{
			ctx.clearRect(0, 0, cvs.width, cvs.height);
		}
	}

	setView(transform)
	{
		this.ctx.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
	}

	flush()
	{
		let ctx = this._Context;
		ctx.restore();
	}

	setSize(width, height)
	{
		if(this.width !== width || this.height !== height)
		{
			this._Canvas.width = width;
			this._Canvas.height = height;
			return true;
		}
		return false;
	}
}