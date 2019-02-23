import Dispatcher from "./Dispatcher.js";

export default class Actor extends Dispatcher
{
	constructor()
	{
		super();

		this._Artboards = [];
		this._NestedActorAssets = [];
		this._Atlases = [];
	}

	getArtboard(name)
	{
		return this._Artboards.find(artboard => artboard._Name === name);
	}

	dispose(graphics)
	{
		for(const artboard of this._Artboards)
		{
			artboard.dispose(graphics);
		}
	}

	initialize(graphics)
	{
		for(let nested of this._NestedActorAssets)
		{
			if(nested.actor)
			{
				nested.actor.initialize(graphics);
			}
		}
		for(const atlas of this._Atlases)
		{
			atlas.initialize(graphics);
		}
		for(const artboard of this._Artboards)
		{
			artboard.initialize(graphics);
		}
	}

	makeInstance()
	{
		return (this._Artboards.length && this._Artboards[0].makeInstance()) || null;
	}

	get animations()
	{
		return (this._Artboards.length && this._Artboards[0]._Animations) || null;
	}
}