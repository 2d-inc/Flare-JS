export default class ActorComponent
{
	constructor()
	{
		this._Name = "Component";
		this._Parent = null;
		this._CustomProperties = [];
		this._DirtMask = 0;
		this._GraphOrder = -1;
		this._Dependents = null;
		this._Actor = null;
		this._ParentIdx = -1;
	}

	get parent()
	{
		return this._Parent;
	}

	onDirty(dirt)
	{

	}

	initialize(actor, graphics)
	{

	}

	update(dirt)
	{
		
	}

	advance(seconds)
	{
	}

	resolveComponentIndices(components)
	{
		if(this._ParentIdx !== -1)
		{
			let parent = components[this._ParentIdx];
			this._Parent = parent;
			if(this.isNode && parent && parent._Children)
			{
				parent._Children.push(this);
			}
			if(parent)
			{
				this._Actor.addDependency(this, parent);
			}
		}
	}

	completeResolve()
	{
	}

	copy(component, resetActor)
	{
		this._Name = component._Name;
		this._ParentIdx = component._ParentIdx;
		this._Idx = component._Idx;
		this._Actor = resetActor;
	}

	getCustomProperty(name)
	{
		let props = this._CustomProperties;
		for(let prop of props)
		{
			if(prop._Name === name)
			{
				return prop;
			}
		}
		return null;
	}
}