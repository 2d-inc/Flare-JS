export default class FlareAsset
{
	constructor(name, owner, id)
	{
		this._Id = id;
		this._Owner = owner;
		this._Name = name;
		this._Actor = null;
	}

	get id()
	{
		return this._Id;
	}

	get owner()
	{
		return this._Owner;
	}

	get name()
	{
		return this._Name;
	}

	get actor()
	{
		return this._Actor;
	}
}