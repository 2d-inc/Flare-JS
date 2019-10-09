import ActorNode from "./ActorNode.js";
import ActorLayerNode from "./ActorLayerNode.js";
import ActorShape from "./ActorShape.js";
import ActorImage from "./ActorImage.js";
import NestedActorNode from "./NestedActorNode.js";
import AnimationInstance from "./AnimationInstance.js";
import {mat2d, vec2, vec4} from "gl-matrix";
import Graphics from "./Graphics.js";

export default class ActorArtboard
{
    constructor(actor)
    {
        this._Actor = actor;
        this._Components = [];
        this._Nodes = [];
        this._RootNode = new ActorNode();
		this._RootNode._Name = "Root";
		this._Components.push(this._RootNode);
        this._Drawables = [];
        this._Animations = [];
		this._IsImageSortDirty = false;
		this._Order = null;
		this._IsDirty = false;
		this._DirtDepth = 0;
        
        this._Name = "Artboard";
        this._Origin = vec2.create();
        this._Translation = vec2.create();
        this._Color = vec4.create();
        this._ClipContents = true;
		this._Width = 0;
		this._Height = 0;
	}

    get name()
    {
        return this._Name;
	}
	
	get width()
	{
		return this._Width;
	}

	get height()
	{
		return this._Height;
	}

    get origin()
    {
        return this._Origin;
	}
	
	get originWorld()
    {
        return vec2.fromValues(this._Width * this._Origin[0], this._Height * this._Origin[1]);
    }

    get translation()
    {
        return this._Translation;
    }

    get color()
    {
        return this._Color;
	}
	
	get color8()
	{
		return this._Color.map(c => Math.round(c*255));
	}

    get clipContents()
    {
        return this._ClipContents;
    }

    get root()
    {
        return this._RootNode;
    }

    get actor()
    {
        return this._Actor;
    }

    addDependency(a, b)
	{
		// "a" depends on "b"
		let dependents = b._Dependents;
		if(!dependents)
		{
			dependents = b._Dependents = [];
		}
		if(dependents.indexOf(a) !== -1)
		{
			return false;
		}
		dependents.push(a);
		return true;
	}

	sortDependencies()
	{
		let perm = new Set();
		let temp = new Set();

		let order = [];

		function visit(n)
		{
			if(perm.has(n))
			{
				return true;
			}
			if(temp.has(n))
			{
				console.warn("Dependency cycle!", n);
				return false;
			}
			
			temp.add(n);

			let dependents = n._Dependents;
			if(dependents)
			{
				for(let d of dependents)
				{
					if(!visit(d))
					{
						return false;
					}
				}
			}
			perm.add(n);
			order.unshift(n);
			
			return true;
		}

		if(!visit(this._RootNode))
		{
			// We have cyclic dependencies.
			return false;
		}

		for(let i = 0; i < order.length; i++)
		{
			let component = order[i];
			component._GraphOrder = i;
			component._DirtMask = 255;
		}
		this._Order = order;
		this._IsDirty = true;
	}

	addDirt(component, value, recurse)
	{
		if((component._DirtMask & value) === value)
		{
			// Already marked.
			return false;
		}

		// Make sure dirt is set before calling anything that can set more dirt.
		let dirt = component._DirtMask | value;
		component._DirtMask = dirt;

		this._IsDirty = true;

		component.onDirty(dirt);

		// If the order of this component is less than the current dirt depth, update the dirt depth
		// so that the update loop can break out early and re-run (something up the tree is dirty).
		if(component._GraphOrder < this._DirtDepth)
		{
			this._DirtDepth = component._GraphOrder;	
		}
		if(!recurse)
		{
			return true;
		}
		let dependents = component._Dependents;
		if(dependents)
		{
			for(let d of dependents)
			{
				this.addDirt(d, value, recurse);
			}
		}

		return true;
    }
    
    update()
	{
		if(!this._IsDirty)
		{
			return false;
		}
		
		let order = this._Order;
		let end = order.length;

		const maxSteps = 100;
		let step = 0;
		while(this._IsDirty && step < maxSteps)
		{
			this._IsDirty = false;
			// Track dirt depth here so that if something else marks dirty, we restart.
			for(let i = 0; i < end; i++)
			{
				let component = order[i];
				this._DirtDepth = i;
				let d = component._DirtMask;
				if(d === 0)
				{
					continue;
				}
				component._DirtMask = 0;
				component.update(d);

				if(this._DirtDepth < i)
				{
					break;
				}
			}
			step++;
		}

		return true;
	}
    
    resolveHierarchy()
	{
		let components = this._Components;
		for(let component of components)
		{
			if(component != null)
			{
				component._Actor = this;
				component.resolveComponentIndices(components);
				if(component.isNode)
				{
					this._Nodes.push(component);
				}
				switch(component.constructor)
				{
					case NestedActorNode:
					case ActorImage:
					case ActorShape:
					case ActorLayerNode:
						this._Drawables.push(component);
						break;
				}
			}
		}

		for(let component of components)
		{
			if(component != null)
			{
				component.completeResolve();
			}
		}

		this.sortDependencies();

		this._Drawables.sort(function(a,b)
		{
			return a._DrawOrder - b._DrawOrder;
		});
	}

	dispose(graphics)
	{
		const components = this._Components;
		for(const component of components)
		{
			component.dispose(this, graphics);
		}
		if(this._ClippingPath)
		{
			Graphics.destroyPath(this._ClippingPath);
			this._ClippingPath = null;
		}
    }
    

	advance(seconds)
	{
		this.update();

		let components = this._Components;
		// Advance last (update graphics buffers and such).
		for(let component of components)
		{
			if(component)
			{
				component.advance(seconds);
			}
		}

		if(this._IsImageSortDirty)
		{
			this._Drawables.sort(function(a,b)
			{
				return a._DrawOrder - b._DrawOrder;
			});
			this._IsImageSortDirty = false;
		}
	}

	draw(graphics)
	{
		graphics.save();
		if(this._ClippingPath)
		{
			graphics.clipPath(this._ClippingPath);
		}
		let drawables = this._Drawables;
		for(let drawable of drawables)
		{
			drawable.draw(graphics);
		}
		graphics.restore();
	}

	getNode(name)
	{
		let nodes = this._Nodes;
		for(let node of nodes)
		{
			if(node._Name === name)
			{
				return node;
			}
		}
		return null;
	}

	get animations()
	{
		return this._Animations;
	}

	getAnimation(name)
	{
		let animations = this._Animations;
		for(let animation of animations)
		{
			if(animation._Name === name)
			{
				return animation;
			}
		}
		return null;
	}

	getAnimationInstance(name)
	{
		let animation = this.getAnimation(name);
		if(!animation)
		{
			return null;
		}
		return new AnimationInstance(this, animation);
	}

	makeInstance()
	{
		const actorInstance = new ActorArtboard(this._Actor);
		actorInstance.copy(this);
		return actorInstance;
	}

	artboardAABB()
	{
		const {_Width:width, _Height:height} = this;
		const min_x = -this._Origin[0] * width;
		const min_y = -this._Origin[1] * height;
		return new Float32Array([min_x, min_y, min_x + width, min_y + height]);
	}

	computeAABB()
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		for(const drawable of this._Drawables)
		{
			if(drawable.opacity < 0.01)
			{
				continue;
			}
			const aabb = drawable.computeAABB();
			if(!aabb)
			{
				continue;
			}
			if(aabb[0] < min_x)
			{
				min_x = aabb[0];
			}
			if(aabb[1] < min_y)
			{
				min_y = aabb[1];
			}
			if(aabb[2] > max_x)
			{
				max_x = aabb[2];
			}
			if(aabb[3] > max_y)
			{
				max_y = aabb[3];
			}
		}

		return new Float32Array([min_x, min_y, max_x, max_y]);
	}

	copy(artboard)
	{
        this._Name = artboard._Name;
        this._Origin = vec2.clone(artboard._Origin);
        this._Translation = vec2.clone(artboard._Translation);
        this._Color = vec4.clone(artboard._Color);
        this._ClipContents = artboard._ClipContents;
		this._Width = artboard._Width;
		this._Height = artboard._Height;

		let components = artboard._Components;
		this._Animations = artboard._Animations;
		this._Components.length = 0;
		this._Nodes.length = 0;
		this._Drawables.length = 0;

		for(let component of components)
		{
			if(!component)
			{
				this._Components.push(null);
				continue;
			}
			this._Components.push(component.makeInstance(this));
		}
		this._RootNode = this._Components[0];

		this.resolveHierarchy();
	}

	initialize(graphics)
	{
		const components = this._Components;
		for(const component of components)
		{
			component.initialize(this, graphics);
		}

		if(this._ClipContents)
		{
			this._ClippingPath = graphics.makePath();
			const x = -this._Origin[0] * this._Width;
			const y = -this._Origin[1] * this._Height;
			this._ClippingPath.addRect(x, y, x+this._Width, y+this._Height);
		}
	}
}