import ActorSkinnable from "./ActorSkinnable.js";
import ActorDrawable from "./ActorDrawable.js";
import {vec2, mat2d} from "gl-matrix";
import Graphics from "./Graphics.js";

const White = [1.0, 1.0, 1.0, 1.0];
export default class ActorImage extends ActorSkinnable(ActorDrawable)
{
	constructor()
	{
		super();
		this._AtlasIndex = -1;
		this._NumVertices = 0;
		this._Vertices = null;
		this._Triangles = null;
		this._IsInstance = false;

		this._VertexBuffer = null;
		this._IndexBuffer = null;
		this._DeformVertexBuffer = null;

		this._SequenceFrames = null;
		this._SequenceFrame = 0;
		this._SequenceUVs = null;
		this._SequenceUVBuffer = null;

		this._skUV = null;
		this._skPos = null;
		this._Weights = null;
		this._Atlas = null;
	}

	invalidateDrawable()
	{
		if(this._SkVertices)
		{
			this._SkVertices.delete();
			this._SkVertices = null;
		}
	}

	get deformVertices()
	{
		return this._skPos;
	}

	computeAABB()
	{
		const worldVertices = this.computeWorldVertices();
		const nv = worldVertices.length;
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		for(let i = 0; i < nv; i++)
		{
			let v = worldVertices[i];
			let x = v[0];
			let y = v[1]
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

	skinVertices(vertices, dest)
	{
		const {skin, _Weights:weightVertices} = this;
		let weightIndex = 0;
		const weightStride = 8;
		const world = this._WorldTransform;

		const bones = skin.boneMatrices;
		let destIdx = 0;
		
		for(let i = 0, length = vertices.length; i < length; i++)
		{
			let v = vertices[i];
			let x = v[0];
			let y = v[1];

			const px = world[0] * x + world[2] * y + world[4];
			const py = world[1] * x + world[3] * y + world[5];

			const fm = new Float32Array(6);
			for(let wi = 0; wi < 4; wi++)
			{
				const boneIndex = weightVertices[weightIndex+wi];
				const weight = weightVertices[weightIndex+wi+4];

				const bb = boneIndex*6;

				for(let j = 0; j < 6; j++)
				{
					fm[j] += bones[bb+j] * weight;
				}
			}

			weightIndex += weightStride;

			x = fm[0] * px + fm[2] * py + fm[4];
			y = fm[1] * px + fm[3] * py + fm[5];

			dest.push(vec2.fromValues(x, y));
		}

		return dest;
	}

	computeWorldVertices(bonesOnly)
	{
		const vertices = this._skPos;
		
		const deformed = [];

		const {isConnectedToBones} = this;
		if(isConnectedToBones)
		{
			this.skinVertices(vertices, deformed);
		}
		else
		{
			const world = this._WorldTransform;
			for(let i = 0, nv = this._NumVertices; i < nv; i++)
			{
				const v = vertices[i];
				const x = vertices[0];
				const y = vertices[1];

				deformed.push(vec2.fromValues(world[0] * x + world[2] * y + world[4], world[1] * x + world[3] * y + world[5]));
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

	initialize(artboard, graphics)
	{
		const {actor} = artboard;
		this._Atlas = this._AtlasIndex > -1 && this._AtlasIndex < actor._Atlases.length ? actor._Atlases[this._AtlasIndex] : null;
		if(!this._Atlas || !this._Atlas.img)
		{
			return;
		}

		const {width, height} = this._Atlas;

		// Break out buffers as SKIA expects them.
		const {_VertexStride:stride, _Vertices:vertices, _NumVertices:numVertices} = this;
		if(vertices)
		{
			const uv = [];
			const pos = [];
			const weights = stride === 12 ? new Float32Array(numVertices * 8) : null;
			let weightIndex = 0;
			for(let i = 0, length = vertices.length; i < length; i+= stride)
			{
				pos.push(vec2.fromValues(vertices[i], vertices[i+1]));
				uv.push(vec2.fromValues(vertices[i+2]*width, vertices[i+3]*height));

				if(weights)
				{
					const baseWeightIndex = i+4;
					for(let j = 0; j < 8; j++)
					{
						weights[weightIndex++] = vertices[baseWeightIndex+j];
					}
				}
			}
			this._skUV = uv;
			this._skPos = pos;
			this._Weights = weights;
		}
	}

	getVertices(graphics)
	{
		if (this._SkVertices)
		{
			return this._SkVertices;
		}

		const {_skUV, _skPos, _Triangles, isConnectedToBones} = this;
		if(!_skUV || !_skPos || !_Triangles)
		{
			return null;
		}

		const skVertices = graphics.makeVertices(isConnectedToBones ? this.skinVertices(_skPos, []) : _skPos, _skUV, _Triangles);
		this._SkVertices = skVertices;
		return skVertices;
	}

	draw(graphics)
	{
		if(this._RenderCollapsed || this._IsHidden)
		{
			return;
		}

		const vertices = this.getVertices(graphics);
		if(!vertices)
		{
			return;
		}
	
		const {paint} = this._Atlas;
		graphics.save();
		this.clip(graphics);
		if(!this.isConnectedToBones)
		{
			graphics.transform(this.worldTransform);
		}
		Graphics.setPaintBlendMode(paint, this._BlendMode);
		graphics.setPaintColor(paint, [1.0, 1.0, 1.0, this._RenderOpacity]);
		graphics.drawVertices(vertices, paint);
		graphics.restore();

		// const t = this._WorldTransform;
		// switch(this._BlendMode)
		// {
		// 	case ActorImage.BlendModes.Normal:
		// 		graphics.enableBlending();
		// 		break;
		// 	case ActorImage.BlendModes.Multiply:
		// 		graphics.enableMultiplyBlending();
		// 		break;
		// 	case ActorImage.BlendModes.Screen:
		// 		graphics.enableScreenBlending();
		// 		break;
		// 	case ActorImage.BlendModes.Additive:
		// 		graphics.enableAdditiveBlending();
		// 		break;

		// }

		// const uvBuffer =  this._SequenceUVBuffer || null;
		// let uvOffset;
		// if(this._SequenceUVBuffer)
		// {
		// 	const numFrames = this._SequenceFrames.length;
		// 	let frame = this._SequenceFrame%numFrames;
		// 	if(uvOffset < 0)
		// 	{
		// 		frame += numFrames;
		// 	}
		// 	uvOffset = this._SequenceFrames[frame].offset;
		// }

		// graphics.prep(this._Texture, White, this._RenderOpacity, t, this._VertexBuffer, this._ConnectedBones ? this._BoneMatrices : null, this._DeformVertexBuffer, uvBuffer, uvOffset);
		// graphics.draw(this._IndexBuffer);
	}

	makeInstance(resetActor)
	{
		const node = new ActorImage();
		node._IsInstance = true;
		node.copy(this, resetActor);
		return node;	
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._AtlasIndex = node._AtlasIndex;
		this._NumVertices = node._NumVertices;
		this._VertexStride = node._VertexStride;
		this._Vertices = node._Vertices;
		this._Triangles = node._Triangles;
		// N.B. actor.initialize must've been called before instancing.
		this._VertexBuffer = node._VertexBuffer;
		this._IndexBuffer = node._IndexBuffer;
		this._SequenceUVBuffer = node._SequenceUVBuffer;
		this._SequenceFrames = node._SequenceFrames;
		// if (node._HasVertexDeformAnimation)
		// {
		// 	const deformedVertexLength = this._NumVertices * 2;
		// 	this._AnimationDeformedVertices = new Float32Array(deformedVertexLength);
		// 	for(let i = 0; i < deformedVertexLength; i++)
		// 	{
		// 		this._AnimationDeformedVertices[i] = node._AnimationDeformedVertices[i];
		// 	}
		// }
	}
}