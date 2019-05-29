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

		if (this._Asset.actor)
		{
			if (node._Instance)
			{
				const { components } = node._Instance;
				for (const component of components)
				{
					component.removeDirtyListeners();
				}
			}
			node._Instance = this._Asset.actor.makeInstance();
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
		if (this._Instance)
		{
			this._Instance.initialize(graphics);
			this._Instance.advance(0);
		}
	}

	updateWorldTransform()
	{
		super.updateWorldTransform();
		if (this._Instance && !mat2d.exactEquals(this._Instance.root.worldTransform, this._WorldTransform))
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
		if (this._Instance)
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
				this._Instance = asset.actor.makeInstance();
			}
		}
	}
}