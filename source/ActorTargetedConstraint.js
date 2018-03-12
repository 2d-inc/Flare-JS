import ActorConstraint from "./ActorConstraint.js";

export default class ActorTargetedConstraint extends ActorConstraint
{
	constructor()
	{
		super();

		this._TargetIdx = 0;
		this._Target = null;
	}

	makeInstance(resetActor)
	{
		var node = new ActorTargetedConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._TargetIdx = node._TargetIdx;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);

		if(this._TargetIdx !== 0)
		{
			let target = components[this._TargetIdx];
			if(target)
			{
				this._Target = target;
				// Add dependency on target.
				this._Actor.addDependency(this._Parent, target);
			}
		}

	}
}