import Dispatcher from "./Dispatcher.js";
import ActorNode from "./ActorNode.js";
import ActorImage from "./ActorImage.js";
import NestedActorNode from "./NestedActorNode.js";
import AnimationInstance from "./AnimationInstance.js";

export default class Actor extends Dispatcher
{
	constructor()
	{
		super();

		this._Components = [];
		this._NestedActorAssets = [];
		this._Nodes = [];
		this._Drawables = [];
		this._Atlases = [];
		this._RootNode = new ActorNode();
		this._RootNode._Name = "Root";
		this._Components.push(this._RootNode);
		this._Animations = [];
		this._IsInstance = false;
		this._IsImageSortDirty = false;

		this._Order = null;
		this._IsDirty = false;
		this._DirtDepth = 0;
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

	get root()
	{
		return this._RootNode;
	}

	resolveHierarchy(graphics)
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
		if(!this._IsInstance)
		{
			let atlases = this._Atlases;
			for(let atlas of atlases)
			{
				graphics.deleteTexture(atlas);
			}
		}
		let drawables = this._Drawables;
		for(let drawable of drawables)
		{
			drawable.dispose(this, graphics);
		}
	}

	initialize(graphics)
	{
		if(!this._IsInstance)
		{
			// Load all the atlases.
			let atlases = this._Atlases;
			for(let i = 0; i < atlases.length; i++)
			{
				let atlas = atlases[i];
				atlases[i] = graphics.loadTexture(atlas);
			}

			for(let nested of this._NestedActorAssets)
			{
				if(nested.actor)
				{
					nested.actor.initialize(graphics);
				}
			}
		}
		let drawables = this._Drawables;
		for(let drawable of drawables)
		{
			drawable.initialize(this, graphics);
		}
	}

	advance(seconds)
	{
		// // First iterate solvers to see if any is dirty.
		// let solvers = this._Solvers;
		// let runSolvers = false;
		// for(let solver of solvers)
		// {
		// 	if(solver.needsSolve())
		// 	{
		// 		runSolvers = true;
		// 		break;
		// 	}
		// }

		// let nodes = this._Nodes;
		// for(let node of nodes)
		// {
		// 	if(node)
		// 	{
		// 		node.updateTransforms();
		// 	}
		// }

		// if(runSolvers)
		// {
		// 	for(let solver of solvers)
		// 	{
		// 		solver.solveStart();
		// 	}	

		// 	for(let solver of solvers)
		// 	{
		// 		solver.solve();
		// 	}

		// 	for(let solver of solvers)
		// 	{
		// 		solver._SuppressMarkDirty = true;
		// 	}

		// 	for(let node of nodes)
		// 	{
		// 		if(node)
		// 		{
		// 			node.updateTransforms();
		// 		}
		// 	}

		// 	for(let solver of solvers)
		// 	{
		// 		solver._SuppressMarkDirty = false;
		// 	}
		// }

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
		let drawables = this._Drawables;
		for(let drawable of drawables)
		{
			drawable.draw(graphics);
		}
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
		let actorInstance = new Actor();
		actorInstance._IsInstance = true;
		actorInstance.copy(this);
		return actorInstance;
	}

	computeAABB()
	{
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		for(let drawable of this._Drawables)
		{
			if(drawable.opacity < 0.01)
			{
				continue;
			}
			let aabb = drawable.computeAABB();
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

	copy(actor)
	{
		let components = actor._Components;
		this._Animations = actor._Animations;
		this._Atlases = actor._Atlases;
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
			let instanceNode = component.makeInstance(this);
			switch(instanceNode.constructor)
			{
				case NestedActorNode:
				case ActorImage:
					this._Drawables.push(instanceNode);
					break;
			}
			if(instanceNode.isNode)
			{
				this._Nodes.push(instanceNode);
			}
			this._Components.push(instanceNode);
		}
		this._RootNode = this._Components[0];

		for(let i = 1; i < this._Components.length; i++)
		{
			let component = this._Components[i];
			if(component == null)
			{
				continue;
			}
			component.resolveComponentIndices(this._Components);
		}

		for(let i = 1; i < this._Components.length; i++)
		{
			let component = this._Components[i];
			if(component == null)
			{
				continue;
			}
			component.completeResolve();
		}

		this.sortDependencies();

		this._Drawables.sort(function(a,b)
		{
			return a._DrawOrder - b._DrawOrder;
		});
	}
}