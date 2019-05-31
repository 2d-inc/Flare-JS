import ActorDrawable from "./ActorDrawable.js";
import { mat2d } from "gl-matrix";

export default class FlareNode extends ActorDrawable
{
	constructor()
	{
		super();

		this._EmbeddedAssetIndex = -1;
		this._Asset = null;
		this._Instance = null;
		this._UsingExistingInstance = false;
		this.propagateDirt = this.propagateDirt.bind(this);
	}

	get instance()
	{
		return this._Instance;
	}

	makeInstance(resetActor)
	{
		const node = new FlareNode();
		node.copy(this, resetActor);
		const { actor } = this._Asset;
		if (actor)
		{
			if (node._Instance)
			{
				const { components } = node._Instance;
				for (const component of components)
				{
					component.removeDirtyListeners();
				}
			}
			// If the asset has been set to an instance, make sure to use that and presume the user knows what they are doing.
			// This is really for cases when you want to mount an embedding item to an already loaded item.
			node._UsingExistingInstance = actor.isInstance;
			node._Instance = actor.isInstance ? actor : actor.makeInstance();
		}
		return node;
	}

	propagateDirt(node, dirt)
	{
		const { _Actor: actor } = this;
		if (!actor)
		{
			return;
		}
		if (!actor.addDirt(this, dirt, true))
		{
			return;
		}
	}

	getEmbeddedComponent(name, propagateDirt)
	{
		const { _Instance: instance } = this;
		if (!instance)
		{
			return null;
		}
		const node = instance.getNode(name);
		if (propagateDirt)
		{
			node.addDirtyListener(this.propagateDirt);
		}
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._EmbeddedAssetIndex = node._EmbeddedAssetIndex;
		this._Asset = node._Asset;
		this._DrawOrder = node._DrawOrder;
	}

	initialize(actor, graphics)
	{
		if (!this._UsingExistingInstance && this._Instance)
		{
			this._Instance.initialize(graphics);
			this._Instance.advance(0);
		}
	}

	updateWorldTransform()
	{
		super.updateWorldTransform();
		if (!this._UsingExistingInstance && this._Instance && !mat2d.exactEquals(this._Instance.root.worldTransform, this._WorldTransform))
		{
			this._Instance.root.overrideWorldTransform(this._WorldTransform);
			this._Instance.advance(0);
		}
	}

	computeAABB()
	{
		if (this._Instance)
		{
			return this._Instance.computeAABB();
		}
		return null;
	}

	draw(graphics)
	{
		if (!this._UsingExistingInstance && this._Instance)
		{
			this._Instance.draw(graphics);
		}
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		const { _EmbeddedAssetIndex: index, _Actor: artboard } = this;
		const { embeddedAssets } = artboard.actor;
		if (embeddedAssets && index < embeddedAssets.length)
		{
			const asset = embeddedAssets[index];
			if (asset)
			{
				this._Asset = asset;
				// - If the asset has been set to an instance, make sure to use that and presume the user knows what they are doing.
				// This is really for cases when you want to mount an embedding item to an already loaded item.
				// - No instance here to prevent adding double items to layers when instance is already made.
				//this._Instance = asset.actor.isInstance ? asset.actor : asset.actor.makeInstance();
			}
		}
	}
}