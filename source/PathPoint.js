import {vec2} from "gl-matrix";

const TempMatrix = new Float32Array(6);

export class PointType
{
	static get Straight()
	{
		return 0;
	}

	static get Mirror()
	{
		return 1;
	}

	static get Disconnected()
	{
		return 2;
	}

	static get Asymmetric()
	{
		return 3;
	}
}

export class PathPoint
{
	constructor()
	{
		this._PointType = PointType.Straight;
		this._Translation = vec2.create();
		this._Weights = null;
	}

	get pointType()
	{
		return this._PointType;
	}

	get translation()
	{
		return this._Translation;
	}

	makeInstance()
	{
		return null;
	}

	copy(from)
	{
		this._PointType = from._PointType;
		this._Weights = from._Weights;
		vec2.copy(this._Translation, from._Translation);
	}
}

export class StraightPathPoint extends PathPoint
{
	constructor()
	{
		super();
		this._Radius = 0;
	}

	get radius()
	{
		return this._Radius;
	}
	
	makeInstance()
	{
		const node = new StraightPathPoint();
		StraightPathPoint.prototype.copy.call(node, this);
		return node;	
	}

	copy(from)
	{
		super.copy(from);
		this._Radius = from._Radius;
	}

	skin(world, bones)
	{
		let {_Weights:weights, translation, pointType, radius} = this;

		let px = world[0] * translation[0] + world[2] * translation[1] + world[4];
		let py = world[1] * translation[0] + world[3] * translation[1] + world[5];
		const point = { pointType, o:this, radius };
		
		const fm = TempMatrix;
		fm.fill(0);

		for(let i = 0; i < 4; i++)
		{
			const boneIndex = weights[i];
			const weight = weights[i+4];
			if(weight > 0)
			{
				let bb = boneIndex*6;
				for(let j = 0; j < 6; j++)
				{
					fm[j] += bones[bb+j] * weight;
				}
			}
		}

		point.translation = new Float32Array([
			fm[0] * px + fm[2] * py + fm[4],
			fm[1] * px + fm[3] * py + fm[5]
		]);
		
		return point;
	}
}

export class CubicPathPoint extends PathPoint
{
	constructor()
	{
		super();
		this._In = vec2.create();
		this._Out = vec2.create();
	}
	
	get in()
	{
		return this._In;
	}
	
	get out()
	{
		return this._Out;
	}
	
	makeInstance()
	{
		const node = new CubicPathPoint();
		CubicPathPoint.prototype.copy.call(node, this);
		return node;	
	}

	copy(from)
	{
		super.copy(from);
		vec2.copy(this._In, from._In);
		vec2.copy(this._Out, from._Out);
	}

	skin(world, bones)
	{
		let {_Weights:weights, translation, pointType, out:op, in:ip} = this;

		let px = world[0] * translation[0] + world[2] * translation[1] + world[4];
		let py = world[1] * translation[0] + world[3] * translation[1] + world[5];
		const point = { pointType, o:this };
		
		const fm = TempMatrix;
		fm.fill(0);

		for(let i = 0; i < 4; i++)
		{
			const boneIndex = weights[i];
			const weight = weights[i+4];
			if(weight > 0)
			{
				let bb = boneIndex*6;
				for(let j = 0; j < 6; j++)
				{
					fm[j] += bones[bb+j] * weight;
				}
			}
		}

		point.translation = new Float32Array([
			fm[0] * px + fm[2] * py + fm[4],
			fm[1] * px + fm[3] * py + fm[5]
		]);

	
		px = world[0] * ip[0] + world[2] * ip[1] + world[4];
		py = world[1] * ip[0] + world[3] * ip[1] + world[5];
		fm.fill(0);
		for(let i = 8; i < 12; i++)
		{
			const boneIndex = weights[i];
			const weight = weights[i+4];
			if(weight > 0)
			{
				let bb = boneIndex*6;
				for(let j = 0; j < 6; j++)
				{
					fm[j] += bones[bb+j] * weight;
				}
			}
		}

		point.in = new Float32Array([
			fm[0] * px + fm[2] * py + fm[4],
			fm[1] * px + fm[3] * py + fm[5]
		]);

		px = world[0] * op[0] + world[2] * op[1] + world[4];
		py = world[1] * op[0] + world[3] * op[1] + world[5];
		fm.fill(0);
		for(let i = 16; i < 20; i++)
		{
			const boneIndex = weights[i];
			const weight = weights[i+4];
			if(weight > 0)
			{
				let bb = boneIndex*6;
				for(let j = 0; j < 6; j++)
				{
					fm[j] += bones[bb+j] * weight;
				}
			}
		}

		point.out = new Float32Array([
			fm[0] * px + fm[2] * py + fm[4],
			fm[1] * px + fm[3] * py + fm[5]
		]);

		return point;
	}
}