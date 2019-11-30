import ActorDrawable from "./ActorDrawable.js";
import ActorMask from "./ActorMask.js";
import MaskType from "./MaskType.js";
import BlendMode from "./BlendMode.js";
import Graphics from "./Graphics.js";
import ActorBlur from "./ActorBlur.js";
import ActorDropShadow from "./ActorDropShadow.js";
import ActorInnerShadow from "./ActorInnerShadow.js";

export default class ActorLayerEffectRenderer extends ActorDrawable
{
	constructor(actor)
	{
		super(actor);

		this._Drawables = [];
		this._RenderMasks = [];

		this._Blur = null;
		this._DropShadows = null;
		this._InnerShadows = null;
	}

	findEffects()
	{
		const { children } = this.parent;
		this._Blur = children.find((child) => child.constructor === ActorBlur) || null;

		this._DropShadows = children.filter((child) => child.constructor === ActorDropShadow);
		this._InnerShadows = children.filter((child) => child.constructor === ActorInnerShadow);
	}

	addDrawable(drawable)
	{
		const drawables = this._Drawables;
		if (drawables.indexOf(drawable) !== -1)
		{
			return false;
		}
		drawables.push(drawable);
		return true;
	}

	removeDrawable(drawable)
	{
		const drawables = this._Drawables;
		const index = drawables.indexOf(drawable);
		if (index === -1)
		{
			return false;
		}
		drawables.splice(index, 1);
		return true;
	}

	sortDrawables()
	{
		this._Drawables.sort(function(a, b)
		{
			return a._DrawOrder - b._DrawOrder;
		});
	}

	completeResolve()
	{
		super.completeResolve();

		// When we complete resolve we find all the children and mark their
		// layers. Alternative way to do this is to have each drawable check for
		// parent layers when the parent changes. That would be more effective
		// if nodes were to get moved around at runtime.
		const { parent } = this;
		parent.eachChildRecursive((node) =>
		{
			if (node instanceof ActorDrawable && node !== this)
			{
				node.layerEffectRenderer = this;
			}
			return true;
		});
		this.sortDrawables();
		this.computeMasks();
		this.findEffects();
	}

	computeMasks()
	{
		const renderMasks = this._RenderMasks;
		renderMasks.length = 0;
		const { parent } = this;
		let maskSearch = parent;
		let masks = [];

		while (maskSearch)
		{
			if (maskSearch.children)
			{
				masks = masks.concat(maskSearch.children.filter((child) => child instanceof ActorMask));
			}
			maskSearch = maskSearch.parent;
		}

		for (const mask of masks)
		{
			const renderMask = {
				drawables: [],
				mask
			};
			mask.source.all((child) =>
			{
				if (child instanceof ActorDrawable)
				{
					if (child.layerEffectRenderer !== null)
					{
						// Layer effect is direct discendant of this layer, so we want to
						// draw it with the other drawables in this layer.
						renderMask.drawables.push(child.layerEffectRenderer);
						// Don't iterate if child has further layer effect
						return false;
					}
					else
					{
						renderMask.drawables.push(child);
					}
				}

				return true;
			});

			if (renderMask.drawables.length)
			{
				renderMasks.push(renderMask);
			}
		}
	}

	makeInstance(resetActor)
	{
		const node = new ActorLayerEffectRenderer();
		node.copy(this, resetActor);
		return node;
	}

	draw(graphics)
	{
		const artboard = this._Actor;
		const bounds = artboard.artboardAABB();

		let baseBlurX = 0;
		let baseBlurY = 0;
		const layerPaint = graphics.makePaint(true);
		const layerColor = [1, 1, 1, parent.renderOpacity];
		graphics.setPaintColor(layerPaint, layerColor);
		const { _Blur: blur, _DropShadows: dropShadows, _InnerShadows: innerShadows } = this;
		if (blur && blur.isActive)
		{
			baseBlurX = blur.blurX;
			baseBlurY = blur.blurY;

			graphics.setPaintBlur(layerPaint, baseBlurX, baseBlurY);
		}

		if (dropShadows.length)
		{
			for (const dropShadow of dropShadows)
			{
				if (!dropShadow.isActive)
				{
					continue;
				}
				// DropShadow: To draw a shadow we just draw the shape (with
				// drawPass) with a custom color and image (blur) filter before
				// drawing the main shape.
				graphics.save();
				const color = dropShadow.color;
				graphics.translate(dropShadow.offsetX, dropShadow.offsetY);
				const shadowPaint = graphics.makePaint(true);
				graphics.setPaintColor(shadowPaint, layerColor);
				graphics.setPaintBlur(shadowPaint, dropShadow.blurX + baseBlurX, dropShadow.blurY + baseBlurY);
				graphics.setPaintBlendFilter(shadowPaint, color, BlendMode.SrcIn);
				this.drawPass(graphics, bounds, shadowPaint);
				graphics.restore();
				graphics.restore();
			}
		}

		this.drawPass(graphics, bounds, layerPaint);

		if (innerShadows.length)
		{
			for (const innerShadow of innerShadows)
			{
				if (!innerShadow.isActive)
				{
					continue;
				}
				const { blendMode } = innerShadow;
				const extraBlendPass = blendMode != BlendMode.SrcOver;
				if (extraBlendPass)
				{
					// if we have a custom blend mode, then we can't just srcATop with
					// what's already been drawn. We need to draw the contents as a mask
					// to then draw the shadow on top of with srcIn to only show the
					// shadow and finally composite with the desired blend mode requested
					// here.
					const extraLayerPaint = graphics.makePaint(true);
					Graphics.setPaintBlendMode(extraLayerPaint, blendMode);
					this.drawPass(graphics, bounds, extraLayerPaint);
				}

				// because there's no way to compose image filters (use two filters in
				// one) we have to use an extra layer to invert the alpha for the inner
				// shadow before blurring.

				const { color } = innerShadow;
				const shadowPaint = graphics.makePaint(true);
				graphics.setPaintColor(shadowPaint, layerColor);
				Graphics.setPaintBlendMode(shadowPaint, extraBlendPass ? BlendMode.SrcIn : BlendMode.SrcATop);
				graphics.setPaintBlur(shadowPaint, innerShadow.blurX + baseBlurX, innerShadow.blurY + baseBlurY);
				graphics.setPaintBlendFilter(shadowPaint, color, BlendMode.SrcIn);

				graphics.saveLayer(bounds, shadowPaint);
				graphics.translate(innerShadow.offsetX, innerShadow.offsetY);

				// Invert the alpha to compute inner part.
				const invertPaint = graphics.makePaint(true);
				graphics.setPaintMatrixColorFilter(invertPaint, [
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					-1,
					1
				]);
				this.drawPass(graphics, bounds, invertPaint);
				// restore draw pass (inverted aint)
				graphics.restore();
				// restore save layer used to that blurs and colors the shadow
				graphics.restore();

				if (extraBlendPass)
				{
					// Restore extra layer used to draw the contents to clip against (we
					// clip by drawing with srcIn)
					graphics.restore();
				}
			}
		}
		graphics.restore();
	}

	drawPass(graphics, bounds, layerPaint)
	{
		graphics.saveLayer(bounds, layerPaint);
		for (const drawable of this._Drawables)
		{
			drawable.draw(graphics);
		}

		for (const renderMask of this._RenderMasks)
		{
			const { mask } = renderMask;
			if (!mask.isActive)
			{
				continue;
			}

			const maskPaint = graphics.makePaint(true);
			switch (mask.maskType)
			{
				case MaskType.InvertedAlpha:
					graphics.setPaintMatrixColorFilter(maskPaint, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 1]);
					break;
				case MaskType.Luminance:
					graphics.setPaintMatrixColorFilter(maskPaint, [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0.33,
						0.59,
						0.11,
						0,
						0
					]);
					break;
				case MaskType.InvertedLuminance:
					graphics.setPaintMatrixColorFilter(maskPaint, [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						-0.33,
						-0.59,
						-0.11,
						0,
						1
					]);
					break;
				case MaskType.Alpha:
				default:
					graphics.setPaintMatrixColorFilter(maskPaint, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
					break;
			}
			Graphics.setPaintBlendMode(maskPaint, BlendMode.DstIn);
			graphics.saveLayer(bounds, maskPaint);
			for (const drawable of renderMask.drawables)
			{
				const wasHidden = drawable.isHidden;
				if (wasHidden)
				{
					drawable.isHidden = false;
				}
				drawable.draw(graphics);
				if (wasHidden)
				{
					drawable.isHidden = true;
				}
			}
			graphics.restore();
		}
	}
}