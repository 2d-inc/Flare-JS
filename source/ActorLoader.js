import Animation from "./Animation.js";
import BinaryReader from "./Readers/BinaryReader.js";
import JSONReader from "./Readers/JSONReader.js";
import Actor from "./Actor.js";
import ActorEvent from "./ActorEvent.js";
import ActorNode from "./ActorNode.js";
import ActorNodeSolo from "./ActorNodeSolo.js";
import ActorBone from "./ActorBone.js";
import ActorEllipse from "./ActorEllipse.js";
import ActorRectangle from "./ActorRectangle.js";
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
import {ColorFill, ColorStroke, GradientFill, GradientStroke, RadialGradientFill, RadialGradientStroke} from "./ColorComponent.js";
import {StraightPathPoint, CubicPathPoint, PointType} from "./PathPoint.js";
import {KeyFrame, PathsKeyFrame} from "./KeyFrame.js";
import {mat2d, vec2} from "gl-matrix";
import {Hold, Linear, Cubic} from "./Interpolation.js";


const _BlockTypes = {
	Nodes:1,
	ActorNode:2,
	ActorBone:3,
	ActorRootBone:4,
	ActorImage:5,
	View:6,
	Animation:7,
	Animations:8,
	Atlases:9,
	Atlas:10,
	ActorIKTarget:11,
	ActorEvent:12,
	CustomIntProperty:13,
	CustomFloatProperty:14,
	CustomStringProperty:15,
	CustomBooleanProperty:16,
	ColliderRectangle:17, 
	ColliderTriangle:18, 
	ColliderCircle:19, 
	ColliderPolygon:20, 
	ColliderLine:21, 
	ActorImageSequence:22,
	ActorNodeSolo:23,
	NestedActorNode:24,
	NestedActorAssets:25,
	NestedActorAsset:26,
	ActorStaticMesh:27,
	JellyComponent: 28,
	ActorJellyBone: 29,
	ActorIKConstraint: 30,
	ActorDistanceConstraint: 31,
	ActorTranslationConstraint: 32,
	ActorRotationConstraint: 33,
	ActorScaleConstraint: 34,
	ActorTransformConstraint: 35,

	ActorShape:100,
	ActorPath:101,
	ColorFill:102,
	ColorStroke:103,
	GradientFill:104,
	GradientStroke:105,
	RadialGradientFill:106,
	RadialGradientStroke:107,
	ActorEllipse: 108,
	ActorRectangle: 109
};

const _Readers = {
	"bin": {
		stream: BinaryReader,
		container: Uint8Array,
		extension: ".nma"
	},
	"json": {
		stream: JSONReader,
		container: Object,
		extension: "nmj"
	}
};

let _ReadAtlasesBlock = null;

function _ReadNextBlock(reader, error, typesList)
{
	if(reader.isEOF())
	{
		return null;
	}
	let blockType = 0, container = 0;
	const cType = reader.containerType; // 'bin' || 'json'
	const streamReader = _Readers[cType];
	try
	{
		// blockType = reader.readUint8();
		blockType = reader.readBlockType(typesList);
		if(blockType === undefined)
		{
			return null;
		}
		const length = reader.readUint32Length();

		container = new streamReader["container"](length);
		reader.readRaw(container, length);
	}
	catch(err)
	{
		console.log(err.constructor);
		if(error)
		{
			error(err);
		}
		return null;
	}
	return {type:blockType, reader: new streamReader.stream(container)};
}

function _ReadComponentsBlock(actor, reader)
{
	let componentCount = reader.readUint16Length();
	let actorComponents = actor._Components;

	// Guaranteed from the exporter to be in index order.
	let block = null;
	while((block = _ReadNextBlock(reader, function(err) {actor.error = err;}, _BlockTypes)) !== null)
	{
		let component = null;
		switch(block.type)
		{
			case _BlockTypes.CustomIntProperty:
			case _BlockTypes.CustomStringProperty:
			case _BlockTypes.CustomFloatProperty:
			case _BlockTypes.CustomBooleanProperty:
				component = _ReadCustomProperty(block.reader, new CustomProperty(), block.type);
				break;
			case _BlockTypes.ColliderRectangle:
				component = _ReadRectangleCollider(block.reader, new ActorColliderRectangle());
				break;
			case _BlockTypes.ColliderTriangle:
				component = _ReadTriangleCollider(block.reader, new ActorColliderTriangle());
				break;
			case _BlockTypes.ColliderCircle:
				component = _ReadCircleCollider(block.reader, new ActorColliderCircle());
				break;
			case _BlockTypes.ColliderPolygon:
				component = _ReadPolygonCollider(block.reader, new ActorColliderPolygon());
				break;
			case _BlockTypes.ColliderLine:
				component = _ReadLineCollider(block.reader, new ActorColliderLine());
				break;
			case _BlockTypes.ActorEvent:
				component = _ReadActorEvent(block.reader, new ActorEvent());
				break;
			case _BlockTypes.ActorNode:
				component = _ReadActorNode(block.reader, new ActorNode());
				break;
			case _BlockTypes.ActorBone:
				component = _ReadActorBone(block.reader, new ActorBone());
				break;
			case _BlockTypes.ActorJellyBone:
				component = _ReadActorJellyBone(block.reader, new ActorJellyBone());
				break;
			case _BlockTypes.JellyComponent:
				component = _ReadJellyComponent(block.reader, new JellyComponent());
				break;
			case _BlockTypes.ActorRootBone:
				component = _ReadActorRootBone(block.reader, new ActorRootBone());
				break;
			case _BlockTypes.ActorImage:
				component = _ReadActorImage(block.reader, new ActorImage());
				break;
			case _BlockTypes.ActorImageSequence:
				component = _ReadActorImageSequence(block.reader, new ActorImage());
				break;
			case _BlockTypes.ActorIKTarget:
				component = _ReadActorIKTarget(actor.dataVersion, block.reader, new ActorIKTarget());
				break;
			case _BlockTypes.NestedActorNode:
				component = _ReadNestedActor(block.reader, new NestedActorNode(), actor._NestedActorAssets);
				break;
			case _BlockTypes.ActorNodeSolo:
				component = _ReadActorNodeSolo(block.reader, new ActorNodeSolo());
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
				component = _ReadActorShape(block.reader, new ActorShape());
				break;
			case _BlockTypes.ActorPath:
				component = _ReadActorPath(block.reader, new ActorPath());
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
				component = _ReadActorEllipse(block.reader, new ActorEllipse());
				break;
			case _BlockTypes.ActorRectangle:
				component = _ReadActorRectangle(block.reader, new ActorRectangle());
				break;
		}
		if(component)
		{
			component._Idx = actorComponents.length;
		}
		actorComponents.push(component);
	}
	actor.resolveHierarchy();
}

function _ReadAnimationBlock(actor, reader)
{
	const animation = new Animation(actor);
	actor._Animations.push(animation);

	animation._Name = reader.readString("name");
	animation._FPS = reader.readUint8("fps");
	animation._Duration = reader.readFloat32("duration");
	animation._Loop = reader.readBool("isLooping");

	reader.openArray("KeyedNodes");
	// Read the number of keyed nodes.
	const numKeyedComponents = reader.readUint16Length();
	if(numKeyedComponents > 0)
	{	
		for(let i = 0; i < numKeyedComponents; i++)
		{
			reader.openObject("Node");
			const componentIndex = reader.readId("nodeIndex");
			let component = actor._Components[componentIndex];
			if(!component)
			{
					// Bad component was loaded, read past the animation data.
					// Note this only works after version 12 as we can read by the entire set of properties.
					// TODO: test this case with JSON.
					const props = reader.readUint16();
					for(let j = 0; j < props; j++)
					{
						let propertyBlock = _ReadNextBlock(reader, function(err) {actor.error = err;});
					}
			}
			else
			{
				const animatedComponent = new AnimatedComponent(componentIndex);
				if(component.constructor === ActorEvent)
				{
					// N.B. ActorEvents currently only keyframe their trigger so we cn optimize them into a separate array.
					animation._TriggerComponents.push(animatedComponent);	
				}
				else
				{
					animation._Components.push(animatedComponent);
				}
				
				reader.openArray("Properties");
				const props = reader.readUint16Length();
				for(let j = 0; j < props; j++)
				{
					let propertyReader = null;
					let propertyType;
					
					if(actor.dataVersion >= 12)
					{
						// Since version 12 we write properties as blocks in order to allow for reading past unknown animated properties
						let propertyBlock = _ReadNextBlock(reader, function(err) {actor.error = err;}, AnimatedProperty.Properties);
						propertyReader = propertyBlock.reader;
						propertyType = propertyBlock.type;
					}
					else
					{
						propertyReader = reader;
						propertyType = reader.readBlockType(AnimatedProperty.Properties);
					}

					let validProperty = false;
					switch(propertyType)
					{
						case AnimatedProperty.Properties.PosX:
						case AnimatedProperty.Properties.PosY:
						case AnimatedProperty.Properties.ScaleX:
						case AnimatedProperty.Properties.ScaleY:
						case AnimatedProperty.Properties.Rotation:
						case AnimatedProperty.Properties.Opacity:
						case AnimatedProperty.Properties.DrawOrder:
						case AnimatedProperty.Properties.Length:
						case AnimatedProperty.Properties.VertexDeform:
						case AnimatedProperty.Properties.ConstraintStrength:
						case AnimatedProperty.Properties.Trigger:
						case AnimatedProperty.Properties.IntProperty:
						case AnimatedProperty.Properties.FloatProperty:
						case AnimatedProperty.Properties.StringProperty:
						case AnimatedProperty.Properties.BooleanProperty:
						case AnimatedProperty.Properties.IsCollisionEnabled:
						case AnimatedProperty.Properties.ActiveChildIndex:
						case AnimatedProperty.Properties.Sequence:
						case AnimatedProperty.Properties.PathVertices:
						case AnimatedProperty.Properties.FillColor:
						case AnimatedProperty.Properties.StrokeColor:
						case AnimatedProperty.Properties.StrokeWidth:
						case AnimatedProperty.Properties.FillGradient:
						case AnimatedProperty.Properties.StrokeGradient:
						case AnimatedProperty.Properties.FillRadial:
						case AnimatedProperty.Properties.StrokeRadial:
						case AnimatedProperty.Properties.StrokeOpacity:
						case AnimatedProperty.Properties.FillOpacity:
						case AnimatedProperty.Properties.ShapeWidth:
						case AnimatedProperty.Properties.ShapeHeight:
						case AnimatedProperty.Properties.CornerRadius:
						case AnimatedProperty.Properties.InnerRadius:
							validProperty = true;
							break;
						default:
							break;
					}
					if(!validProperty)
					{
						continue;
					}
					const animatedProperty = new AnimatedProperty(propertyType);
					animatedComponent._Properties.push(animatedProperty);

					propertyReader.openArray("KeyFrames");
					const keyFrameCount = propertyReader.readUint16Length();
					let lastKeyFrame = null;
					for(let k = 0; k < keyFrameCount; k++)
					{
						let keyFrame = new KeyFrame(animatedProperty);

						propertyReader.openObject("KeyFrame");
						
						keyFrame._Time = propertyReader.readFloat64("time");

						switch(propertyType)
						{
							case AnimatedProperty.Properties.IsCollisionEnabled:
							case AnimatedProperty.Properties.BooleanProperty:
							case AnimatedProperty.Properties.StringProperty:
							case AnimatedProperty.Properties.Trigger:
							case AnimatedProperty.Properties.DrawOrder:
							case AnimatedProperty.Properties.ActiveChildIndex:
								// These do not interpolate.
								keyFrame._Interpolator = Hold.instance;
								break;
							default:
							{
								const type = propertyReader.readUint8("interpolatorType");
								switch(type)
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
									// Hold: 0
									// Linear: 1
									// Cubic: 2
									// case KeyFrame.Type.Asymmetric:
									// case KeyFrame.Type.Mirrored:
									// case KeyFrame.Type.Disconnected:
									// 	keyFrame._InFactor = propertyReader.readFloat64();
									// 	keyFrame._InValue = propertyReader.readFloat32();
									// 	keyFrame._OutFactor = propertyReader.readFloat64();
									// 	keyFrame._OutValue = propertyReader.readFloat32();
									// 	break;

									// case KeyFrame.Type.Hold:
									// 	keyFrame._InFactor = propertyReader.readFloat64();
									// 	keyFrame._InValue = propertyReader.readFloat32();
									// 	break;

									// default:
									// 	keyFrame._InValue = keyFrame._Value;
									// 	keyFrame._OutValue = keyFrame._Value;
									// 	break;
								}
								break;
							}
						}
						if(propertyType === AnimatedProperty.Properties.PathVertices)
						{
							const path = actor._Components[animatedComponent._ComponentIndex];
							const pointCount = path._Points.length;
							const points = [];
							
							for(let j = 0; j < pointCount; j++)
							{
								const point = path._Points[j];

								const pos = propertyReader.readFloat32Array(new Float32Array(2), "translation");
								points.push(pos[0], pos[1]);

								if(point.constructor === StraightPathPoint)
								{
									points.push(propertyReader.readFloat32("radius"));
								}
								else
								{
									let p = propertyReader.readFloat32Array(new Float32Array(2), "inValue");
									points.push(p[0], p[1]);

									p = propertyReader.readFloat32Array(new Float32Array(2), "outValue");
									points.push(p[0], p[1]);
								}
							}

							keyFrame._Value = new Float32Array(points);
						}
						else if(propertyType === AnimatedProperty.Properties.FillColor || propertyType === AnimatedProperty.Properties.StrokeColor)
						{
							keyFrame._Value = propertyReader.readFloat32Array(new Float32Array(4), "value");
						}

						else if(propertyType === AnimatedProperty.Properties.FillGradient || propertyType === AnimatedProperty.Properties.StrokeGradient || propertyType === AnimatedProperty.Properties.StrokeRadial || propertyType === AnimatedProperty.Properties.FillRadial)
						{
							const fillLength = propertyReader.readUint16("length");
							keyFrame._Value = propertyReader.readFloat32Array(new Float32Array(fillLength), "value");
						}
						else if(propertyType === AnimatedProperty.Properties.Trigger)
						{
							// No value on keyframe.
						}
						else if(propertyType === AnimatedProperty.Properties.IntProperty)
						{
							keyFrame._Value = propertyReader.readInt32("value");
						}
						else if(propertyType === AnimatedProperty.Properties.StringProperty)
						{
							keyFrame._Value = propertyReader.readString("value");
						}
						else if(propertyType === AnimatedProperty.Properties.BooleanProperty || propertyType === AnimatedProperty.Properties.IsCollisionEnabled)
						{
							keyFrame._Value = propertyReader.readBool("value");
						}
						else if(propertyType === AnimatedProperty.Properties.DrawOrder)
						{
							propertyReader.openArray("drawOrder");
							const orderedImages = propertyReader.readUint16Length();
							const orderValue = [];
							for(let l = 0; l < orderedImages; l++)
							{
								propertyReader.openObject("order");
								const idx = propertyReader.readId("nodeIndex");
								const order = propertyReader.readUint16("order");
								propertyReader.closeObject();
								orderValue.push({
									componentIdx:idx,
									value:order
								});
							}
							propertyReader.closeArray();
							keyFrame._Value = orderValue;
						}
						else if(propertyType === AnimatedProperty.Properties.VertexDeform)
						{
							keyFrame._Value = new Float32Array(component._NumVertices * 2);
							component.hasVertexDeformAnimation = true;
							propertyReader.readFloat32Array(keyFrame._Value, "value");
						}
						else
						{
							keyFrame._Value = propertyReader.readFloat32("value");
						}

						switch(keyFrame._Type)
						{
							case KeyFrame.Type.Asymmetric:
							case KeyFrame.Type.Mirrored:
							case KeyFrame.Type.Disconnected:
							case KeyFrame.Type.Hold:
								break;

							default:
								keyFrame._InValue = keyFrame._Value;
								keyFrame._OutValue = keyFrame._Value;
								break;
						}
						if(propertyType === AnimatedProperty.Properties.DrawOrder)
						{
							// Always hold draw order.
							keyFrame._Type = KeyFrame.Type.Hold;
						}
						else if(propertyType === AnimatedProperty.Properties.VertexDeform)
						{
							keyFrame._Type = KeyFrame.Type.Linear;
						}

						if(lastKeyFrame)
						{
							lastKeyFrame.setNext(keyFrame);
						}
						animatedProperty._KeyFrames.push(keyFrame);
						lastKeyFrame = keyFrame;
						propertyReader.closeObject();
					}
					if(lastKeyFrame)
					{
						lastKeyFrame.setNext(null);
					}
				}
				reader.closeArray();
			}
			reader.closeObject();
		}
		reader.closeArray();
		
		animation._DisplayStart = reader.readFloat32("animationStart");
		animation._DisplayEnd = reader.readFloat32("animationEnd");
		//animation._DisplayStart = 0;
		//animation._DisplayEnd = 50/60;
	}
	else
	{
		reader.closeArray();
	}
}

function _ReadAnimationsBlock(actor, reader)
{
	const animationsCount = reader.readUint16Length(); // Keep the reader aligned when using BinaryReader.
	let block = null;
	// The animations block only contains a list of animations, so we don't need to track how many we've read in.
	while((block = _ReadNextBlock(reader, function(err) {actor.error = err;}, _BlockTypes)) !== null)
	{
		switch(block.type)
		{
			case _BlockTypes.Animation:
				_ReadAnimationBlock(actor, block.reader);
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
	while((block=_ReadNextBlock(reader, function(err) {actor.error = err;})) !== null)
	{
		switch(block.type)
		{
			case _BlockTypes.NestedActorAsset:
				_ReadNestedActorAssetBlock(actor, block.reader);
				break;
		}
	}
}

function _BuildJpegAtlas(atlas, img, imga, callback)
{
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height);
	
	if(imga)
	{
		const imageDataRGB = ctx.getImageData(0,0,canvas.width, canvas.height);
		const dataRGB = imageDataRGB.data;
		const canvasAlpha = document.createElement("canvas");

		canvasAlpha.width = img.width;
		canvasAlpha.height = img.height;
		const actx = canvasAlpha.getContext("2d");
		actx.drawImage(imga, 0, 0, imga.width, imga.height);
	
		const imageDataAlpha = actx.getImageData(0,0,canvasAlpha.width, canvasAlpha.height);
		const dataAlpha = imageDataAlpha.data;
	
		const pixels = dataAlpha.length/4;
		let widx = 3;
	
		for(let j = 0; j < pixels; j++)
		{
			dataRGB[widx] = dataAlpha[widx-1];
			widx+=4;
		}
		ctx.putImageData(imageDataRGB, 0, 0);
	}


	const atlasImage = new Image();
	const enc = canvas.toDataURL();
	atlasImage.src = enc;
	atlasImage.onload = function()
	{
		atlas.img = this;
		callback();
	};
}

function _JpegAtlas(dataRGB, dataAlpha, callback)
{
	const _This = this;
	const img = document.createElement("img");
	let imga;
	let c = 0;
	let target = 1;
	img.onload = function()
	{
		c++;
		if(c === target)
		{
			_BuildJpegAtlas(_This, img, imga, callback);
		}
	};
	
	if(dataAlpha)
	{
		imga = document.createElement("img");
		imga.onload = function()
		{
			c++;
			if(c == target)
			{
				_BuildJpegAtlas(_This, img, imga, callback);
			}
		};
		imga.src = URL.createObjectURL(dataAlpha);
	}
	img.src = URL.createObjectURL(dataRGB);
}

function _ReadAtlasesBlock14(actor, reader, callback)
{
	// Read atlases.
	const numAtlases = reader.readUint16();

	let waitCount = 0;
	let loadedCount = 0;
	function loaded()
	{
		loadedCount++;
		if(loadedCount === waitCount)
		{
			callback();
		}
	}

	for(let i = 0; i < numAtlases; i++)
	{
		let size = reader.readUint32();
		const atlasDataRGB = new Uint8Array(size);
		reader.readRaw(atlasDataRGB, atlasDataRGB.length);

		size = reader.readUint32();
		const atlasDataAlpha = new Uint8Array(size);
		reader.readRaw(atlasDataAlpha, atlasDataAlpha.length);

		const rgbSrc = new Blob([atlasDataRGB], {type: "image/jpeg"});
		const alphaSrc = new Blob([atlasDataAlpha], {type: "image/jpeg"});

		waitCount++;
		const atlas = new _JpegAtlas(rgbSrc, alphaSrc, loaded);

		actor._Atlases.push(atlas);//new Blob([atlasDataRGB], {type: "image/jpeg"}));
	}

	// Return true if we are waiting for atlases
	return waitCount !== loadedCount;
}

function _ReadAtlasesBlock15(actor, reader, callback)
{
	// Internal Callback
	function loaded()
	{
		loadedCount++;
		if(loadedCount === waitCount)
		{
			callback();
		}
	}
	// ==== 
	
	// Read atlases.
	const isOOB = reader.readBool("isOOB");
	reader.openArray("data");
	const numAtlases = reader.readUint16Length();

	let waitCount = 0;
	let loadedCount = 0;

	for(let i = 0; i < numAtlases; i++)
	{
		waitCount++;
		let readCallback = function(data)
		{
			if(data.constructor === Blob)
			{
				const atlas = new _JpegAtlas(data, undefined, loaded);
				actor._Atlases.push(atlas);
			}
			else if(data.constructor === String)
			{
				const imgElm = document.createElement("img");
				const atlas = {};
				imgElm.onload = function()
				{
					atlas.img = this;
					loaded();
				};
				actor._Atlases.push(atlas);
				imgElm.src = data;
			}
		};

		reader.readImage(isOOB, readCallback); 
	}

	reader.closeArray();

	// Return true if we are waiting for atlases
	return waitCount !== loadedCount;
}

function _LoadNestedAssets(loader, actor, callback)
{
	let loadCount = actor._NestedActorAssets.length;
	let nestedLoad = loader.loadNestedActor;
	if(loadCount == 0 || !nestedLoad)
	{
		callback(actor);
		return;
	}

	for(let asset of actor._NestedActorAssets)
	{
		nestedLoad(asset, function(nestedActor)
		{
			asset._Actor = nestedActor;
			loadCount--;
			if(loadCount <= 0)
			{
				callback(actor);
			}
		});
	}
}

function _ReadShot(loader, data, callback)
{
	let reader = new BinaryReader(new Uint8Array(data));
	// Check signature
	if(reader.readUint8() !== 70 || reader.readUint8() !== 76 || reader.readUint8() !== 65 || reader.readUint8() !== 82 || reader.readUint8() !== 69)
	{
		const dataView = new DataView(data);
		const stringData = new TextDecoder("utf-8").decode(dataView);
		reader = new JSONReader({"container": JSON.parse(stringData)});
	}

	const version = reader.readUint32("version");
	const actor = new Actor();
	actor.dataVersion = version;
	let block = null;
	let waitForAtlas = false;
	while((block = _ReadNextBlock(reader, function(err) {actor.error = err;}, _BlockTypes)) !== null)
	{
		switch(block.type)
		{
			case _BlockTypes.Nodes:
				_ReadComponentsBlock(actor, block.reader);
				break;
			case _BlockTypes.View:
				actor._ViewCenter = vec2.create();
				actor._ViewCenter[0] = block.reader.readFloat32("x");
				actor._ViewCenter[1] = block.reader.readFloat32("y");
				actor._ViewWidth = block.reader.readFloat32("width");
				actor._ViewHeight = block.reader.readFloat32("height");
				break;
			case _BlockTypes.Animations:
				_ReadAnimationsBlock(actor, block.reader);
				break;
			case _BlockTypes.Atlases:

				if(_ReadAtlasesBlock(actor, block.reader, function()
					{
						_LoadNestedAssets(loader, actor, callback);
					}))
				{
					waitForAtlas = true;
				}
				break;
			case _BlockTypes.NestedActorAssets:
				_ReadNestedActorAssets(actor, block.reader);
				break;
		}
	}
	if(!waitForAtlas)
	{
		_LoadNestedAssets(loader, actor, callback);
	}
}

function _ReadActorComponent(reader, component)
{
	component._Name = reader.readString("name");
	component._ParentIdx = reader.readId("parentId");
	return component;
}

function _ReadCustomProperty(reader, component, type)
{
	_ReadActorComponent(reader, component);

	switch(type)
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

function _ReadCollider(reader, component)
{
	_ReadActorNode(reader, component);
	component._IsCollisionEnabled = reader.readBool("isCollisionEnabled");
	return component;
}

function _ReadRectangleCollider(reader, component)
{
	_ReadCollider(reader, component);

	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");

	return component;
}

function _ReadTriangleCollider(reader, component)
{
	_ReadCollider(reader, component);

	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");

	return component;
}

function _ReadCircleCollider(reader, component)
{
	_ReadCollider(reader, component);

	component._Radius = reader.readFloat32("radius");

	return component;
}

function _ReadPolygonCollider(reader, component)
{
	_ReadCollider(reader, component);

	const numVertices = reader.readUint32("cc");
	component._ContourVertices = new Float32Array(numVertices * 2);
	reader.readFloat32Array(component._ContourVertices, "countour");

	return component;
}

function _ReadLineCollider(reader, component)
{
	_ReadCollider(reader, component);

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

function _ReadActorNode(reader, component)
{
	_ReadActorComponent(reader, component);

	reader.readFloat32Array(component._Translation, "translation");
	component._Rotation = reader.readFloat32("rotation");
	reader.readFloat32Array(component._Scale, "scale");
	component._Opacity = reader.readFloat32("opacity");
	component._IsCollapsedVisibility = reader.readBool("isCollapsedVisibility");

	reader.openArray("Clips");
	const clipCount = reader.readUint8Length();
	if(clipCount)
	{
		component._Clips = [];
		for(let i = 0; i < clipCount; i++)
		{
			component._Clips.push(reader.readId("clipId"));
		}
	}
	reader.closeArray();
	return component;
}

function _ReadActorNodeSolo(reader, component)
{
	_ReadActorNode(reader, component);
	component._ActiveChildIndex = reader.readUint32("activeChild");
	return component;
}

function _ReadActorBone(reader, component)
{
	_ReadActorNode(reader, component);
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
	component._InTargetIdx = reader.readId("inTargetId");
	component._OutTargetIdx = reader.readId("outTargetId");

	return component;
}

function _ReadActorRootBone(reader, component)
{
	_ReadActorNode(reader, component);

	return component;
}

function _ReadActorIKTarget(version, reader, component)
{
	_ReadActorNode(reader, component);

	component._Strength = reader.readFloat32();
	component._InvertDirection = reader.readUint8() === 1;

	let numInfluencedBones = reader.readUint8();
	if(numInfluencedBones > 0)
	{
		component._InfluencedBones = [];

		for(let i = 0; i < numInfluencedBones; i++)
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

	component._TargetIdx = reader.readId("targetId");
}

function _ReadActorIKConstraint(reader, component)
{
	_ReadActorTargetedConstraint(reader, component);

	component._InvertDirection = reader.readBool("isInverted");

	reader.openArray("InfluencedBones");
	const numInfluencedBones = reader.readUint8Length();
	if(numInfluencedBones > 0)
	{
		component._InfluencedBones = [];

		for(let i = 0; i < numInfluencedBones; i++)
		{
			component._InfluencedBones.push(reader.readId(""));// No need for a label here, since we're just clearing elements from the array.
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

	if((component._Copy = reader.readBool("copy")))
	{
		component._Scale = reader.readFloat32("scale");
	}
	if((component._EnableMin = reader.readBool("enableMin")))
	{
		component._Min = reader.readFloat32("min");
	}
	if((component._EnableMax = reader.readBool("enableMax")))
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
	if((component._CopyX = reader.readBool("copyX")))
	{
		component._ScaleX = reader.readFloat32("scaleX");
	}
	if((component._EnableMinX = reader.readBool("copyY")))
	{
		component._MinX = reader.readFloat32("scaleY");
	}
	if((component._EnableMaxX = reader.readBool("enableMaxX")))
	{
		component._MaxX = reader.readFloat32("maxX");
	}

	// Y Axis
	if((component._CopyY = reader.readBool("copyY")))
	{
		component._ScaleY = reader.readFloat32("scaleY");
	}
	if((component._EnableMinY = reader.readBool("enableMinY")))
	{
		component._MinY = reader.readFloat32("minY");
	}
	if((component._EnableMaxY = reader.readBool("enableMaxY")))
	{
		component._MaxY = reader.readFloat32("maxY");
	}

	component._Offset = reader.readBool("offset");
	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");
	component._MinMaxSpace = reader.readUint8("minMaxSpaceId");

	return component;
}

function _ReadActorShape(reader, component)
{
	_ReadActorNode(reader, component);
	component._IsHidden = !reader.readBool("isVisible");
	/*component._BlendMode =*/ reader.readUint8("blendMode");
	component._DrawOrder = reader.readUint16("drawOrder");

	return component;
}

function _ReadProceduralPath(reader, component)
{
	_ReadActorNode(reader, component);
	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");
	return component;
}

function _ReadActorRectangle(reader, component)
{
	_ReadProceduralPath(reader, component);
	component._CornerRadius = reader.readFloat32("cornerRadius");
	return component;
}

function _ReadActorEllipse(reader, component)
{
	_ReadProceduralPath(reader, component);
	return component;
}

function _ReadColorFill(reader, component)
{
	_ReadActorComponent(reader, component);

	reader.readFloat32Array(component._Color, "color");
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadColorStroke(reader, component)
{
	_ReadActorComponent(reader, component);

	reader.readFloat32Array(component._Color, "color");
	component._Width = reader.readFloat32("width");

	return component;
}

function _ReadGradient(reader, component)
{
	const numStops = reader.readUint8("numColorStops");
	const stops = new Float32Array(numStops*5);
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
	_ReadActorComponent(reader, component);

	_ReadGradient(reader, component);
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadGradientStroke(reader, component)
{
	_ReadActorComponent(reader, component);

	_ReadGradient(reader, component);
	component._Width = reader.readFloat32("width");

	return component;
}

function _ReadRadialGradientFill(reader, component)
{
	_ReadActorComponent(reader, component);

	_ReadRadialGradient(reader, component);
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadRadialGradientStroke(reader, component)
{
	_ReadActorComponent(reader, component);

	_ReadRadialGradient(reader, component);
	component._Width = reader.readFloat32("width");

	return component;
}

function _ReadActorPath(reader, component)
{
	_ReadActorNode(reader, component);
	component._IsHidden = !reader.readBool("isVisible");
	component._IsClosed = reader.readBool("isClosed");

	reader.openArray("Points");
	const pointCount = reader.readUint16Length();
	const points = new Array(pointCount);
	for(let i = 0; i < pointCount; i++)
	{
		reader.openObject("Point");
		const type = reader.readUint8("pointType");
		let point = null;
		switch(type)
		{
			case PointType.Straight:
			{
				point = new StraightPathPoint();
				reader.readFloat32Array(point._Translation, "translation");
				point._Radius = reader.readFloat32("radius");
				break;
			}
			default:
			{
				point = new CubicPathPoint();
				reader.readFloat32Array(point._Translation, "translation");
				reader.readFloat32Array(point._In, "rigIn");
				reader.readFloat32Array(point._Out, "rigOut");
				break;
			}
		}
		reader.closeObject();
		if(!point)
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

function _ReadActorImage(reader, component)
{
	_ReadActorNode(reader, component);
	const isVisible = reader.readBool("isVisible");
	if(isVisible)
	{
		component._BlendMode = reader.readUint8("blendMode");
		component._DrawOrder = reader.readUint16("drawOrder");
		component._AtlasIndex = reader.readUint8("atlas");

		reader.openArray("ConnectedBones");
		const numConnectedBones = reader.readUint8Length();
		if(numConnectedBones > 0)
		{
			component._ConnectedBones = [];
			for(let i = 0; i < numConnectedBones; i++)
			{
				reader.openObject("bone");
				const bind = mat2d.create();
				const componentIndex = reader.readId("id");
				reader.readFloat32Array(bind, "bind");
				reader.closeObject();

				component._ConnectedBones.push({
					componentIndex:componentIndex,
					bind:bind,
					ibind:mat2d.invert(mat2d.create(), bind)
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

		const numVertices = reader.readUint32("numVertices");
		const vertexStride = numConnectedBones > 0 ? 12 : 4;
		
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

function _ReadActorImageSequence(reader, component)
{
	_ReadActorImage(reader, component);

	// See if it was visible to begin with.
	if(component._AtlasIndex != -1)
	{
		reader.openArray("FrameAssets");
		const frameAssetCount = reader.readUint16Length();
		component._SequenceFrames = [];
		const uvs = new Float32Array(component._NumVertices*2*frameAssetCount);
		const uvStride = component._NumVertices*2;
		component._SequenceUVs = uvs;
		const firstFrame = {
			atlas:component._AtlasIndex,
			offset:0
		};

		component._SequenceFrames.push(firstFrame);

		let readIdx = 2;
		let writeIdx = 0;
		for(let i = 0; i < component._NumVertices; i++)
		{
			uvs[writeIdx++] = component._Vertices[readIdx];
			uvs[writeIdx++] = component._Vertices[readIdx+1];
			readIdx += component._VertexStride;
		}

		let offset = uvStride;
		for(let i = 1; i < frameAssetCount; i++)
		{
			reader.openObject("frameAsset");
			let frame = {
				atlas:reader.readUint8("atlasId"),
				offset:offset*4
			};

			component._SequenceFrames.push(frame);
			reader.readFloat32ArrayOffset(uvs, uvStride, offset, "frameUV");
			reader.closeObject();

			offset += uvStride;
		}
		reader.closeArray();
	}

	return component;
}

function _ReadNestedActor(reader, component, nestedActorAssets)
{
	_ReadActorNode(reader, component);
	let isVisible = reader.readUint8();
	if(isVisible)
	{
		// Draw order
		component._DrawOrder = reader.readUint16();
		let assetIndex = reader.readUint16();
		if(assetIndex < nestedActorAssets.length)
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
		if(url.constructor === String)
		{
			let req = new XMLHttpRequest();
			req.open("GET", url, true);
			req.responseType = "blob";
			req.onload = function()
			{
				let fileReader = new FileReader();
				fileReader.onload = function() 
				{
					_ReadShot(loader, this.result, callback);
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
				_ReadShot(loader, this.result, callback);
			};
			fileReader.readAsArrayBuffer(url);
		}
	}
}