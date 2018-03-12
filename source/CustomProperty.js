import ActorComponent from "./ActorComponent.js";

export default class CustomProperty extends ActorComponent
{
	constructor()
	{
		super();
		this._PropertyType = CustomProperty.Integer;
		this._Value = 0;
	}

	get propertyType()
	{
		return this._PropertyType;
	}

	get value()
	{
		return this._Value;
	}

	makeInstance(resetActor)
	{
		var node = new CustomProperty();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._PropertyType = node._PropertyType;
		this._Value = node._Value;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		if(this._ParentIdx !== undefined)
		{
			this._Parent = components[this._ParentIdx];
			if(this._Parent)
			{
				this._Parent._CustomProperties.push(this);	
			}
		}
	}
}

CustomProperty.Type =
{
	Integer:0,
	Float:1,
	String:2,
	Boolean:3
};