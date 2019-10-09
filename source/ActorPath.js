import ActorSkinnable from "./ActorSkinnable.js";
import { ActorBasePath, makeRenderPoints } from "./ActorBasePath.js";
import ActorNode from "./ActorNode.js";
import { vec2, mat2d } from "gl-matrix";
import { PointType } from "./PathPoint.js";
import Graphics from "./Graphics.js";

const CircleConstant = 0.552284749831;
const InverseCircleConstant = 1.0 - CircleConstant;
const Identity = mat2d.create();

export default class ActorPath extends ActorSkinnable(ActorBasePath(ActorNode))
{
	constructor()
	{
		super();
		this._IsClosed = false;
		this._IsHidden = false;
		this._Points = [];
		this._RenderPath = null;
		this._IsRenderPathDirty = true;
	}

	get isHidden()
	{
		return this._IsHidden;
	}

	set isHidden(hidden)
	{
		this._IsHidden = hidden;
	}

	get isClosed()
	{
		return this._IsClosed;
	}

	set isClosed(closed)
	{
		this._IsClosed = closed;
	}

	initialize(actor, graphics)
	{
		this._RenderPath = graphics.makePath();
	}

	get numPoints()
	{
		return this._Points.length;
	}

	makeInstance(resetActor)
	{
		const node = new ActorPath();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor)
	{
		super.copy(node, resetActor);

		this._IsClosed = node._IsClosed;
		this._IsHidden = node._IsHidden;

		const pointCount = node._Points.length;
		this._Points = new Array(pointCount);
		for (let i = 0; i < pointCount; i++)
		{
			let p = node._Points[i];
			this._Points[i] = p.makeInstance();
		}
	}

	get deformedPoints()
	{
		let boneTransforms = null;
		if (this._Skin)
		{
			boneTransforms = this._Skin.boneMatrices;
		}
		const { _Points: points, worldTransform } = this;
		if (!boneTransforms)
		{
			return points;
		}

		const deformedPoints = [];
		for (const point of points)
		{
			deformedPoints.push(point.skin(worldTransform, boneTransforms));
		}
		return deformedPoints;
	}

	getPathRenderTransform()
	{
		if (!this.isConnectedToBones)
		{
			return this.worldTransform;
		}
		else
		{
			return Identity;
		}
	}

	getPathTransform()
	{
		if (!this.isConnectedToBones)
		{
			return this.worldTransform;
		}
		else
		{
			return Identity;
		}
	}

	invalidateDrawable()
	{
		this._IsRenderPathDirty = true;
		this._RenderPath.setIsVolatile(true);
		this.shape.invalidatePath();
	}

	getPath(graphics)
	{
		const { _RenderPath, _IsRenderPathDirty } = this;
		if (!_IsRenderPathDirty)
		{
			return _RenderPath;
		}

		_RenderPath.rewind();

		const { deformedPoints, isClosed } = this;
		const renderPoints = makeRenderPoints(deformedPoints, isClosed);
		return Graphics.pointPath(_RenderPath, renderPoints, isClosed);
	}
}