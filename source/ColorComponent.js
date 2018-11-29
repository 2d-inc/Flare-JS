import ActorComponent from "./ActorComponent.js";
import {vec2, vec4, mat2d} from "gl-matrix";
import FillRule from "./FillRule.js";

class ActorPaint extends ActorComponent
{
	constructor()
	{
		super();
		this._RenderOpacity = 1.0;
		this._Opacity = 1.0;
	}
	
	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._Opacity = node._Opacity;	
	}

	get opacity()
	{
		return this._Opacity;
	}

	update(dirt)
	{
		super.update(dirt);
		this._RenderOpacity = this._Opacity * this._Parent._RenderOpacity;
	}

	initialize(actor, graphics)
	{
		this._Paint = graphics.makePaint();
	}

	dispose(actor, graphics)
	{
		graphics.destroyPaint(this._Paint);
	}
}

export class ActorColor extends ActorPaint
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

	get runtimeColor()
	{
		const {_Color:color} = this;
		return [color[0], color[1], color[2], color[3]*this._RenderOpacity];
	}

	get cssColor()
	{
		const c = this._Color;
		return "rgba(" + Math.round(c[0]*255) + ", " + Math.round(c[1]*255) + ", " + Math.round(c[2]*255) + ", " + (c[3]*this._Opacity) + ")";
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
		const node = new ColorFill();
		ColorFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	initialize(actor, graphics)
	{
		super.initialize(actor, graphics);
		graphics.setPaintFill(this._Paint);
	}

	fill(graphics, path)
	{
		const {_Paint:paint, runtimeColor} = this;
		graphics.setPaintColor(paint, runtimeColor);
		// ctx.fillStyle = this.cssColor;
		
		// switch(this._FillRule)
		// {
		// 	case FillRule.EvenOdd:
		// 		ctx.fill(path, "evenodd");
		// 		break;
		// 	case FillRule.NonZero:
		// 		ctx.fill(path, "nonzero");
		// 		break;
		// }
		graphics.setPathFillType(path, this._FillRule);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class ColorStroke extends ActorColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	get width()
	{
		return this._Width;
	}

	makeInstance(resetActor)
	{
		const node = new ColorStroke();
		ColorStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	initialize(actor, graphics)
	{
		super.initialize(actor, graphics);
		graphics.setPaintStroke(this._Paint);
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(graphics, path)
	{
		// ctx.strokeStyle = this.cssColor;
		// ctx.lineWidth = this._Width;
		// ctx.stroke(path);
		const {_Paint:paint, runtimeColor} = this;
		graphics.setPaintColor(paint, runtimeColor);
		paint.setStrokeWidth(this._Width);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addStroke(this);
		}
	}
}

export class GradientColor extends ActorPaint
{
	constructor()
	{
		super();
		this._ColorStops = new Float32Array(10);
		this._Start = vec2.create();
		this._End = vec2.create();
		this._RenderStart = vec2.create();
		this._RenderEnd = vec2.create();
		this._GradientDirty = true;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._ColorStops = new Float32Array(node._ColorStops);
		vec2.copy(this._Start, node._Start);
		vec2.copy(this._End, node._End);
		vec2.copy(this._RenderStart, node._RenderStart);
		vec2.copy(this._RenderEnd, node._RenderEnd);
	}

	completeResolve()
	{
		super.completeResolve();
		const graph = this._Actor;
		const shape = this._Parent;
		graph.addDependency(this, shape);
	}

	update(dirt)
	{
		super.update(dirt);
		const shape = this._Parent;
		const world = shape.worldTransform;
		vec2.transformMat2d(this._RenderStart, this._Start, world);
		vec2.transformMat2d(this._RenderEnd, this._End, world);
		this._GradientDirty = true;
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
		const node = new GradientFill();
		GradientFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	dispose(actor, graphics)
	{
		super.dispose(actor, graphics);
		if(this._Gradient)
		{
			graphics.destroyLinearGradient(this._Gradient);
		}
	}

	fill(graphics, path)
	{
		const {_RenderStart:start, _RenderEnd:end, _ColorStops:stops, _Paint:paint} = this;

		if(this._GradientDirty)
		{
			if(this._Gradient)
			{
				graphics.destroyLinearGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length/5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for(let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++]*opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeLinearGradient(start, end, colors, offsets);
			//graphics.setPaintColor(paint, [1, 1, 1, 1]);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		graphics.setPathFillType(path, this._FillRule);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class GradientStroke extends GradientColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	get width()
	{
		return this._Width;
	}

	initialize(actor, graphics)
	{
		super.initialize(actor, graphics);
		graphics.setPaintStroke(this._Paint);
	}

	makeInstance(resetActor)
	{
		const node = new GradientStroke();
		GradientStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx, path)
	{
		const {_RenderStart:start, _RenderEnd:end, _ColorStops:stops, _Paint:paint} = this;

		if(this._GradientDirty)
		{
			if(this._Gradient)
			{
				graphics.destroyLinearGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length/5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for(let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++]*opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeLinearGradient(start, end, colors, offsets);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		paint.setStrokeWidth(this._Width);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addStroke(this);
		}
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
		const node = new RadialGradientFill();
		RadialGradientFill.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(graphics, path)
	{
		const {_Paint:paint, _RenderStart:start, _RenderEnd:end, _ColorStops:stops, _SecondaryRadiusScale:secondaryRadiusScale} = this;
		
		if(this._GradientDirty)
		{
			if(this._Gradient)
			{
				graphics.destroyRadialGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length/5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for(let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++]*opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeRadialGradient(start, vec2.distance(start, end), colors, offsets);
			//graphics.setPaintColor(paint, [1, 1, 1, 1]);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		graphics.setPathFillType(path, this._FillRule);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class RadialGradientStroke extends RadialGradientColor
{
	constructor()
	{
		super();
		this._Width = 0.0;
	}

	get width()
	{
		return this._Width;
	}

	makeInstance(resetActor)
	{
		const node = new RadialGradientStroke();
		RadialGradientStroke.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	initialize(actor, graphics)
	{
		super.initialize(actor, graphics);
		graphics.setPaintStroke(this._Paint);
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx, path)
	{
		const {_Paint:paint, _RenderStart:start, _RenderEnd:end, _ColorStops:stops, _SecondaryRadiusScale:secondaryRadiusScale} = this;
		
		if(this._GradientDirty)
		{
			if(this._Gradient)
			{
				graphics.destroyRadialGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length/5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for(let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++]*opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeRadialGradient(start, vec2.distance(start, end), colors, offsets);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		paint.setStrokeWidth(this._Width);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._Parent)
		{
			this._Parent.addStroke(this);
		}
	}
}