import ActorComponent from "./ActorComponent.js";
import {mat2d} from "gl-matrix";

export default class ActorSkin extends ActorComponent
{
	constructor()
	{
		super();
		this._BoneMatrices = null;
	}

	get boneMatrices()
	{
		return this._BoneMatrices;
	}

	update(dirt)
	{
		const parent = this._Parent;
		
		if(parent && parent._ConnectedBones)
		{
			const connectedBones = parent._ConnectedBones;
			const length = (connectedBones.length+1) * 6;
			let bt = this._BoneMatrices;
			if(!bt || bt.length !== length)
			{
				this._BoneMatrices = bt = new Float32Array(length);
				// First bone transform is always identity.
				bt[0] = 1;
				bt[1] = 0;
				bt[2] = 0;
				bt[3] = 1;
				bt[4] = 0;
				bt[5] = 0;
			}

			let bidx = 6; // Start after first identity.

			const mat = mat2d.create();

			for(const cb of connectedBones)
			{
				if(!cb.node)
				{
					bt[bidx++] = 1;
					bt[bidx++] = 0;
					bt[bidx++] = 0;
					bt[bidx++] = 1;
					bt[bidx++] = 0;
					bt[bidx++] = 0;
					continue;
				}

				const wt = mat2d.mul(mat, cb.node._WorldTransform, cb.ibind);

				bt[bidx++] = wt[0];
				bt[bidx++] = wt[1];
				bt[bidx++] = wt[2];
				bt[bidx++] = wt[3];
				bt[bidx++] = wt[4];
				bt[bidx++] = wt[5];
			}
		}

		parent.invalidateDrawable();
	}


	makeInstance(resetActor)
	{
		const node = new ActorSkin();
		node.copy(this, resetActor);
		return node;	
	}

	completeResolve()
	{
		super.completeResolve();
		const graph = this._Actor;
		let parent = this._Parent;
		if(parent)
		{
			parent.setSkin(this);
			graph.addDependency(this, parent);
			const connectedBones = parent.connectedBones;
			if(connectedBones && connectedBones.length)
			{
				for(const {node} of connectedBones)
				{
					graph.addDependency(this, node);
					const constraints = node.allConstraints;
								
					if(constraints)
					{
						for(const constraint of constraints)
						{
							graph.addDependency(this, constraint);
						}
					}
				}
			}
		}
	}
}