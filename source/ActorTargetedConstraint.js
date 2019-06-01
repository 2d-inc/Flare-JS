import ActorConstraint from "./ActorConstraint.js";

export default class ActorTargetedConstraint extends ActorConstraint
{
	constructor()
	{
		super();

		this._TargetIdx = 0;
		this._TargetName = null;
		this._Target = null;
	}

	makeInstance(resetActor)
	{
		const node = new ActorTargetedConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._TargetIdx = node._TargetIdx;
		this._TargetName = node._TargetName;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		const {_TargetIdx:targetIdx, _TargetName:targetName} = this;
		if(targetIdx !== 0)
		{
			const target = components[targetIdx];
			if(target)
			{
				if(targetName)
				{
					this._Target = target.getEmbeddedComponent(targetName);
					if(this._Target)
					{
						this._Target.addExternalDependency(this._Parent);
					}
				}
				else
				{
					this._Target = target;
					// Add dependency on target.
					this._Actor.addDependency(this._Parent, target);
				}
				
			}
		}

	}
}