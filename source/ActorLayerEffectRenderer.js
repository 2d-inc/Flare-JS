import ActorDrawable from "./ActorDrawable.js";
import ActorMask from "./ActorMask.js";

export default class ActorLayerEffectRenderer extends ActorDrawable
{
	constructor(actor)
	{
		super(actor);

		this._Drawables = [];
		this._RenderMasks = [];
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
	}

	computeMasks()
	{
		const renderMasks = this._RenderMasks;
		renderMasks.clear();
		let maskSearch = parent;
		const masks = [];

		while (maskSearch != null)
		{
			let masks = masks.concat(maskSearch.children.filter((child) => child instanceof ActorMask));
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
}