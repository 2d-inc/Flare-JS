import ActorComponent from "./ActorComponent.js";
import {vec2, vec4, mat2d} from "gl-matrix";

export class FillRule
{
	static get EvenOdd()
	{
		return 0;
	}

	static get NonZero()
	{
		return 1;
	}
}


export class ActorColor extends ActorComponent
{
	constructor()
	{
		super();
		this._Color = new Float32Array(4);
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		vec4.copy(this._Color, node._Color);
	}
}

export class ColorFill extends ActorColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor)
	{
		var node = new ColorFill();
		ColorFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}
}

export class ColorStroke extends ActorColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	makeInstance(resetActor)
	{
		var node = new ColorStroke();
		ColorStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}
}

export class GradientColor extends ActorComponent
{
	constructor()
	{
		super();
		this._ColorStops = new Float32Array(10);
		this._Start = vec2.create();
		this._End = vec2.create();
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._ColorStops = new Float32Array(node._ColorStops);
		vec2.copy(this._Start, node._Start);
		vec2.copy(this._End, node._End);
	}
}

export class GradientFill extends GradientColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor)
	{
		var node = new GradientFill();
		GradientFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}
}

export class GradientStroke extends GradientColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	makeInstance(resetActor)
	{
		var node = new GradientStroke();
		GradientStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}
}

export class RadialGradientColor extends GradientColor
{
	constructor()
	{
		super();
		this._SecondaryRadiusScale = 1.0;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._SecondaryRadiusScale = node._SecondaryRadiusScale;
	}
}

export class RadialGradientFill extends RadialGradientColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor)
	{
		var node = new RadialGradientFill();
		RadialGradientFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}
}

export class RadialGradientStroke extends RadialGradientColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	makeInstance(resetActor)
	{
		var node = new RadialGradientStroke();
		RadialGradientStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}
}