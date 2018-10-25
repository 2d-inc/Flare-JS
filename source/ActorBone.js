import ActorBoneBase from "./ActorBoneBase.js";

export default class ActorBone extends ActorBoneBase
{
	constructor()
	{
		super();

		this._FirstBone = null;
	}

	makeInstance(resetActor)
	{
		const node = new ActorBone();
		node.copy(this, resetActor);
		return node;	
	}

	completeResolve()
	{
		super.completeResolve();
		
		let children = this._Children;
		for(let child of children)
		{
			if(child instanceof ActorBone)
			{
				this._FirstBone = child;
				return;
			}
		}
	}	
}