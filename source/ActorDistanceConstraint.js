import ActorTargetedConstraint from "./ActorTargetedConstraint.js";
import { vec2 } from "gl-matrix";

const DistanceMode =
{
	Closer:0,
	Further:1,
	Exact:2
};

export default class ActorDistanceConstraint extends ActorTargetedConstraint
{
	constructor(actor)
	{
		super(actor);

		this._Distance = 100.0;
		this._Mode = DistanceMode.Closer;
	}

	makeInstance(resetActor)
	{
		let node = new ActorDistanceConstraint();
		node.copy(this, resetActor);
		return node;	
	}

	get distance()
	{
		return this._Distance;
	}

	set distance(distance)
	{
		if(this._Distance === distance)
		{
			return;
		}

		this._Distance = distance;
		this.markDirty();
	}

	get mode()
	{
		return this._Mode;
	}

	set mode(mode)
	{
		if(this._Mode === mode)
		{
			return;
		}

		this._Mode = mode;
		this.markDirty();
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._Distance = node._Distance;
		this._Mode = node._Mode;
	}

	constrain(tip)
	{
		let target = this._Target;
		if(!target)
		{
			return;
		}

		let parent = this._Parent;


		let targetTranslation = target.worldTranslation;
		let ourTranslation = parent.worldTranslation;
		
		let { _Strength:t, _Mode:mode, _Distance:distance } = this;

		let toTarget = vec2.subtract(vec2.create(), ourTranslation, targetTranslation);
		let currentDistance = vec2.length(toTarget);
		switch(mode)
		{
			case DistanceMode.Closer:
				if(currentDistance < distance)
				{
					return;
				}
				break;
			case DistanceMode.Further:
				if(currentDistance > distance)
				{
					return;
				}
				break;
		}
		if(currentDistance < 0.001)
		{
			return true;
		}

		vec2.scale(toTarget, toTarget, 1.0/currentDistance);
		vec2.scale(toTarget, toTarget, distance);

		let world = parent.worldTransform;
		let position = vec2.lerp(vec2.create(), ourTranslation, vec2.add(vec2.create(), targetTranslation, toTarget), t);
		world[4] = position[0];
		world[5] = position[1];
	}
}