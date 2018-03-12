import ActorComponent from "./ActorComponent.js";
import {vec2, mat2d} from "gl-matrix";


let TransformDirty = 1<<0;
let WorldTransformDirty = 1<<1;

function _UpdateTransform(node)
{
	let r = node._Rotation;
	let t = node._Translation;

	//t[0] += 0.01;
	let s = node._Scale;
	let transform = node._Transform;

	mat2d.fromRotation(transform, r);

	transform[4] = t[0];
	transform[5] = t[1];

	mat2d.scale(transform, transform, s);

	return transform;
}

export default class ActorNode extends ActorComponent
{
	constructor()
	{
		super();
		this._Children = [];
		this._Transform = mat2d.create();
		this._WorldTransform = mat2d.create();
		this._OverrideWorldTransform = false;
		this._Constraints = null;

		this._Translation = vec2.create();
		this._Rotation = 0;
		this._Scale = vec2.set(vec2.create(), 1, 1);
		this._Opacity = 1;
		this._RenderOpacity = 1;

		this._IsCollapsedVisibility = false;
		this._RenderCollapsed = false;
	}

	addConstraint(constraint)
	{
		let constraints = this._Constraints;
		if(!constraints)
		{
			this._Constraints = constraints = [];
		}
		if(constraints.indexOf(constraint) !== -1)
		{
			return false;
		}

		constraints.push(constraint);

		return true;
	}

	markTransformDirty()
	{
		let actor = this._Actor;
		if(!actor)
		{
			// Still loading?
			return;
		}
		if(!actor.addDirt(this, TransformDirty))
		{
			return;
		}
		actor.addDirt(this, WorldTransformDirty, true);
	}

	updateWorldTransform()
	{
		var parent = this._Parent;

		this._RenderOpacity = this._Opacity;
		
		if(parent)
		{
			this._RenderCollapsed = this._IsCollapsedVisibility || parent._RenderCollapsed;
			this._RenderOpacity *= parent._RenderOpacity;
			if(!this._OverrideWorldTransform)
			{
				mat2d.mul(this._WorldTransform, parent._WorldTransform, this._Transform);
			}
		}
		else
		{
			mat2d.copy(this._WorldTransform, this._Transform);
		}
	}
	
	get isNode()
	{
		return true;
	}

	get translation()
	{
		return this._Translation;
	}

	set translation(t)
	{
		if(vec2.exactEquals(this._Translation, t))
		{
			return;
		}

		vec2.copy(this._Translation, t);
		this.markTransformDirty();
	}

	get scale()
	{
		return this._Scale;
	}

	set scale(t)
	{
		if(vec2.exactEquals(this._Scale, t))
		{
			return;
		}

		vec2.copy(this._Scale, t);
		this.markTransformDirty();
	}

	get x()
	{
		return this._Translation[0];
	}

	set x(value)
	{
		if(this._Translation[0] != value)
		{
			this._Translation[0] = value;
			this.markTransformDirty();
		}
	}

	get y()
	{
		return this._Translation[1];
	}

	set y(value)
	{
		if(this._Translation[1] != value)
		{
			this._Translation[1] = value;
			this.markTransformDirty();
		}
	}

	get scaleX()
	{
		return this._Scale[0];
	}

	set scaleX(value)
	{
		if(this._Scale[0] != value)
		{
			this._Scale[0] = value;
			this.markTransformDirty();
		}
	}

	get scaleY()
	{
		return this._Scale[1];
	}

	set scaleY(value)
	{
		if(this._Scale[1] != value)
		{
			this._Scale[1] = value;
			this.markTransformDirty();
		}
	}

	get rotation()
	{
		return this._Rotation;
	}

	set rotation(value)
	{
		if(this._Rotation != value)
		{
			this._Rotation = value;
			this.markTransformDirty();
		}
	}

	get opacity()
	{
		return this._Opacity;
	}

	set opacity(value)
	{
		if(this._Opacity != value)
		{
			this._Opacity = value;
			this.markTransformDirty();
		}
	}

	update(dirt)
	{
		if((dirt & TransformDirty) === TransformDirty)
		{
			_UpdateTransform(this);
		}
		if((dirt & WorldTransformDirty) === WorldTransformDirty)
		{
			this.updateWorldTransform();
			let constraints = this._Constraints;
			if(constraints)
			{
				for(let constraint of constraints)
				{
					if(constraint.isEnabled)
					{
						constraint.constrain(this);
					}
				}
			}
		}
	}

	getWorldTransform()
	{
		if((this._DirtMask & WorldTransformDirty) !== WorldTransformDirty)
		{
			return this._WorldTransform;
		}

		let parent = this.parent;
		let chain = [this];
		while(parent)
		{
			chain.unshift(parent);
			parent = parent.parent;
		}
		for(let item of chain)
		{
			if(item instanceof ActorNode)
			{
				if((this._DirtMask & TransformDirty) !== TransformDirty)
				{
					_UpdateTransform(this);
				}
				if((this._DirtMask & WorldTransformDirty) !== WorldTransformDirty)
				{
					item.updateWorldTransform();
				}
			}
		}
		return this._WorldTransform;
	}

	get transform()
	{
		return this._Transform;
	}

	get worldTransform()
	{
		return this._WorldTransform;
	}

	get worldTranslation()
	{
		var transform = this._WorldTransform;
		return vec2.set(vec2.create(), transform[4], transform[5]);
	}

	setCollapsedVisibility(v)
	{
		if(this._IsCollapsedVisibility === v)
		{
			return;
		}

		this._IsCollapsedVisibility = v;
		this.markTransformDirty();
	}

	makeInstance(resetActor)
	{
		var node = new ActorNode();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		mat2d.copy(this._Transform, node._Transform);
		mat2d.copy(this._WorldTransform, node._WorldTransform);
		vec2.copy(this._Translation, node._Translation);
		vec2.copy(this._Scale, node._Scale);
		this._Rotation = node._Rotation;
		this._Opacity = node._Opacity;
		this._RenderOpacity = node._RenderOpacity;
		this._OverrideWorldTransform = node._OverrideWorldTransform;
	}

	overrideWorldTransform(transform)
	{
		this._OverrideWorldTransform = transform ? true : false;
		mat2d.copy(this._WorldTransform, transform);
		this.markTransformDirty();
	}
}