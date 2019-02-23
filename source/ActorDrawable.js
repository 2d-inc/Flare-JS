import ActorNode from "./ActorNode.js";

export default class ActorDrawable extends ActorNode
{
	constructor(actor)
	{
		super(actor);

        this._DrawOrder = 0;
        this._BlendMode = null;
        this._IsHidden = false;
    }
    
    get drawOrder()
    {
        return this._DrawOrder;
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
		while(clipSearch)
		{
			if(clipSearch._Clips)
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

		if(clips.length)
		{
			for(const clipList of clips)
			{
				const clipPath = graphics.makePath(true);
				for(let clip of clipList)
				{
					let shapes = new Set();
					clip.all(function(node)
					{
						if(node.paths)
						{
							shapes.add(node);
						}
					});
					for(let shape of shapes)
					{
						const paths = shape.paths;
						for(const path of paths)
						{
							graphics.addPath(clipPath, path.getPath(graphics), path.getPathTransform());
						}
					}
				}
				graphics.clipPath(clipPath);
			}
		}
	}
}