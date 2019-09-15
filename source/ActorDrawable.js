import ActorNode from "./ActorNode.js";
import BlendMode from "./BlendMode.js";

export default class ActorDrawable extends ActorNode
{
	constructor(actor)
	{
		super(actor);

		this._DrawOrder = 0;
		this._BlendMode = BlendMode.SrcOver;
		this._IsHidden = false;
		this._Layer = null;
		this._LayerId = null;
		this._LayerName = null;
	}

	get blendMode()
	{
		return this._BlendMode;
	}

	get layer()
	{
		return this._Layer;
	}

	set layer(value)
	{
		if(this._Layer === value)
		{
			return;
		}
		if(this._Layer)
		{
			this._Layer.removeDrawable(this);
		}
		this._Layer = value;
		if(value)
		{
			value.addDrawable(this);
		}
	}

	get drawOrder()
	{
		return this._DrawOrder;
	}

	get blendMode()
	{
		return this._BlendMode;
	}

	get isHidden()
	{
		return this._IsHidden;
	}

	set isHidden(value)
	{
		this._IsHidden = value;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._DrawOrder = node._DrawOrder;
		this._BlendMode = node._BlendMode;
		this._IsHidden = node._IsHidden;
		this._LayerId = node._LayerId;
		this._LayerName = node._LayerName;
	}

	getClips()
	{
		// Find clips.
		let clipSearch = this;
		let clips = [];
		while (clipSearch)
		{
			if (clipSearch._Clips)
			{
				clips.push(clipSearch._Clips);
			}
			clipSearch = clipSearch.parent;
		}

		return clips;
	}

	clip(graphics)
	{
		// Find clips.
		const clips = this.getClips();

		if (clips.length)
		{
			for (const clipList of clips)
			{
				const clipPath = graphics.makePath(true);
				for (let clip of clipList)
				{
					let shapes = new Set();
					clip.all(function (node)
					{
						if (node.paths && !node.renderCollapsed)
						{
							shapes.add(node);
						}
					});
					for (let shape of shapes)
					{
						const paths = shape.paths;
						for (const path of paths)
						{
							graphics.addPath(clipPath, path.getPath(graphics), path.getPathTransform());
						}
					}
				}
				if (!clipPath.isEmpty())
				{
					graphics.clipPath(clipPath);
				}
			}
		}
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);

		const {_LayerId:layerId, _LayerName:ename} = this;
		if(!layerId)
		{
			return;
		}
		const layer = components[layerId];
		if(ename)
		{
			this.layer = layer.getEmbeddedComponent(ename);
		}
		else
		{
			this.layer = layer;
		}
	}
}