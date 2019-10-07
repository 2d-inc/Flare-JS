import ActorShape from "./ActorShape.js";
import { mat2d } from "gl-matrix";

const ActorBasePath = (ActorBasePath) => class extends ActorBasePath
{
	constructor(actor)
	{
		super(actor);
		this._Shape = null;
		this._IsRootPath = false;
	}

	get isRootPath() { return this._IsRootPath; }
	get shape() { return this._Shape; }

	updateShape()
	{
		const { _Shape } = this;
		if (_Shape)
		{
			_Shape.removePath(this);
		}
		let shape = this.parent;
		while (shape && shape.constructor !== ActorShape)
		{
			shape = shape.parent;
        }
		this._Shape = shape;
		this._IsRootPath = shape === this.parent;
		if (shape)
		{
			shape.addPath(this);
		}
	}

	completeResolve()
	{
		super.completeResolve();
		this.updateShape();
	}

	onTransform()
	{
		if (this.isRootPath)
		{
			const { shape } = this;
			if (shape && shape.stageItem)
			{
				shape.stageItem.onPathTransformed();
			}
		}
	}

	onWorldTransform()
	{
		this._InverseWorld = mat2d.invert(mat2d.create(), this._WorldTransform);

		if (!this.isRootPath)
		{
			const { shape } = this;
			if (shape && shape.stageItem)
			{
				shape.stageItem.onPathTransformed();
			}
		}
	}
}
export default ActorBasePath;