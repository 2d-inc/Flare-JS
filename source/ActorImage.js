import ActorNode from "./ActorNode.js";
import {vec2, mat2d} from "gl-matrix";

let White = [1.0, 1.0, 1.0, 1.0];
export default class ActorImage extends ActorNode
{
	constructor()
	{
		super();
		this._DrawOrder = 0;
		this._BlendMode = ActorImage.BlendModes.Normal;
		this._AtlasIndex = -1;
		this._NumVertices = 0;
		this._HasVertexDeformAnimation = false;
		this._AnimationDeformedVertices = null;
		this._Vertices = null;
		this._Triangles = null;
		this._ConnectedBones = null;
		this._BoneMatrices = null;
		this._IsInstance = false;
		this._IsHidden = false;

		this._VertexBuffer = null;
		this._IndexBuffer = null;
		this._DeformVertexBuffer = null;

		this._SequenceFrames = null;
		this._SequenceFrame = 0;
		this._SequenceUVs = null;
		this._SequenceUVBuffer = null;
	}

	get isHidden()
	{
		return this._IsHidden;
	}

	set isHidden(hidden)
	{
		this._IsHidden = hidden;
	}

	get hasVertexDeformAnimation()
	{
		return this._HasVertexDeformAnimation;
	}
		
	set hasVertexDeformAnimation(value)
	{
		this._HasVertexDeformAnimation = value;
		this._AnimationDeformedVertices = new Float32Array(this._NumVertices * 2);

		// Copy the deform verts from the rig verts.
		var writeIdx = 0;
		var readIdx = 0;
		var readStride = this._VertexStride;
		for(var i = 0; i < this._NumVertices; i++)
		{
			this._AnimationDeformedVertices[writeIdx++] = this._Vertices[readIdx];
			this._AnimationDeformedVertices[writeIdx++] = this._Vertices[readIdx+1];
			readIdx += readStride;
		}
	}

	computeAABB()
	{
		let worldVertices = this.computeWorldVertices();
		let nv = worldVertices.length/2;
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		let readIdx = 0;
		for(let i = 0; i < nv; i++)
		{
			let x = worldVertices[readIdx++];
			let y = worldVertices[readIdx++];
			if(x < min_x)
			{
				min_x = x;
			}
			if(y < min_y)
			{
				min_y = y;
			}
			if(x > max_x)
			{
				max_x = x;
			}
			if(y > max_y)
			{
				max_y = y;
			}
		}

		return new Float32Array([min_x, min_y, max_x, max_y]);
	}

	computeWorldVertices()
	{
		let vertices = this._HasVertexDeformAnimation ? this._AnimationDeformedVertices : this._Vertices;

		let stride = this._HasVertexDeformAnimation ? 2 : this._VertexStride;
		let readIdx = 0;
		let writeIdx = 0;

		let world = this._WorldTransform;

		let nv = this._NumVertices;
		let deformed = new Float32Array(nv*2);

		if(this._ConnectedBones)
		{
			let weightIndex = 4;
			let weightStride = 12;
			let weightVertices = this._Vertices;

			var bones = this._BoneMatrices;

			for(let i = 0; i < nv; i++)
			{
				let x = vertices[readIdx];
				let y = vertices[readIdx+1];
				
				readIdx += stride;

				var px = world[0] * x + world[2] * y + world[4];
				var py = world[1] * x + world[3] * y + world[5];

				var fm = new Float32Array(6);
				for(var wi = 0; wi < 4; wi++)
				{
					var boneIndex = weightVertices[weightIndex+wi];
					var weight = weightVertices[weightIndex+wi+4];

					var bb = boneIndex*6;

					for(let j = 0; j < 6; j++)
					{
						fm[j] += bones[bb+j] * weight;
					}
				}

				weightIndex += weightStride;

				x = fm[0] * px + fm[2] * py + fm[4];
				y = fm[1] * px + fm[3] * py + fm[5];

				deformed[writeIdx++] = x;
				deformed[writeIdx++] = y;
			}
		}
		else
		{
			for(let i = 0; i < nv; i++)
			{
				let x = vertices[readIdx];
				let y = vertices[readIdx+1];

				deformed[writeIdx++] = world[0] * x + world[2] * y + world[4];
				deformed[writeIdx++] = world[1] * x + world[3] * y + world[5];
				readIdx += stride;
			}
		}

		return deformed;
	}

	dispose(actor, graphics)
	{
		if(this._IsInstance)
		{
			if(this._DeformVertexBuffer)
			{
				this._DeformVertexBuffer.dispose();
				this._DeformVertexBuffer = null;
			}
		}
		else
		{
			if(this._VertexBuffer)
			{
				this._VertexBuffer.dispose();
				this._VertexBuffer = null;
			}
			if(this._IndexBuffer)
			{
				this._IndexBuffer.dispose();
				this._IndexBuffer = null;
			}
			if(this._SequenceUVBuffer)
			{
				this._SequenceUVBuffer.dispose();
				this._SequenceUVBuffer = null;
			}
		}
	}

	initialize(actor, graphics)
	{
		if(!this._IsInstance)
		{
			if(this._VertexBuffer)
			{
				this._VertexBuffer.dispose();
			}
			if(this._VertexBuffer)
			{
				this._VertexBuffer.dispose();
			}
			if(this._SequenceUVBuffer)
			{
				this._SequenceUVBuffer.dispose();
			}

			this._VertexBuffer = graphics.makeVertexBuffer(this._Vertices);
			this._IndexBuffer = graphics.makeIndexBuffer(this._Triangles);

			if(this._SequenceUVs)
			{
				this._SequenceUVBuffer = graphics.makeVertexBuffer(this._SequenceUVs);
			}
		}
		else if(this._HasVertexDeformAnimation)
		{
			if(this._DeformVertexBuffer)
			{
				this._DeformVertexBuffer.dispose();
			}
			this._DeformVertexBuffer = graphics.makeVertexBuffer(this._AnimationDeformedVertices);
		}

		if(this._IsInstance && this._ConnectedBones)
		{
			var bt = this._BoneMatrices = new Float32Array((this._ConnectedBones.length+1) * 6);

			// First bone transform is always identity.
			bt[0] = 1;
			bt[1] = 0;
			bt[2] = 0;
			bt[3] = 1;
			bt[4] = 0;
			bt[5] = 0;
		}
		// Keep vertices for world calculations.
		// delete this._Vertices;
		delete this._Triangles;
		delete this._SequenceUVs;
		this._Texture = actor._Atlases[this._AtlasIndex];
	}

	advance()
	{
		if(this._HasVertexDeformAnimation && this._VerticesDirty)
		{
			this._DeformVertexBuffer.update(this._AnimationDeformedVertices);
			this._VerticesDirty = false;
		}

		if(this._ConnectedBones)
		{
			var bt = this._BoneMatrices;
			var bidx = 6; // Start after first identity.

			var mat = mat2d.create();

			for(var i = 0; i < this._ConnectedBones.length; i++)
			{
				var cb = this._ConnectedBones[i];
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
				var wt = mat2d.mul(mat, cb.node._WorldTransform, cb.ibind);

				bt[bidx++] = wt[0];
				bt[bidx++] = wt[1];
				bt[bidx++] = wt[2];
				bt[bidx++] = wt[3];
				bt[bidx++] = wt[4];
				bt[bidx++] = wt[5];
			}
		}
	}

	draw(graphics)
	{
		if(this._RenderCollapsed || this._IsHidden)
		{
			return;
		}

		var t = this._WorldTransform;
		switch(this._BlendMode)
		{
			case ActorImage.BlendModes.Normal:
				graphics.enableBlending();
				break;
			case ActorImage.BlendModes.Multiply:
				graphics.enableMultiplyBlending();
				break;
			case ActorImage.BlendModes.Screen:
				graphics.enableScreenBlending();
				break;
			case ActorImage.BlendModes.Additive:
				graphics.enableAdditiveBlending();
				break;

		}

		let uvBuffer =  this._SequenceUVBuffer || null;
		let uvOffset;
		if(this._SequenceUVBuffer)
		{
			let numFrames = this._SequenceFrames.length;
			let frame = this._SequenceFrame%numFrames;
			if(uvOffset < 0)
			{
				frame += numFrames;
			}
			uvOffset = this._SequenceFrames[frame].offset;
		}

		graphics.prep(this._Texture, White, this._RenderOpacity, t, this._VertexBuffer, this._ConnectedBones ? this._BoneMatrices : null, this._DeformVertexBuffer, uvBuffer, uvOffset);
		graphics.draw(this._IndexBuffer);
	}

	resolveComponentIndices(components)
	{
		ActorNode.prototype.resolveComponentIndices.call(this, components);

		if(this._ConnectedBones)
		{
			for(var j = 0; j < this._ConnectedBones.length; j++)
			{
				var cb = this._ConnectedBones[j];
				cb.node = components[cb.componentIndex];
				if(cb.node)
				{
					cb.node._IsConnectedToImage = true;
				}
			}
		}
	}

	makeInstance(resetActor)
	{
		var node = new ActorImage();
		node._IsInstance = true;
		ActorImage.prototype.copy.call(node, this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._DrawOrder = node._DrawOrder;
		this._BlendMode = node._BlendMode;
		this._AtlasIndex = node._AtlasIndex;
		this._NumVertices = node._NumVertices;
		this._VertexStride = node._VertexStride;
		this._HasVertexDeformAnimation = node._HasVertexDeformAnimation;
		this._Vertices = node._Vertices;
		this._Triangles = node._Triangles;
		// N.B. actor.initialize must've been called before instancing.
		this._VertexBuffer = node._VertexBuffer;
		this._IndexBuffer = node._IndexBuffer;
		this._SequenceUVBuffer = node._SequenceUVBuffer;
		this._SequenceFrames = node._SequenceFrames;
		if (node._HasVertexDeformAnimation)
		{
			let deformedVertexLength = this._NumVertices * 2;
			this._AnimationDeformedVertices = new Float32Array(deformedVertexLength);
			for(let i = 0; i < deformedVertexLength; i++)
			{
				this._AnimationDeformedVertices[i] = node._AnimationDeformedVertices[i];
			}
		}

		if(node._ConnectedBones)
		{
			this._ConnectedBones = [];
			for(let cb of  node._ConnectedBones)
			{
				// Copy all props except for the actual node reference which will update in our resolve.
				this._ConnectedBones.push({
						componentIndex:cb.componentIndex,
						bind:cb.bind,
						ibind:cb.ibind
					});
			}
		}
	}
}


ActorImage.BlendModes = 
{
	"Normal":0,
	"Multiply":1,
	"Screen":2,
	"Additive":3
};
