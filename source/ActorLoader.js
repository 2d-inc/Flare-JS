import Animation from "./Animation.js";
import Atlas from "./Atlas.js";
import BinaryReader from "./Readers/BinaryReader.js";
import JSONReader from "./Readers/JSONReader.js";
import Actor from "./Actor.js";
import ActorEvent from "./ActorEvent.js";
import ActorNode from "./ActorNode.js";
import ActorTargetNode from "./ActorTargetNode.js";
import ActorLayerNode from "./ActorLayerNode.js";
import ActorNodeSolo from "./ActorNodeSolo.js";
import ActorBone from "./ActorBone.js";
import ActorEllipse from "./ActorEllipse.js";
import ActorPolygon from "./ActorPolygon.js";
import ActorRectangle from "./ActorRectangle.js";
import ActorStar from "./ActorStar.js";
import ActorTriangle from "./ActorTriangle.js";
import ActorJellyBone from "./ActorJellyBone.js";
import JellyComponent from "./JellyComponent.js";
import ActorRootBone from "./ActorRootBone.js";
import ActorImage from "./ActorImage.js";
import ActorIKTarget from "./ActorIKTarget.js";
import ActorColliderRectangle from "./ActorColliderRectangle.js";
import ActorColliderTriangle from "./ActorColliderTriangle.js";
import ActorColliderCircle from "./ActorColliderCircle.js";
import ActorColliderPolygon from "./ActorColliderPolygon.js";
import ActorColliderLine from "./ActorColliderLine.js";
import NestedActorNode from "./NestedActorNode.js";
import CustomProperty from "./CustomProperty.js";
import AnimatedComponent from "./AnimatedComponent.js";
import AnimatedProperty from "./AnimatedProperty.js";
import NestedActorAsset from "./NestedActorAsset.js";
import ActorIKConstraint from "./ActorIKConstraint.js";
import ActorDistanceConstraint from "./ActorDistanceConstraint.js";
import ActorTransformConstraint from "./ActorTransformConstraint.js";
import ActorTranslationConstraint from "./ActorTranslationConstraint.js";
import ActorScaleConstraint from "./ActorScaleConstraint.js";
import ActorRotationConstraint from "./ActorRotationConstraint.js";
import ActorShape from "./ActorShape.js";
import ActorPath from "./ActorPath.js";
import ActorSkin from "./ActorSkin.js";
import ActorArtboard from "./ActorArtboard.js";
import { ColorFill, ColorStroke, GradientFill, GradientStroke, RadialGradientFill, RadialGradientStroke } from "./ColorComponent.js";
import { StraightPathPoint, CubicPathPoint, PointType } from "./PathPoint.js";
import { KeyFrame, PathsKeyFrame } from "./KeyFrame.js";
import { mat2d, vec2 } from "gl-matrix";
import { Hold, Linear, Cubic } from "./Interpolation.js";
import TrimPath from "./TrimPath.js";
import Block from "./Block.js";
import BlendMode from "./BlendMode.js";

const _BlockTypes = Block.Types;
const { Off: TrimPathOff } = TrimPath;

const _AnimatedPropertyTypes = AnimatedProperty.Types;

const _Readers = {
	"bin":
	{
		stream: BinaryReader,
		container: Uint8Array,
		extension: ".nma"
	},
	"json":
	{
		stream: JSONReader,
		container: Object,
		extension: "nmj"
	}
};

function _ReadNextBlock(reader, error, block)
{
	if (reader.isEOF())
	{
		return null;
	}
	let blockType = 0,
		container = 0;
	const cType = reader.containerType; // 'bin' || 'json'
	const streamReader = _Readers[cType];
	try
	{
		// blockType = reader.readUint8();
		blockType = reader.readBlockType(block);
		if (blockType === undefined)
		{
			return null;
		}
		const length = reader.readUint32Length();

		container = new streamReader["container"](length);
		reader.readRaw(container, length);
	}
	catch (err)
	{
		console.log(err.constructor);
		if (error)
		{
			error(err);
		}
		return null;
	}
	return { type: blockType, reader: new streamReader.stream(container) };
}

function _ReadComponentsBlock(artboard, reader)
{
	let componentCount = reader.readUint16Length();
	let actorComponents = artboard._Components;

	const version = artboard.actor.dataVersion;

	// Guaranteed from the exporter to be in index order.
	let block = null;
	while ((block = _ReadNextBlock(reader, function(err) { artboard.actor.error = err; }, Block)) !== null)
	{
		let component = null;
		switch (block.type)
		{
			case _BlockTypes.CustomIntProperty:
			case _BlockTypes.CustomStringProperty:
			case _BlockTypes.CustomFloatProperty:
			case _BlockTypes.CustomBooleanProperty:
				component = _ReadCustomProperty(block.reader, new CustomProperty(), block.type);
				break;
			case _BlockTypes.ColliderRectangle:
				component = _ReadRectangleCollider(version, block.reader, new ActorColliderRectangle());
				break;
			case _BlockTypes.ColliderTriangle:
				component = _ReadTriangleCollider(version, block.reader, new ActorColliderTriangle());
				break;
			case _BlockTypes.ColliderCircle:
				component = _ReadCircleCollider(version, block.reader, new ActorColliderCircle());
				break;
			case _BlockTypes.ColliderPolygon:
				component = _ReadPolygonCollider(version, block.reader, new ActorColliderPolygon());
				break;
			case _BlockTypes.ColliderLine:
				component = _ReadLineCollider(version, block.reader, new ActorColliderLine());
				break;
			case _BlockTypes.ActorEvent:
				component = _ReadActorEvent(block.reader, new ActorEvent());
				break;
			case _BlockTypes.ActorNode:
			case _BlockTypes.ActorCacheNode:
				component = _ReadActorNode(version, block.reader, new ActorNode());
				break;
			case _BlockTypes.ActorTargetNode:
				component = _ReadActorNode(version, block.reader, new ActorTargetNode());
				break;
			case _BlockTypes.ActorLayerNode:
				component = _ReadDrawable(version, block.reader, new ActorLayerNode());
				break;
			case _BlockTypes.ActorBone:
				component = _ReadActorBone(version, block.reader, new ActorBone());
				break;
			case _BlockTypes.ActorJellyBone:
				component = _ReadActorJellyBone(block.reader, new ActorJellyBone());
				break;
			case _BlockTypes.JellyComponent:
				component = _ReadJellyComponent(block.reader, new JellyComponent());
				break;
			case _BlockTypes.ActorRootBone:
				component = _ReadActorRootBone(version, block.reader, new ActorRootBone());
				break;
			case _BlockTypes.ActorImage:
				component = _ReadActorImage(version, block.reader, new ActorImage());
				break;
			case _BlockTypes.ActorImageSequence:
				component = _ReadActorImageSequence(version, block.reader, new ActorImage());
				break;
			case _BlockTypes.ActorIKTarget:
				component = _ReadActorIKTarget(version, block.reader, new ActorIKTarget());
				break;
			case _BlockTypes.NestedActorNode:
				component = _ReadNestedActor(version, block.reader, new NestedActorNode(), artboard._NestedActorAssets);
				break;
			case _BlockTypes.ActorNodeSolo:
				component = _ReadActorNodeSolo(version, block.reader, new ActorNodeSolo());
				break;
			case _BlockTypes.ActorIKConstraint:
				component = _ReadActorIKConstraint(block.reader, new ActorIKConstraint());
				break;
			case _BlockTypes.ActorDistanceConstraint:
				component = _ReadActorDistanceConstraint(block.reader, new ActorDistanceConstraint());
				break;
			case _BlockTypes.ActorTransformConstraint:
				component = _ReadActorTransformConstraint(block.reader, new ActorTransformConstraint());
				break;
			case _BlockTypes.ActorTranslationConstraint:
				component = _ReadAxisConstraint(block.reader, new ActorTranslationConstraint());
				break;
			case _BlockTypes.ActorScaleConstraint:
				component = _ReadAxisConstraint(block.reader, new ActorScaleConstraint());
				break;
			case _BlockTypes.ActorRotationConstraint:
				component = _ReadRotationConstraint(block.reader, new ActorRotationConstraint());
				break;
			case _BlockTypes.ActorShape:
				component = _ReadActorShape(version, block.reader, new ActorShape());
				break;
			case _BlockTypes.ActorPath:
				component = _ReadActorPath(version, block.reader, new ActorPath());
				break;
			case _BlockTypes.ColorFill:
				component = _ReadColorFill(block.reader, new ColorFill());
				break;
			case _BlockTypes.ColorStroke:
				component = _ReadColorStroke(block.reader, new ColorStroke());
				break;
			case _BlockTypes.GradientFill:
				component = _ReadGradientFill(block.reader, new GradientFill());
				break;
			case _BlockTypes.GradientStroke:
				component = _ReadGradientStroke(block.reader, new GradientStroke());
				break;
			case _BlockTypes.RadialGradientFill:
				component = _ReadRadialGradientFill(block.reader, new RadialGradientFill());
				break;
			case _BlockTypes.RadialGradientStroke:
				component = _ReadRadialGradientStroke(block.reader, new RadialGradientStroke());
				break;
			case _BlockTypes.ActorEllipse:
				component = _ReadActorEllipse(version, block.reader, new ActorEllipse());
				break;
			case _BlockTypes.ActorRectangle:
				component = _ReadActorRectangle(version, block.reader, new ActorRectangle());
				break;
			case _BlockTypes.ActorTriangle:
				component = _ReadActorTriangle(version, block.reader, new ActorTriangle());
				break;
			case _BlockTypes.ActorStar:
				component = _ReadActorStar(version, block.reader, new ActorStar());
				break;
			case _BlockTypes.ActorPolygon:
				component = _ReadActorPolygon(version, block.reader, new ActorPolygon());
				break;
			case _BlockTypes.ActorSkin:
				component = _ReadActorComponent(block.reader, new ActorSkin());
				break;
		}
		if (component)
		{
			component._Idx = actorComponents.length;
		}
		actorComponents.push(component);
	}
	artboard.resolveHierarchy();
}

function _ReadAnimationBlock(artboard, reader)
{
	const animation = new Animation(artboard);
	artboard._Animations.push(animation);

	animation._Name = reader.readString("name");
	animation._FPS = reader.readUint8("fps");
	animation._Duration = reader.readFloat32("duration");
	animation._Loop = reader.readBool("isLooping");

	reader.openArray("keyed");
	// Read the number of keyed nodes.
	const numKeyedComponents = reader.readUint16Length();
	if (numKeyedComponents > 0)
	{
		for (let i = 0; i < numKeyedComponents; i++)
		{
			reader.openObject("component");
			const componentIndex = reader.readId("component");
			let component = artboard._Components[componentIndex];
			if (!component)
			{
				// Bad component was loaded, read past the animation data.
				// Note this only works after version 12 as we can read by the entire set of properties.
				// TODO: test this case with JSON.
				const props = reader.readUint16();
				for (let j = 0; j < props; j++)
				{
					let propertyBlock = _ReadNextBlock(reader, function(err) { artboard.actor.error = err; });
				}
			}
			else
			{
				const animatedComponent = new AnimatedComponent(componentIndex);
				if (component.constructor === ActorEvent)
				{
					// N.B. ActorEvents currently only keyframe their trigger so we cn optimize them into a separate array.
					animation._TriggerComponents.push(animatedComponent);
				}
				else
				{
					animation._Components.push(animatedComponent);
				}

				const props = reader.readUint16Length();
				for (let j = 0; j < props; j++)
				{
					let propertyBlock = _ReadNextBlock(reader, function(err) { artboard.actor.error = err; }, AnimatedProperty);
					const propertyReader = propertyBlock.reader;
					const propertyType = propertyBlock.type;

					let validProperty = false;
					switch (propertyType)
					{
						case _AnimatedPropertyTypes.PosX:
						case _AnimatedPropertyTypes.PosY:
						case _AnimatedPropertyTypes.ScaleX:
						case _AnimatedPropertyTypes.ScaleY:
						case _AnimatedPropertyTypes.Rotation:
						case _AnimatedPropertyTypes.Opacity:
						case _AnimatedPropertyTypes.DrawOrder:
						case _AnimatedPropertyTypes.Length:
						case _AnimatedPropertyTypes.ImageVertices:
						case _AnimatedPropertyTypes.ConstraintStrength:
						case _AnimatedPropertyTypes.Trigger:
						case _AnimatedPropertyTypes.IntProperty:
						case _AnimatedPropertyTypes.FloatProperty:
						case _AnimatedPropertyTypes.StringProperty:
						case _AnimatedPropertyTypes.BooleanProperty:
						case _AnimatedPropertyTypes.IsCollisionEnabled:
						case _AnimatedPropertyTypes.ActiveChildIndex:
						case _AnimatedPropertyTypes.Sequence:
						case _AnimatedPropertyTypes.PathVertices:
						case _AnimatedPropertyTypes.FillColor:
						case _AnimatedPropertyTypes.StrokeColor:
						case _AnimatedPropertyTypes.StrokeWidth:
						case _AnimatedPropertyTypes.StrokeStart:
						case _AnimatedPropertyTypes.StrokeEnd:
						case _AnimatedPropertyTypes.StrokeOffset:
						case _AnimatedPropertyTypes.FillGradient:
						case _AnimatedPropertyTypes.StrokeGradient:
						case _AnimatedPropertyTypes.FillRadial:
						case _AnimatedPropertyTypes.StrokeRadial:
						case _AnimatedPropertyTypes.StrokeOpacity:
						case _AnimatedPropertyTypes.FillOpacity:
						case _AnimatedPropertyTypes.ShapeWidth:
						case _AnimatedPropertyTypes.ShapeHeight:
						case _AnimatedPropertyTypes.CornerRadius:
						case _AnimatedPropertyTypes.InnerRadius:
							validProperty = true;
							break;
						default:
							break;
					}
					if (!validProperty)
					{
						continue;
					}
					const animatedProperty = new AnimatedProperty(propertyType);
					animatedComponent._Properties.push(animatedProperty);

					propertyReader.openArray("frames");
					const keyFrameCount = propertyReader.readUint16Length();
					let lastKeyFrame = null;
					for (let k = 0; k < keyFrameCount; k++)
					{
						let keyFrame = new KeyFrame(animatedProperty);

						propertyReader.openObject("frame");

						keyFrame._Time = propertyReader.readFloat64("time");

						switch (propertyType)
						{
							case _AnimatedPropertyTypes.IsCollisionEnabled:
							case _AnimatedPropertyTypes.BooleanProperty:
							case _AnimatedPropertyTypes.StringProperty:
							case _AnimatedPropertyTypes.Trigger:
							case _AnimatedPropertyTypes.DrawOrder:
							case _AnimatedPropertyTypes.ActiveChildIndex:
								// These do not interpolate.
								keyFrame._Interpolator = Hold.instance;
								break;
							default:
							{
								const type = propertyReader.readUint8("interpolatorType");
								switch (type)
								{
									case 0:
										keyFrame._Interpolator = Hold.instance;
										break;
									case 1:
										keyFrame._Interpolator = Linear.instance;
										break;
									case 2:
										keyFrame._Interpolator = new Cubic(
											propertyReader.readFloat32("cubicX1"),
											propertyReader.readFloat32("cubicY1"),
											propertyReader.readFloat32("cubicX2"),
											propertyReader.readFloat32("cubicY2")
										);
										break;
								}
								break;
							}
						}
						if (propertyType === _AnimatedPropertyTypes.PathVertices)
						{
							const path = artboard._Components[animatedComponent._ComponentIndex];
							if (!(path instanceof ActorPath)) { continue; }
							const pointCount = path._Points.length;
							const points = [];

							propertyReader.openArray("value");
							for (let j = 0; j < pointCount; j++)
							{
								const point = path._Points[j];

								const posX = propertyReader.readFloat32("translationX");
								const posY = propertyReader.readFloat32("translationX");
								points.push(posX, posY);

								if (point.constructor === StraightPathPoint)
								{
									points.push(propertyReader.readFloat32("radius"));
								}
								else
								{
									const inX = propertyReader.readFloat32("inValueX");
									const inY = propertyReader.readFloat32("inValueY");
									points.push(inX, inY);

									const outX = propertyReader.readFloat32("outValueX");
									const outY = propertyReader.readFloat32("outValueY");
									points.push(outX, outY);
								}
							}
							propertyReader.closeArray();
							keyFrame._Value = new Float32Array(points);
						}
						else if (propertyType === _AnimatedPropertyTypes.FillColor || propertyType === _AnimatedPropertyTypes.StrokeColor)
						{
							keyFrame._Value = propertyReader.readFloat32Array(new Float32Array(4), "value");
						}

						else if (propertyType === _AnimatedPropertyTypes.FillGradient || propertyType === _AnimatedPropertyTypes.StrokeGradient || propertyType === _AnimatedPropertyTypes.StrokeRadial || propertyType === _AnimatedPropertyTypes.FillRadial)
						{
							const fillLength = propertyReader.readUint16("length");
							keyFrame._Value = propertyReader.readFloat32Array(new Float32Array(fillLength), "value");
						}
						else if (propertyType === _AnimatedPropertyTypes.Trigger)
						{
							// No value on keyframe.
						}
						else if (propertyType === _AnimatedPropertyTypes.IntProperty)
						{
							keyFrame._Value = propertyReader.readInt32("value");
						}
						else if (propertyType === _AnimatedPropertyTypes.StringProperty)
						{
							keyFrame._Value = propertyReader.readString("value");
						}
						else if (propertyType === _AnimatedPropertyTypes.BooleanProperty || propertyType === _AnimatedPropertyTypes.IsCollisionEnabled)
						{
							keyFrame._Value = propertyReader.readBool("value");
						}
						else if (propertyType === _AnimatedPropertyTypes.DrawOrder)
						{
							propertyReader.openArray("drawOrder");
							const orderedImages = propertyReader.readUint16Length();
							const orderValue = [];
							for (let l = 0; l < orderedImages; l++)
							{
								propertyReader.openObject("order");
								const idx = propertyReader.readId("component");
								const order = propertyReader.readUint16("order");
								propertyReader.closeObject();
								orderValue.push(
								{
									componentIdx: idx,
									value: order
								});
							}
							propertyReader.closeArray();
							keyFrame._Value = orderValue;
						}
						else if (propertyType === _AnimatedPropertyTypes.ImageVertices)
						{
							keyFrame._Value = new Float32Array(component._NumVertices * 2);
							propertyReader.readFloat32Array(keyFrame._Value, "array");
						}
						else
						{
							keyFrame._Value = propertyReader.readFloat32("value");
						}

						if (propertyType === _AnimatedPropertyTypes.DrawOrder)
						{
							// Always hold draw order.
							keyFrame._Interpolator = Hold.instance;
						}

						if (lastKeyFrame)
						{
							lastKeyFrame.setNext(keyFrame);
						}
						animatedProperty._KeyFrames.push(keyFrame);
						lastKeyFrame = keyFrame;
						propertyReader.closeObject();
					}
					if (lastKeyFrame)
					{
						lastKeyFrame.setNext(null);
					}
				}
			}
			reader.closeObject();
		}
		reader.closeArray();
	}
	else
	{
		reader.closeArray();
	}
}

function _ReadAnimationsBlock(artboard, reader)
{
	const animationsCount = reader.readUint16Length(); // Keep the reader aligned when using BinaryReader.
	let block = null;
	// The animations block only contains a list of animations, so we don't need to track how many we've read in.
	while ((block = _ReadNextBlock(reader, function(err) { artboard.actor.error = err; }, Block)) !== null)
	{
		switch (block.type)
		{
			case _BlockTypes.Animation:
				_ReadAnimationBlock(artboard, block.reader);
				break;
		}
	}
}

function _ReadNestedActorAssetBlock(actor, reader)
{
	let asset = new NestedActorAsset(reader.readString(), reader.readString());
	actor._NestedActorAssets.push(asset);
}

function _ReadNestedActorAssets(actor, reader)
{
	let nestedActorCount = reader.readUint16();
	let block = null;
	while ((block = _ReadNextBlock(reader, function(err) { actor.error = err; })) !== null)
	{
		switch (block.type)
		{
			case _BlockTypes.NestedActorAsset:
				_ReadNestedActorAssetBlock(actor, block.reader);
				break;
		}
	}
}

// function _BuildJpegAtlas(atlas, img, imga, callback)
// {
// 	const canvas = document.createElement("canvas");
// 	canvas.width = img.width;
//     canvas.height = img.height;
//     const ctx = canvas.getContext("2d");
// 	ctx.drawImage(img, 0, 0, img.width, img.height);

// 	if(imga)
// 	{
// 		const imageDataRGB = ctx.getImageData(0,0,canvas.width, canvas.height);
// 		const dataRGB = imageDataRGB.data;
// 		const canvasAlpha = document.createElement("canvas");

// 		canvasAlpha.width = img.width;
// 		canvasAlpha.height = img.height;
// 		const actx = canvasAlpha.getContext("2d");
// 		actx.drawImage(imga, 0, 0, imga.width, imga.height);

// 		const imageDataAlpha = actx.getImageData(0,0,canvasAlpha.width, canvasAlpha.height);
// 		const dataAlpha = imageDataAlpha.data;

// 		const pixels = dataAlpha.length/4;
// 		let widx = 3;

// 		for(let j = 0; j < pixels; j++)
// 		{
// 			dataRGB[widx] = dataAlpha[widx-1];
// 			widx+=4;
// 		}
// 		ctx.putImageData(imageDataRGB, 0, 0);
// 	}


// 	const atlasImage = new Image();
// 	const enc = canvas.toDataURL();
// 	atlasImage.src = enc;
// 	atlasImage.onload = function()
// 	{
// 		atlas.img = this;
// 		callback();
// 	};
// }

// function _JpegAtlas(dataRGB, dataAlpha, callback)
// {
// 	const _This = this;
// 	const img = document.createElement("img");
// 	let imga;
// 	let c = 0;
// 	let target = 1;
// 	img.onload = function()
// 	{
// 		c++;
// 		if(c === target)
// 		{
// 			_BuildJpegAtlas(_This, img, imga, callback);
// 		}
// 	};

// 	if(dataAlpha)
// 	{
// 		imga = document.createElement("img");
// 		imga.onload = function()
// 		{
// 			c++;
// 			if(c == target)
// 			{
// 				_BuildJpegAtlas(_This, img, imga, callback);
// 			}
// 		};
// 		imga.src = URL.createObjectURL(dataAlpha);
// 	}
// 	img.src = URL.createObjectURL(dataRGB);
// }


function _ReadAtlasesBlock(actor, reader, callback)
{
	// Read atlases.
	const isOOB = reader.readBool("isOOB");
	reader.openArray("data");
	const numAtlases = reader.readUint16Length();

	let waitCount = 1 + numAtlases;
	let loadedCount = 0;

	function next()
	{
		loadedCount++;
		if (loadedCount == waitCount)
		{
			reader.closeArray();
			callback();
		}
	}

	for (let i = 0; i < numAtlases; i++)
	{
		reader.readImage(isOOB, (data) =>
		{
			actor._Atlases.push(new Atlas(data));
			next();
		});
	}

	next();
}

function _LoadNestedAssets(loader, actor, callback)
{
	let loadCount = actor._NestedActorAssets.length;
	let nestedLoad = loader.loadNestedActor;
	if (loadCount == 0 || !nestedLoad)
	{
		callback(actor);
		return;
	}

	for (let asset of actor._NestedActorAssets)
	{
		nestedLoad(asset, function(nestedActor)
		{
			asset._Actor = nestedActor;
			loadCount--;
			if (loadCount <= 0)
			{
				callback(actor);
			}
		});
	}
}

function _ReadArtboardsBlock(actor, reader)
{
	const artboardCount = reader.readUint16Length();
	const actorArtboards = actor._Artboards;

	// Guaranteed from the exporter to be in index order.
	let block = null;
	while ((block = _ReadNextBlock(reader, function(err) { actor.error = err; }, Block)) !== null)
	{
		switch (block.type)
		{
			case _BlockTypes.ActorArtboard:
			{
				const artboard = _ReadActorArtboard(block.reader, new ActorArtboard(actor), block.type);
				if (artboard)
				{
					actorArtboards.push(artboard);
				}
				break;
			}
		}
	}
}

function _ReadActor(loader, data, callback)
{
	let reader = new BinaryReader(new Uint8Array(data));
	// Check signature
	if (reader.readUint8() !== 70 || reader.readUint8() !== 76 || reader.readUint8() !== 65 || reader.readUint8() !== 82 || reader.readUint8() !== 69)
	{
		const dataView = new DataView(data);
		const stringData = new TextDecoder("utf-8").decode(dataView);
		reader = new JSONReader({ "container": JSON.parse(stringData) });
	}

	const version = reader.readUint32("version");
	const actor = new Actor();
	actor.dataVersion = version;
	let block = null;

	let waitCount = 1;
	let completeCount = 0;

	function next()
	{
		completeCount++;
		if (completeCount == waitCount)
		{
			_LoadNestedAssets(loader, actor, callback);
		}
	}

	while ((block = _ReadNextBlock(reader, function(err) { actor.error = err; }, Block)) !== null)
	{
		switch (block.type)
		{
			case _BlockTypes.Artboards:
				_ReadArtboardsBlock(actor, block.reader);
				break;
			case _BlockTypes.Atlases:
				waitCount++;
				_ReadAtlasesBlock(actor, block.reader, function()
				{
					next();
				});
				break;
			case _BlockTypes.NestedActorAssets:
				_ReadNestedActorAssets(actor, block.reader);
				break;
		}
	}
	next();
}

function _ReadActorArtboard(reader, artboard)
{
	artboard._Name = reader.readString("name");
	reader.readFloat32Array(artboard._Translation, "translation");
	artboard._Width = reader.readFloat32("width");
	artboard._Height = reader.readFloat32("height");
	reader.readFloat32Array(artboard._Origin, "origin");
	artboard._ClipContents = reader.readBool("clipContents");
	reader.readFloat32Array(artboard._Color, "color");

	let block = null;
	while ((block = _ReadNextBlock(reader, function(err) { artboard.actor.error = err; }, Block)) !== null)
	{
		switch (block.type)
		{
			case _BlockTypes.Nodes:
				_ReadComponentsBlock(artboard, block.reader);
				break;
			case _BlockTypes.Animations:
				_ReadAnimationsBlock(artboard, block.reader);
				break;
		}
	}

	return artboard;
}

function _ReadActorComponent(reader, component)
{
	component._Name = reader.readString("name");
	component._ParentIdx = reader.readId("parent");
	return component;
}

function _ReadActorPaint(reader, component)
{
	_ReadActorComponent(reader, component);
	component._Opacity = reader.readFloat32("opacity");
	return component;
}

function _ReadCustomProperty(reader, component, type)
{
	_ReadActorComponent(reader, component);

	switch (type)
	{
		case _BlockTypes.CustomIntProperty:
			component._PropertyType = CustomProperty.Type.Integer;
			component._Value = reader.readInt32("int");
			break;
		case _BlockTypes.CustomFloatProperty:
			component._PropertyType = CustomProperty.Type.Float;
			component._Value = reader.readFloat32("float");
			break;
		case _BlockTypes.CustomStringProperty:
			component._PropertyType = CustomProperty.Type.String;
			component._Value = reader.readString("string");
			break;
		case _BlockTypes.CustomBooleanProperty:
			component._PropertyType = CustomProperty.Type.Boolean;
			component._Value = reader.readBool("bool");
			break;
	}

	return component;
}

function _ReadCollider(version, reader, component)
{
	_ReadActorNode(version, reader, component);
	component._IsCollisionEnabled = reader.readBool("isCollisionEnabled");
	return component;
}

function _ReadRectangleCollider(version, reader, component)
{
	_ReadCollider(version, reader, component);

	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");

	return component;
}

function _ReadTriangleCollider(version, reader, component)
{
	_ReadCollider(version, reader, component);

	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");

	return component;
}

function _ReadCircleCollider(version, reader, component)
{
	_ReadCollider(version, reader, component);

	component._Radius = reader.readFloat32("radius");

	return component;
}

function _ReadPolygonCollider(version, reader, component)
{
	_ReadCollider(version, reader, component);

	const numVertices = reader.readUint32("cc");
	component._ContourVertices = new Float32Array(numVertices * 2);
	reader.readFloat32Array(component._ContourVertices, "countour");

	return component;
}

function _ReadLineCollider(version, reader, component)
{
	_ReadCollider(version, reader, component);

	const numVertices = reader.readUint32("lineDataLength");
	component._Vertices = new Float32Array(numVertices * 2);
	reader.readFloat32Array(component._Vertices, "lineData");

	return component;
}

function _ReadActorEvent(reader, component)
{
	_ReadActorComponent(reader, component);
	return component;
}

function _ReadActorNode(version, reader, component)
{
	_ReadActorComponent(reader, component);

	reader.readFloat32Array(component._Translation, "translation");
	component._Rotation = reader.readFloat32("rotation");
	reader.readFloat32Array(component._Scale, "scale");
	component._Opacity = reader.readFloat32("opacity");
	component._IsCollapsedVisibility = reader.readBool("isCollapsed");

	reader.openArray("clips");
	const clipCount = reader.readUint8Length();
	if (clipCount)
	{
		component._Clips = [];
		for (let i = 0; i < clipCount; i++)
		{
			const clip = { idx: reader.readId("clip"), intersect: true };
			if (version >= 23)
			{
				clip.intersect = reader.readBool("intersect");
			}
			component._Clips.push(clip);
		}
	}
	reader.closeArray();
	return component;
}

function _ReadActorNodeSolo(version, reader, component)
{
	_ReadActorNode(version, reader, component);
	component._ActiveChildIndex = reader.readUint32("activeChild");
	return component;
}

function _ReadActorBone(version, reader, component)
{
	_ReadActorNode(version, reader, component);
	component._Length = reader.readFloat32("length");
	return component;
}

function _ReadActorJellyBone(reader, component)
{
	_ReadActorComponent(reader, component);
	component._Opacity = reader.readFloat32("opacity");
	component._IsCollapsedVisibility = reader.readBool("isCollapsedVisibility");

	return component;
}

function _ReadJellyComponent(reader, component)
{
	_ReadActorComponent(reader, component);
	component._EaseIn = reader.readFloat32("easeIn");
	component._EaseOut = reader.readFloat32("easeOut");
	component._ScaleIn = reader.readFloat32("scaleIn");
	component._ScaleOut = reader.readFloat32("scaleOut");
	component._InTargetIdx = reader.readId("inTarget");
	component._OutTargetIdx = reader.readId("outTarget");

	return component;
}

function _ReadActorRootBone(version, reader, component)
{
	_ReadActorNode(version, reader, component);

	return component;
}

function _ReadActorIKTarget(version, reader, component)
{
	_ReadActorNode(version, reader, component);

	component._Strength = reader.readFloat32();
	component._InvertDirection = reader.readUint8() === 1;

	let numInfluencedBones = reader.readUint8();
	if (numInfluencedBones > 0)
	{
		component._InfluencedBones = [];

		for (let i = 0; i < numInfluencedBones; i++)
		{
			component._InfluencedBones.push(reader.readUint16());
		}
	}

	return component;
}

function _ReadActorConstraint(reader, component)
{
	_ReadActorComponent(reader, component);
	component._Strength = reader.readFloat32("strength");
	component._IsEnabled = reader.readBool("isEnabled");
}

function _ReadActorTargetedConstraint(reader, component)
{
	_ReadActorConstraint(reader, component);

	component._TargetIdx = reader.readId("target");
}

function _ReadActorIKConstraint(reader, component)
{
	_ReadActorTargetedConstraint(reader, component);

	component._InvertDirection = reader.readBool("isInverted");

	reader.openArray("bones");
	const numInfluencedBones = reader.readUint8Length();
	if (numInfluencedBones > 0)
	{
		component._InfluencedBones = [];

		for (let i = 0; i < numInfluencedBones; i++)
		{
			component._InfluencedBones.push(reader.readId("")); // No need for a label here, since we're just clearing elements from the array.
		}
	}
	reader.closeArray();
	return component;
}

function _ReadActorDistanceConstraint(reader, component)
{
	_ReadActorTargetedConstraint(reader, component);

	component._Distance = reader.readFloat32("distance");
	component._Mode = reader.readUint8("modeId");

	return component;
}

function _ReadActorTransformConstraint(reader, component)
{
	_ReadActorTargetedConstraint(reader, component);

	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");

	return component;
}

function _ReadRotationConstraint(reader, component)
{
	_ReadActorTargetedConstraint(reader, component);

	if ((component._Copy = reader.readBool("copy")))
	{
		component._Scale = reader.readFloat32("scale");
	}
	if ((component._EnableMin = reader.readBool("enableMin")))
	{
		component._Min = reader.readFloat32("min");
	}
	if ((component._EnableMax = reader.readBool("enableMax")))
	{
		component._Max = reader.readFloat32("max");
	}

	component._Offset = reader.readBool("offset");
	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");
	component._MinMaxSpace = reader.readUint8("minMaxSpaceId");

	return component;
}

function _ReadAxisConstraint(reader, component)
{
	_ReadActorTargetedConstraint(reader, component);
	// X Axis
	if ((component._CopyX = reader.readBool("copyX")))
	{
		component._ScaleX = reader.readFloat32("scaleX");
	}
	if ((component._EnableMinX = reader.readBool("enableMinX")))
	{
		component._MinX = reader.readFloat32("minX");
	}
	if ((component._EnableMaxX = reader.readBool("enableMaxX")))
	{
		component._MaxX = reader.readFloat32("maxX");
	}

	// Y Axis
	if ((component._CopyY = reader.readBool("copyY")))
	{
		component._ScaleY = reader.readFloat32("scaleY");
	}
	if ((component._EnableMinY = reader.readBool("enableMinY")))
	{
		component._MinY = reader.readFloat32("minY");
	}
	if ((component._EnableMaxY = reader.readBool("enableMaxY")))
	{
		component._MaxY = reader.readFloat32("maxY");
	}

	component._Offset = reader.readBool("offset");
	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");
	component._MinMaxSpace = reader.readUint8("minMaxSpaceId");

	return component;
}

function _ReadActorShape(version, reader, component)
{
	_ReadDrawable(version, reader, component);
	if (version >= 22)
	{
		component._TransformAffectsStroke = reader.readBool("transformAffectsStroke");
	}
	return component;
}

function _ReadProceduralPath(version, reader, component)
{
	_ReadActorNode(version, reader, component);
	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");
	return component;
}

function _ReadActorStar(version, reader, component)
{
	_ReadProceduralPath(version, reader, component);
	component._Points = reader.readUint32("points");
	component._InnerRadius = reader.readFloat32("innerRadius");

	return component;
}

function _ReadActorRectangle(version, reader, component)
{
	_ReadProceduralPath(version, reader, component);
	component._CornerRadius = reader.readFloat32("cornerRadius");
	return component;
}

function _ReadActorPolygon(version, reader, component)
{
	_ReadProceduralPath(version, reader, component);
	component._Sides = reader.readUint32("sides");
	return component;
}

function _ReadActorTriangle(version, reader, component)
{
	_ReadProceduralPath(version, reader, component);

	return component;
}

function _ReadActorEllipse(version, reader, component)
{
	_ReadProceduralPath(version, reader, component);
	return component;
}

function _ReadColorFill(reader, component)
{
	_ReadActorPaint(reader, component);

	reader.readFloat32Array(component._Color, "color");
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadStroke(reader, component)
{
	component._Width = reader.readFloat32("width");
	component._Cap = reader.readUint8("cap");
	component._Join = reader.readUint8("join");
	component._Trim = reader.readUint8("trim");
	if (component._Trim !== TrimPathOff)
	{
		component._TrimStart = reader.readFloat32("start");
		component._TrimEnd = reader.readFloat32("end");
		component._TrimOffset = reader.readFloat32("offset");
	}
}

function _ReadColorStroke(reader, component)
{
	_ReadActorPaint(reader, component);
	reader.readFloat32Array(component._Color, "color");
	_ReadStroke(reader, component);

	return component;
}

function _ReadGradient(reader, component)
{
	const numStops = reader.readUint8("numColorStops");
	const stops = new Float32Array(numStops * 5);
	reader.readFloat32Array(stops, "colorStops");
	component._ColorStops = stops;

	reader.readFloat32Array(component._Start, "start");
	reader.readFloat32Array(component._End, "end");

	return component;
}

function _ReadRadialGradient(reader, component)
{
	_ReadGradient(reader, component);
	component._SecondaryRadiusScale = reader.readFloat32("secondaryRadiusScale");

	return component;
}

function _ReadGradientFill(reader, component)
{
	_ReadActorPaint(reader, component);

	_ReadGradient(reader, component);
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadGradientStroke(reader, component)
{
	_ReadActorPaint(reader, component);

	_ReadGradient(reader, component);
	_ReadStroke(reader, component);

	return component;
}

function _ReadRadialGradientFill(reader, component)
{
	_ReadActorPaint(reader, component);

	_ReadRadialGradient(reader, component);
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadRadialGradientStroke(reader, component)
{
	_ReadActorPaint(reader, component);

	_ReadRadialGradient(reader, component);
	_ReadStroke(reader, component);

	return component;
}

function _ReadDrawable(version, reader, component)
{
	_ReadActorNode(version, reader, component);

	component._IsHidden = !reader.readBool("isVisible");
	const blendID = reader.readUint8("blendMode");
	component._BlendMode = BlendMode.fromID(blendID);
	component._DrawOrder = reader.readUint16("drawOrder");

	return component;
}

function _ReadSkinnable(reader, component)
{
	reader.openArray("bones");
	const numConnectedBones = reader.readUint8Length();
	if (numConnectedBones > 0)
	{
		component._ConnectedBones = [];
		for (let i = 0; i < numConnectedBones; i++)
		{
			reader.openObject("bone");
			const bind = mat2d.create();
			const componentIndex = reader.readId("component");
			reader.readFloat32Array(bind, "bind");
			reader.closeObject();

			component._ConnectedBones.push(
			{
				componentIndex: componentIndex,
				bind: bind,
				ibind: mat2d.invert(mat2d.create(), bind)
			});
		}
		reader.closeArray();

		// Read the final override parent world.
		const overrideWorld = mat2d.create();
		reader.readFloat32Array(overrideWorld, "worldTransform");
		mat2d.copy(component._WorldTransform, overrideWorld);
		component._OverrideWorldTransform = true;
	}
	else
	{
		// Close the previously opened JSON Array.
		reader.closeArray();
	}
}

function _ReadActorPath(version, reader, component)
{
	_ReadActorNode(version, reader, component);
	_ReadSkinnable(reader, component);

	component._IsHidden = !reader.readBool("isVisible");
	component._IsClosed = reader.readBool("isClosed");

	reader.openArray("points");
	const pointCount = reader.readUint16Length();
	const points = new Array(pointCount);
	const isConnectedToBones = component._ConnectedBones && component._ConnectedBones.length > 0;

	for (let i = 0; i < pointCount; i++)
	{
		reader.openObject("point");
		const type = reader.readUint8("pointType");
		let point = null;
		switch (type)
		{
			case PointType.Straight:
			{
				point = new StraightPathPoint();
				reader.readFloat32Array(point._Translation, "translation");
				point._Radius = reader.readFloat32("radius");
				if (isConnectedToBones)
				{
					point._Weights = new Float32Array(8);
				}
				break;
			}
			default:
			{
				point = new CubicPathPoint();
				reader.readFloat32Array(point._Translation, "translation");
				reader.readFloat32Array(point._In, "in");
				reader.readFloat32Array(point._Out, "out");
				if (isConnectedToBones)
				{
					point._Weights = new Float32Array(24);
				}
				break;
			}
		}
		if (point._Weights)
		{
			reader.readFloat32Array(point._Weights, "weights");
		}
		reader.closeObject();
		if (!point)
		{
			throw new Error("Invalid point type " + type);
		}
		point._PointType = type;
		points[i] = point;
	}
	reader.closeArray();
	component._Points = points;

	return component;
}

function _ReadActorImage(version, reader, component)
{
	_ReadDrawable(version, reader, component);
	_ReadSkinnable(reader, component);

	if (!component.isHidden)
	{
		component._AtlasIndex = reader.readUint8("atlas");

		const numVertices = reader.readUint32("numVertices");
		const vertexStride = component.isConnectedToBones ? 12 : 4;

		component._NumVertices = numVertices;
		component._VertexStride = vertexStride;
		component._Vertices = new Float32Array(numVertices * vertexStride);
		reader.readFloat32Array(component._Vertices, "vertices");

		const numTris = reader.readUint32("numTriangles");
		component._Triangles = new Uint16Array(numTris * 3);
		reader.readUint16Array(component._Triangles, "triangles");
	}

	return component;
}

function _ReadActorImageSequence(version, reader, component)
{
	_ReadActorImage(version, reader, component);

	// See if it was visible to begin with.
	if (component._AtlasIndex != -1)
	{
		reader.openArray("frames");
		const frameCount = reader.readUint16Length();
		component._SequenceFrames = [];
		const uvs = new Float32Array(component._NumVertices * 2 * frameCount);
		const uvStride = component._NumVertices * 2;
		component._SequenceUVs = uvs;
		const firstFrame = {
			atlas: component._AtlasIndex,
			offset: 0
		};

		component._SequenceFrames.push(firstFrame);

		let readIdx = 2;
		let writeIdx = 0;
		for (let i = 0; i < component._NumVertices; i++)
		{
			uvs[writeIdx++] = component._Vertices[readIdx];
			uvs[writeIdx++] = component._Vertices[readIdx + 1];
			readIdx += component._VertexStride;
		}

		let offset = uvStride;
		for (let i = 1; i < frameCount; i++)
		{
			reader.openObject("frame");
			let frame = {
				atlas: reader.readUint8("atlas"),
				offset: offset * 4
			};

			component._SequenceFrames.push(frame);
			reader.readFloat32ArrayOffset(uvs, uvStride, offset, "uv");
			reader.closeObject();

			offset += uvStride;
		}
		reader.closeArray();
	}

	return component;
}

function _ReadNestedActor(version, reader, component, nestedActorAssets)
{
	_ReadActorNode(version, reader, component);
	let isVisible = reader.readUint8();
	if (isVisible)
	{
		// Draw order
		component._DrawOrder = reader.readUint16();
		let assetIndex = reader.readUint16();
		if (assetIndex < nestedActorAssets.length)
		{
			component._Asset = nestedActorAssets[assetIndex];
		}
	}
	return component;
}

export default class ActorLoader
{
	load(url, callback)
	{
		let loader = this;
		if (url.constructor === String)
		{
			let req = new XMLHttpRequest();
			req.open("GET", url, true);
			req.responseType = "blob";
			req.onload = function()
			{
				let fileReader = new FileReader();
				fileReader.onload = function()
				{
					_ReadActor(loader, this.result, callback);
				};
				fileReader.readAsArrayBuffer(this.response);
			};
			req.send();
		}
		else
		{
			let fileReader = new FileReader();
			fileReader.onload = function()
			{
				_ReadActor(loader, this.result, callback);
			};
			fileReader.readAsArrayBuffer(url);
		}
	}
}