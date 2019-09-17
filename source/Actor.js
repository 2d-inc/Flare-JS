import Dispatcher from "./Dispatcher.js";

export default class Actor extends Dispatcher
{
	constructor()
	{
		super();

		this._Artboards = [];
		this._EmbeddedAssets = [];
		this._Atlases = [];
		this._Fonts = new Map();
	}

	addFont(font)
	{
		this._Fonts.set(font.id, font);
	}

	getFont(id)
	{
		return this._Fonts.get(id);
	}

	getArtboard(name)
	{
		return this._Artboards.find(artboard => artboard._Name === name);
	}

	dispose(graphics)
	{
		for (const artboard of this._Artboards)
		{
			artboard.dispose(graphics);
		}
	}

	initialize(graphics)
	{
		for (let nested of this._EmbeddedAssets)
		{
			// Check if the actor is an instance, if so, presume the user has already initialized.
			if (nested.actor && !nested.actor.isInstance)
			{
				nested.actor.initialize(graphics);
			}
		}
		for (const atlas of this._Atlases)
		{
			atlas.initialize(graphics);
		}
		for (const artboard of this._Artboards)
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

	get artboards()
	{
		return this._Artboards;
	}

	get artboard()
	{
		return this._Artboards.length && this._Artboards[0];
	}

	get embeddedAssets()
	{
		return this._EmbeddedAssets;
	}
}