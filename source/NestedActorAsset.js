export default class NestedActorAsset
{
	constructor(name, id)
	{
		this._Id = id;
		this._Name = name;
		this._Actor = null;
	}

	get id()
	{
		return this._Id;
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