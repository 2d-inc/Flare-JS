import ActorNode from "./ActorNode.js";

export default class ActorNodeSolo extends ActorNode
{
	constructor()
	{
		super();
		this._ActiveChildIndex = 0;
	}

	setActiveChildIndex(idx)
	{
		this._ActiveChildIndex = Math.min(this._Children.length, Math.max(0, idx));

		for(var i = 0; i < this._Children.length; ++i)
		{
			var an = this._Children[i];
			var cv = i !== (this._ActiveChildIndex - 1);
			an.setCollapsedVisibility(cv);
		}
	}

	set activeChildIndex(index)
	{
		if(index === this._ActiveChildIndex)
		{
			return;
		}
		this.setActiveChildIndex(index);
	}

	get activeChildIndex()
	{
		return this._ActiveChildIndex;
	}

	makeInstance(resetActor)
	{
		let node = new ActorNodeSolo();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._ActiveChildIndex = node._ActiveChildIndex;
	}

	completeResolve()
	{
		super.completeResolve();
		// Hierarchy is resolved.
		this.setActiveChildIndex(this._ActiveChildIndex);
	}
}