import ActorCollider from "./ActorCollider.js";

export default class ActorColliderPolygon extends ActorCollider
{
	constructor()
	{
		super();
		this._ContourVertices = new Float32Array();
	}

	get contourVertices()
	{
		return this._ContourVertices;
	}

	makeInstance(resetActor)
	{
		let node = new ActorColliderPolygon();
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);
		this._ContourVertices = node._ContourVertices;
	}
}