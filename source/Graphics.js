import { mat2d } from "gl-matrix";
import FillRule from "./FillRule.js";
import StrokeCap from "./StrokeCap.js";
import StrokeJoin from "./StrokeJoin.js";
import BlendMode from "./BlendMode.js";
import { PointType } from "./PathPoint.js";
/// #if CanvasKitLocation == "embedded"
import CanvasKitInit from '../canvaskit/canvaskit.js';
import CanvasKitModule from '../canvaskit/canvaskit.wasm';
/// #endif
let CanvasKit = null;
let loadQueue = null;
export default class Graphics
{
	constructor(canvasOrGraphics)
	{
		if(canvasOrGraphics instanceof HTMLCanvasElement)
		{
			this._Canvas = canvasOrGraphics;
			this._Cleanup = [];
		}
		else
		{
			const graphics = canvasOrGraphics;
			this._onSurfaceUpdated = () =>
			{
				this._SkContext = graphics.skCtx;
				this._SkCanvas = graphics.skCanvas;
			};
			graphics.addEventListener("surfaceUpdate", this._onSurfaceUpdated);
			CanvasKit = graphics.canvasKit;
			BlendMode.setCanvasKit(CanvasKit);
			this._SkContext = graphics.skCtx;
			this._SkCanvas = graphics.skCanvas;
			this._ProxyGraphics = canvasOrGraphics;
			this._ViewTransform = mat2d.create();
			this._Cleanup = graphics._Cleanup;
		}
		this._ViewTransform = mat2d.create();
	}

	initialize(cb, staticPath)
	{
		if (CanvasKit === null)
		{
			if(loadQueue)
			{
				loadQueue.push({graphics:this, cb});
				return;
			}
			loadQueue = [{graphics:this, cb}];
			CanvasKitInit(
				{
				/// #if CanvasKitLocation == "embedded"
					wasmBinary: CanvasKitModule,
				/// #else
					locateFile: (file) => staticPath + file,
				/// #endif 
				}).ready().then((CK) => 
				{
					// when debugging, it can be handy to not run directly in the then, because if there
					// is a failure (for example, miscalling an API), the WASM loader tries to re-load
					// the web assembly in the (much slower) ArrayBuffer version. This will also fail
					// and thus there is a lot of extra log spew.
					// Thus, the setTimeout to run on the next microtask avoids this second loading
					// and the log spew.
					setTimeout(() => 
					{
						CanvasKit = CK;
						for(const q of loadQueue)
						{
							q.graphics.init();
							q.cb();
						}
					}, 0);
				});
		}
		else
		{
			this.init();
			cb();
		}
	}

	init()
	{
		this._GLContext = CanvasKit.GetWebGLContext(this._Canvas);
		this._SkContext = CanvasKit.MakeGrContext(this._GLContext);
		this.updateBackendSurface();

		const clearPaint = new CanvasKit.SkPaint();
		clearPaint.setStyle(CanvasKit.PaintStyle.Fill);
		clearPaint.setBlendMode(CanvasKit.BlendMode.Clear);
		BlendMode.setCanvasKit(CanvasKit);
		this._ClearPaint = clearPaint;
	}

	updateBackendSurface()
	{
		if (!CanvasKit)
		{
			return;
		}
		if (this._SkSurface)
		{
			this._SkSurface.delete();
		}
		CanvasKit.setCurrentContext(this._GLContext);

		this._SkSurface = CanvasKit.MakeOnScreenGLSurface(this._SkContext, this.width, this.height);
		this._SkCanvas = this._SkSurface.getCanvas();
	}

	save()
	{
		this._SkCanvas.save();
	}

	restore()
	{
		this._SkCanvas.restore();
	}

	transform(matrix)
	{
		this._SkCanvas.concat(
			[matrix[0], matrix[2], matrix[4],
			matrix[1], matrix[3], matrix[5],
				0, 0, 1]);
	}

	get canvas()
	{
		return this._Canvas;
	}

	get ctx()
	{
		return this._GLContext;
	}

	dispose()
	{
		if(this._proxy)
		{
			this._proxy.removeEventListener("surfaceUpdate", this._onSurfaceUpdated);
		}
	}

	get width()
	{
		return this._Canvas.width;
	}

	get height()
	{
		return this._Canvas.height;
	}

	clear(color)
	{
		const { _GLContext: ctx, _ClearPaint: clearPaint, _SkCanvas: skCanvas, width, height } = this;
		CanvasKit.setCurrentContext(ctx);
		if (color)
		{
			clearPaint.setColor(CanvasKit.Color(Math.round(color[0] * 255), Math.round(color[1] * 255), Math.round(color[2] * 255), color[3]));
			clearPaint.setBlendMode(CanvasKit.BlendMode.Src);
		}
		else
		{
			clearPaint.setBlendMode(CanvasKit.BlendMode.Clear);
		}

		skCanvas.drawRect(CanvasKit.LTRBRect(0, 0, width, height), clearPaint);
		skCanvas.save();
	}

	drawPath(path, paint)
	{
		this._SkCanvas.drawPath(path, paint);
	}

	drawRect(x, y, width, height, paint)
	{
		this._SkCanvas.drawRect(CanvasKit.LTRBRect(x, y, width, height), paint);
	}

	setView(matrix)
	{
		this._SkCanvas.concat(
			[matrix[0], matrix[2], matrix[4],
			matrix[1], matrix[3], matrix[5],
				0, 0, 1]);
	}

	addPath(path, addition, matrix)
	{
		path.addPath(addition, [matrix[0], matrix[2], matrix[4],
		matrix[1], matrix[3], matrix[5],
			0, 0, 1]);
	}

	makeImage(bytes)
	{
		return CanvasKit.MakeImageFromEncoded(bytes);
	}

	makeImageShader(image)
	{
		return image.makeShader(CanvasKit.TileMode.Clamp, CanvasKit.TileMode.Clamp);
	}

	makePath(ephemeral)
	{
		const path = new CanvasKit.SkPath();

		if (ephemeral)
		{
			this._Cleanup.push(path);
		}
		return path;
	}

	makeVertices(pts, uvs, indices)
	{
		return CanvasKit.MakeSkVertices(CanvasKit.VertexMode.Triangles, pts, uvs, null, null, null, indices);
	}

	drawVertices(vertices, paint)
	{
		this._SkCanvas.drawVertices(vertices, CanvasKit.BlendMode.SrcOver, paint);
	}

	copyPath(path, ephemeral)
	{
		const copy = path.copy();
		if (ephemeral)
		{
			this._Cleanup.push(copy);
		}
		return copy;
	}

	pathEllipse(path, x, y, radiusX, radiusY, startAngle, endAngle, ccw)
	{
		var bounds = CanvasKit.LTRBRect(x - radiusX, y - radiusY, x + radiusX, y + radiusY);
		var sweep = radiansToDegrees(endAngle - startAngle) - (360 * !!ccw);
		// Skia takes degrees. JS tends to be radians.
		path.addArc(bounds, radiansToDegrees(startAngle), sweep);
	}

	static destroyPath(path)
	{
		path.delete();
	}

	makeLinearGradient(start, end, colors, stops)
	{
		colors = colors.map(color => CanvasKit.Color(Math.round(color[0] * 255), Math.round(color[1] * 255), Math.round(color[2] * 255), color[3]));
		//start, end, colors, pos, mode, localMatrix, flags
		return CanvasKit.MakeLinearGradientShader(start, end, colors, stops, CanvasKit.TileMode.Clamp, null, 0);
	}

	makeRadialGradient(center, radius, colors, stops)
	{
		colors = colors.map(color => CanvasKit.Color(Math.round(color[0] * 255), Math.round(color[1] * 255), Math.round(color[2] * 255), color[3]));
		// center, radius, colors, pos, mode, localMatrix, flags
		return CanvasKit.MakeRadialGradientShader(center, radius, colors, stops, CanvasKit.TileMode.Clamp, null, 0);
	}

	destroyRadialGradient(gradient)
	{
		gradient.delete();
	}

	destroyLinearGradient(gradient)
	{
		gradient.delete();
	}

	makePaint(ephemeral)
	{
		const paint = new CanvasKit.SkPaint();
		paint.setAntiAlias(true);
		paint.setBlendMode(CanvasKit.BlendMode.SrcOver);
		if (ephemeral)
		{
			this._Cleanup.push(paint);
		}
		return paint;
	}

	setPaintFill(paint)
	{
		paint.setStyle(CanvasKit.PaintStyle.Fill);
	}

	setPaintColor(paint, color)
	{
		paint.setColor(CanvasKit.Color(Math.round(color[0] * 255), Math.round(color[1] * 255), Math.round(color[2] * 255), color[3]));
	}

	setPaintShader(paint, shader)
	{
		paint.setShader(shader);
		paint.setFilterQuality(CanvasKit.FilterQuality.Low);
	}

	static setPaintBlendMode(paint, blendMode)
	{
		paint.setBlendMode(blendMode.sk);
	}

	setPathFillType(path, fillRule)
	{
		let fillType;
		switch (fillRule)
		{
			case FillRule.EvenOdd:
				fillType = CanvasKit.FillType.EvenOdd;
				break;
			case FillRule.NonZero:
				fillType = CanvasKit.FillType.Winding;
				break;
		}
		path.setFillType(fillType);
	}

	static setPaintStrokeCap(paint, cap)
	{
		let strokeCap;
		switch (cap)
		{
			case StrokeCap.Butt:
				strokeCap = CanvasKit.StrokeCap.Butt;
				break;
			case StrokeCap.Round:
				strokeCap = CanvasKit.StrokeCap.Round;
				break;
			case StrokeCap.Square:
				strokeCap = CanvasKit.StrokeCap.Square;
				break;
			default:
				strokeCap = CanvasKit.StrokeCap.Butt;
				break;
		}
		paint.setStrokeCap(strokeCap);
	}

	static setPaintStrokeJoin(paint, join)
	{
		let strokeJoin;
		switch (join)
		{
			case StrokeJoin.Miter:
				strokeJoin = CanvasKit.StrokeJoin.Miter;
				break;
			case StrokeJoin.Round:
				strokeJoin = CanvasKit.StrokeJoin.Round;
				break;
			case StrokeJoin.Bevel:
				strokeJoin = CanvasKit.StrokeJoin.Bevel;
				break;
			default:
				strokeJoin = CanvasKit.StrokeJoin.Miter;
				break;
		}
		paint.setStrokeJoin(strokeJoin);
	}

	static setPaintStroke(paint)
	{
		paint.setStyle(CanvasKit.PaintStyle.Stroke);
	}

	destroyPaint(paint)
	{
		paint.delete();
	}

	clipPath(path)
	{
		this._SkCanvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);
	}

	flush()
	{
		this._SkCanvas.restore();
		this._SkSurface.flush();

		for (const obj of this._Cleanup)
		{
			obj.delete();
		}
		this._Cleanup.length = 0;
	}

	get viewportWidth()
	{
		return this._Canvas.width;
	}

	get viewportHeight()
	{
		return this._Canvas.height;
	}

	setSize(width, height)
	{
		if (this.width !== width || this.height !== height)
		{
			this._Canvas.width = width;
			this._Canvas.height = height;
			this.updateBackendSurface();
			return true;
		}
		return false;
	}

	static pointPath(path, points, isClosed)
	{
		if (points.length)
		{
			let firstPoint = points[0];
			path.moveTo(firstPoint.translation[0], firstPoint.translation[1]);
			for (let i = 0, l = isClosed ? points.length : points.length - 1, pl = points.length; i < l; i++)
			{
				let point = points[i];
				let nextPoint = points[(i + 1) % pl];
				let cin = nextPoint.pointType === PointType.Straight ? null : nextPoint.in, cout = point.pointType === PointType.Straight ? null : point.out;
				if (cin === null && cout === null)
				{
					path.lineTo(nextPoint.translation[0], nextPoint.translation[1]);
				}
				else
				{
					if (cout === null)
					{
						cout = point.translation;
					}
					if (cin === null)
					{
						cin = nextPoint.translation;
					}
					path.cubicTo(
						cout[0], cout[1],

						cin[0], cin[1],

						nextPoint.translation[0], nextPoint.translation[1]);
				}
			}
			if (isClosed)
			{
				path.close();
			}
		}

		return path;
	}

	static trimPath(path, startT, stopT, complement)
	{
		const result = new CanvasKit.SkPath();
		// Measure length of all the contours.
		let totalLength = 0.0;
		{
			const measure = new CanvasKit.SkPathMeasure(path, false, 1.0);
			do
			{
				totalLength += measure.getLength();
			} while (measure.nextContour());
			measure.delete();
		}
		// Reset measure from the start.
		const measure = new CanvasKit.SkPathMeasure(path, false, 1.0);
		let trimStart = totalLength * startT;
		let trimStop = totalLength * stopT;
		let offset = 0.0;

		if (complement) 
		{
			if (trimStart > 0.0) 
			{
				offset = appendPathSegment(measure, result, offset, 0.0, trimStart);
			}
			if (trimStop < totalLength) 
			{
				offset = appendPathSegment(measure, result, offset, trimStop, totalLength);
			}
		}
		else 
		{
			if (trimStart < trimStop) 
			{
				offset = appendPathSegment(measure, result, offset, trimStart, trimStop);
			}
		}
		measure.delete();

		return result;
	}

	static trimPathSync(path, startT, stopT, complement)
	{
		const result = new CanvasKit.SkPath();

		// Reset measure from the start.
		const measure = new CanvasKit.SkPathMeasure(path, false, 1.0);
		do
		{
			const length = measure.getLength();
			let trimStart = length * startT;
			let trimStop = length * stopT;
			let offset = 0.0;

			if (complement) 
			{
				if (trimStart > 0.0) 
				{
					appendPathSegmentSync(measure, result, offset, 0.0, trimStart);
				}
				if (trimStop < length) 
				{
					appendPathSegmentSync(measure, result, offset, trimStop, length);
				}
			}
			else 
			{
				if (trimStart < trimStop) 
				{
					appendPathSegmentSync(measure, result, offset, trimStart, trimStop);
				}
			}
		} while (measure.nextContour());
		measure.delete();

		return result;
	}
}

function radiansToDegrees(rad) 
{
	return (rad / Math.PI) * 180;
}

const Identity = [
	1, 0, 0,
	0, 1, 0
];

function appendPathSegment(measure, to, offset, start, stop) 
{
	let nextOffset = offset;
	do
	{
		nextOffset = offset + measure.getLength();
		if (start < nextOffset)
		{
			let extracted = new CanvasKit.SkPath();
			if (measure.getSegment(start - offset, stop - offset, extracted, true))
			{
				to.addPath(extracted, Identity);
				extracted.delete();
			}
			if (stop < nextOffset)
			{
				break;
			}
		}
		offset = nextOffset;
	} while (measure.nextContour());
	return offset;
}

function appendPathSegmentSync(measure, to, offset, start, stop) 
{
	let nextOffset = offset + measure.getLength();
	if (start < nextOffset)
	{
		let extracted = new CanvasKit.SkPath();
		if (measure.getSegment(start - offset, stop - offset, extracted, true))
		{
			to.addPath(extracted, Identity);
			extracted.delete();
		}
	}
}