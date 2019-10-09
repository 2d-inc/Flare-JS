import ActorNode from "./ActorNode.js";
import BlendMode from "./BlendMode.js";
import FillRule from "./FillRule.js";

export default class ActorDrawable extends ActorNode
{
	constructor(actor)
	{
		super(actor);

		this._DrawOrder = 0;
		this._BlendMode = BlendMode.SrcOver;
		this._IsHidden = false;
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
		const artboard = this._Actor;
		// Find clips.
		const clips = this.getClips();

		if (clips.length)
		{
			for (const clipList of clips)
			{
				for (const clip of clipList)
				{
					const shapes = new Set();
					const { node, intersect } = clip;
					if (!node)
					{
						continue;
					}
					node.all(function (node)
					{
						if (node.paths && !node.renderCollapsed)
						{
							shapes.add(node);
						}
					});
					if (intersect)
                    {
                        const clipPath = graphics.makePath(true);

                        for (const shape of shapes)
                        {
                            for (const path of shape.paths)
                            {
								graphics.addPath(clipPath, path.getPath(graphics), path.getPathTransform());
                                //path.addPath(node.getPath(graphics), node.getPathTransform());
                            }
                        }
                        if (!clipPath.isEmpty())
                        {
							graphics.clipPath(clipPath);
                            // skCanvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);
                        }
                    }
                    else
                    {
                        for (const shape of shapes)
                        {
                            for (const path of shape.paths)
                            {
                                const clipPath = graphics.makePath(true);
                                const { originWorld } = artboard;
								clipPath.addRect(originWorld[0], originWorld[1], originWorld[0] + artboard.width, originWorld[1] + artboard.height);
								graphics.addPath(clipPath, path.getPath(graphics), path.getPathTransform());
								graphics.setPathFillType(clipPath, FillRule.EvenOdd);
								graphics.clipPath(clipPath);
                            }
                        }
                    }
				}
			}
		}
	}
}