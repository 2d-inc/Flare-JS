import ActorNode from "./ActorNode.js";
import ActorBone from "./ActorBone.js";
import ActorIKConstraint from "./ActorIKConstraint.js";

export default class ActorIKTarget extends ActorNode
{
	constructor()
	{
		super();

		this._Order = 0;
		this._Strength = 0;
		this._InvertDirection = false;
		this._InfluencedBones = null;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);

		let constraint = new ActorIKConstraint();
		this._Constraint = constraint;


		let bones = this._InfluencedBones;
		constraint._Actor = this._Actor;
		constraint._TargetIdx = this._Idx;
		constraint._ParentIdx = bones ? bones[bones.length-1] : -1;
		constraint._InvertDirection = this._InvertDirection;
		constraint._InfluencedBones = bones;
		constraint._Strength = this._Strength;
		constraint._IsEnabled = true;
		constraint.resolveComponentIndices(components);
	}

	completeResolve()
	{
		super.completeResolve();
		
		this._Constraint.completeResolve();
	}

	get strength()
	{
		if(this._Constraint)
		{
			return this._Constraint.strength;
		}
		return 0;
	}

	set strength(s)
	{
		if(this._Constraint)
		{
			this._Constraint.strength = s;
		}
	}

	makeInstance(resetActor)
	{
		let node = new ActorIKTarget();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Order = node._Order;
		this._Strength = node._Strength;
		this._InvertDirection = node._InvertDirection;
		this._InfluencedBones = [];
		if(node._InfluencedBones)
		{
			for (var i = 0; i < node._InfluencedBones.length; i++)
			{
				var ib = node._InfluencedBones[i];
				if(!ib)
				{
					continue;
				}
				if(ib.constructor === ActorBone)
				{
					this._InfluencedBones.push(ib._Idx);
				}
				else
				{
					this._InfluencedBones.push(ib);
				}
			}
		}
	}
}