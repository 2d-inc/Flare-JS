import ActorComponent from "./ActorComponent.js";
import { vec2, vec4, mat2d } from "gl-matrix";
import FillRule from "./FillRule.js";
import StrokeCap from "./StrokeCap.js";
import StrokeJoin from "./StrokeJoin.js";
import Graphics from "./Graphics.js";
import DirtyFlags from "./DirtyFlags.js";
import TrimPath from "./TrimPath.js";

const { Off: TrimPathOff, Sequential: TrimPathSequential, Synced: TrimPathSynced } = TrimPath;
const { PaintDirty } = DirtyFlags;
const { trimPath, trimPathSync } = Graphics;

class ActorPaint extends ActorComponent
{
	constructor()
	{
		super();
		this._RenderOpacity = 1.0;
		this._Opacity = 1.0;
	}

	markDirty()
	{
		this._Actor.addDirt(this, PaintDirty, true);
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
		if (this._Paint)
		{
			Graphics.setPaintBlendMode(this._Paint, this._Parent._BlendMode);
		}
	}

	initialize(actor, graphics)
	{
		this._Paint = graphics.makePaint();
		if (this._Parent)
		{
			Graphics.setPaintBlendMode(this._Paint, this._Parent._BlendMode);
		}
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
		const { _Color: color } = this;
		return [color[0], color[1], color[2], color[3] * this._RenderOpacity];
	}

	get cssColor()
	{
		const c = this._Color;
		return "rgba(" + Math.round(c[0] * 255) + ", " + Math.round(c[1] * 255) + ", " + Math.round(c[2] * 255) + ", " + (c[3] * this._Opacity) + ")";
	}
}

export class ColorFill extends ActorColor
{
	constructor()
	{
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	get fillRule()
	{
		return this._FillRule;
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
		const { _Paint: paint, runtimeColor } = this;
		graphics.setPaintColor(paint, runtimeColor);
		graphics.setPathFillType(path, this._FillRule);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if (this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

const ActorStroke = (ActorStroke) => class extends ActorStroke
{
	constructor(actor)
	{
		super(actor);
		this._Width = 0.0;
		this._Cap = StrokeCap.Butt;
		this._Join = StrokeJoin.Miter;
		this._Trim = TrimPathOff;
		this._TrimStart = 0.0;
		this._TrimEnd = 1.0;
		this._TrimOffset = 0.0;
		this._EffectPath = null;
	}

	initialize(actor, graphics)
	{
		super.initialize(actor, graphics);
		const { _Paint, _Cap, _Join } = this;
		Graphics.setPaintStroke(_Paint);
		Graphics.setPaintStrokeCap(_Paint, _Cap);
		Graphics.setPaintStrokeJoin(_Paint, _Join);
	}

	prepStroke(graphics, path)
	{
		const { _Paint, _Trim, width } = this;
		_Paint.setStrokeWidth(width);

		if (_Trim !== TrimPathOff)
		{
			const trimCall = _Trim === TrimPathSequential ? trimPath : trimPathSync;
			const { trimStart, trimEnd, trimOffset, _EffectPath } = this;
			if (_EffectPath)
			{
				return _EffectPath;
			}

			let effectPath = null;
			if (Math.abs(trimStart - trimEnd) !== 1.0)
			{
				let start = (trimStart + trimOffset) % 1;
				let end = (trimEnd + trimOffset) % 1;

				if (start < 0) { start += 1.0; }
				if (end < 0) { end += 1.0; }
				if (trimStart > trimEnd)
				{
					const swap = end;
					end = start;
					start = swap;
				}
				if (end >= start)
				{
					effectPath = trimCall(path, start, end, false);
				}
				else
				{
					effectPath = trimCall(path, end, start, true);
				}
			}
			if (!effectPath)
			{
				effectPath = path.copy();
			}
			this._EffectPath = effectPath;

			return effectPath;
		}
		return path;
	}

	markPathEffectsDirty()
	{
		const { _EffectPath } = this;
		if (!_EffectPath)
		{
			return;
		}
		Graphics.destroyPath(_EffectPath);
		this._EffectPath = null;
	}

	get width()
	{
		return this._Width;
	}

	set width(value)
	{
		if (this._Width === value)
		{
			return;
		}
		this._Width = value;
	}

	get trimStart()
	{
		return this._TrimStart;
	}

	set trimStart(value)
	{
		if (this._TrimStart === value)
		{
			return;
		}
		this._TrimStart = value;
		this.markPathEffectsDirty();
	}

	get trimEnd()
	{
		return this._TrimEnd;
	}

	set trimEnd(value)
	{
		if (this._TrimEnd === value)
		{
			return;
		}
		this._TrimEnd = value;
		this.markPathEffectsDirty();
	}

	get trimOffset()
	{
		return this._TrimOffset;
	}

	set trimOffset(value)
	{
		if (this._TrimOffset === value)
		{
			return;
		}
		this._TrimOffset = value;
		this.markPathEffectsDirty();
	}

	get cap()
	{
		return this._Cap;
	}

	get join()
	{
		return this._Join;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Width = node._Width;
		this._Join = node._Join;
		this._Cap = node._Cap;
		this._Trim = node._Trim;
		this._TrimStart = node._TrimStart;
		this._TrimEnd = node._TrimEnd;
		this._TrimOffset = node._TrimOffset;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if (this._Parent)
		{
			this._Parent.addStroke(this);
		}
	}
};

export class ColorStroke extends ActorStroke(ActorColor)
{
	constructor()
	{
		super();
	}

	makeInstance(resetActor)
	{
		const node = new ColorStroke();
		node.copy(this, resetActor);
		return node;
	}

	stroke(graphics, path)
	{
		const { _Paint: paint, runtimeColor } = this;

		path = this.prepStroke(graphics, path);
		graphics.setPaintColor(paint, runtimeColor);
		graphics.drawPath(path, paint);
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

		const { transformAffectsStroke } = shape;
		if (transformAffectsStroke)
		{
			vec2.copy(this._RenderStart, this._Start);
			vec2.copy(this._RenderEnd, this._End);
		}
		else
		{
			const world = shape.worldTransform;
			vec2.transformMat2d(this._RenderStart, this._Start, world);
			vec2.transformMat2d(this._RenderEnd, this._End, world);
		}
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

	get fillRule()
	{
		return this._FillRule;
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
		if (this._Gradient)
		{
			graphics.destroyLinearGradient(this._Gradient);
		}
	}

	fill(graphics, path)
	{
		const { _RenderStart: start, _RenderEnd: end, _ColorStops: stops, _Paint: paint } = this;

		if (this._GradientDirty)
		{
			if (this._Gradient)
			{
				graphics.destroyLinearGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length / 5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for (let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++] * opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeLinearGradient(start, end, colors, offsets);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		graphics.setPathFillType(path, this._FillRule);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if (this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class GradientStroke extends ActorStroke(GradientColor)
{
	constructor()
	{
		super();
	}

	makeInstance(resetActor)
	{
		const node = new GradientStroke();
		node.copy(this, resetActor);
		return node;
	}

	stroke(graphics, path)
	{
		const { _RenderStart: start, _RenderEnd: end, _ColorStops: stops, _Paint: paint } = this;

		path = this.prepStroke(graphics, path);
		if (this._GradientDirty)
		{
			if (this._Gradient)
			{
				graphics.destroyLinearGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length / 5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for (let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++] * opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeLinearGradient(start, end, colors, offsets);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		graphics.drawPath(path, paint);
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

	get fillRule()
	{
		return this._FillRule;
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
		const { _Paint: paint, _RenderStart: start, _RenderEnd: end, _ColorStops: stops, _SecondaryRadiusScale: secondaryRadiusScale } = this;

		if (this._GradientDirty)
		{
			if (this._Gradient)
			{
				graphics.destroyRadialGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length / 5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for (let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++] * opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeRadialGradient(start, vec2.distance(start, end), colors, offsets);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		graphics.setPathFillType(path, this._FillRule);
		graphics.drawPath(path, paint);
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if (this._Parent)
		{
			this._Parent.addFill(this);
		}
	}
}

export class RadialGradientStroke extends ActorStroke(RadialGradientColor)
{
	constructor()
	{
		super();
	}

	makeInstance(resetActor)
	{
		const node = new RadialGradientStroke();
		node.copy(this, resetActor);
		return node;
	}

	stroke(graphics, path)
	{
		const { _Paint: paint, _RenderStart: start, _RenderEnd: end, _ColorStops: stops, _SecondaryRadiusScale: secondaryRadiusScale } = this;

		path = this.prepStroke(graphics, path);

		if (this._GradientDirty)
		{
			if (this._Gradient)
			{
				graphics.destroyRadialGradient(this._Gradient);
			}
			this._GradientDirty = false;

			const opacity = this._RenderOpacity;
			const numStops = stops.length / 5;
			let idx = 0;
			const colors = [];
			const offsets = [];
			for (let i = 0; i < numStops; i++)
			{
				colors.push([stops[idx++], stops[idx++], stops[idx++], stops[idx++] * opacity]);
				offsets.push(stops[idx++]);
			}
			const gradient = graphics.makeRadialGradient(start, vec2.distance(start, end), colors, offsets);
			paint.setShader(gradient);
			this._Gradient = gradient;
		}
		graphics.drawPath(path, paint);
	}
}