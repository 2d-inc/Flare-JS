import ActorDrawable from "./ActorDrawable.js";

export default class ActorLayerNode extends ActorDrawable
{
	constructor(actor)
	{
		super(actor);
		this._Drawables = [];
	}

	addDrawable(component)
	{
		const index = this._Drawables.indexOf(component);
		if (index !== -1)
		{
			return false;
		}
		this._Drawables.push(component);
		return true;
	}

	removeDrawable(component)
	{
		const index = this._Drawables.indexOf(component);
		if (index === -1)
		{
			return false;
		}
		this._Drawables.splice(index, 1);
		return true;
	}

	sortDrawables()
	{
		this._Drawables.sort(function (a, b)
		{
			return a._DrawOrder - b._DrawOrder;
		});
	}

	makeInstance(resetActor)
	{
		const node = new ActorLayerNode();
		node.copy(this, resetActor);
		return node;
	}

	draw(graphics)
	{
		if(this._RenderCollapsed)
		{
			return false;
		}
		for (const drawable of this._Drawables)
		{
			drawable.draw(graphics);
		}
		return true;
	}

	completeResolve()
	{
		super.completeResolve();

		this.sortDrawables();
	}
}