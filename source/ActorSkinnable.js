const ActorSkinnable = (ActorSkinnable) => class extends ActorSkinnable
{
	constructor()
	{
		super();
		this._ConnectedBones = null;
		this._Skin = null;
	}

	setSkin(skin)
	{
		this._Skin = skin;
	}

	get skin()
	{
		return this._Skin;
	}

	get connectedBones()
	{
		return this._ConnectedBones;
	}

	get isConnectedToBones()
	{
		return this._ConnectedBones && this._ConnectedBones.length > 0;
	}

	resolveComponentIndices(components)
	{
		super.resolveComponentIndices(components);
		const { _ConnectedBones: connectedBones } = this;
		if (connectedBones)
		{
			for (const cb of connectedBones)
			{
				const { componentIndex, ename } = cb;
				if (ename)
				{
					const flareNode = components[componentIndex];
					cb.node = flareNode.getEmbeddedComponent(ename, false);
					cb.flareNode = flareNode;
				}
				else
				{
					cb.node = components[componentIndex];
				}
			}
		}
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		if (node._ConnectedBones)
		{
			this._ConnectedBones = [];
			for (const cb of node._ConnectedBones)
			{
				// Copy all props except for the actual node reference which will update in our resolve.
				this._ConnectedBones.push({
					ename: cb.ename,
					componentIndex: cb.componentIndex,
					bind: cb.bind,
					ibind: cb.ibind
				});
			}
		}
	}
}

export default ActorSkinnable;