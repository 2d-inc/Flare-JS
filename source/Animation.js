import AnimatedProperty from "./AnimatedProperty.js";
import ActorBone from "./ActorBone.js";
import { StraightPathPoint } from "./PathPoint.js";
const AnimatedPropertyTypes = AnimatedProperty.Types;

function keyFrameLocation(seconds, list, start, end)
{
	let mid;
	let element;
	while (start <= end) 
	{
		mid = ((start + end) >> 1);
		element = list[mid]._Time;
		if (element < seconds) 
		{
			start = mid + 1;
		}
		else if (element > seconds) 
		{
			end = mid - 1;
		}
		else 
		{
			return mid;
		}
	}
	return start;
}

export default class Animation
{
	constructor(artboard)
	{
		this._Artboard = artboard;
		this._Components = [];
		this._TriggerComponents = [];

		this._Name = null;
		this._FPS = 60;
		this._Duration = 0;
		this._Loop = false;
	}

	get name()
	{
		return this._Name;
	}

	get loop()
	{
		return this._Loop;
	}

	get duration()
	{
		return this._Duration;
	}

	triggerEvents(artboardComponents, fromTime, toTime, triggered)
	{
		const keyedTriggerComponents = this._TriggerComponents;
		for (let i = 0; i < keyedTriggerComponents.length; i++)
		{
			const keyedComponent = keyedTriggerComponents[i];
			const properties = keyedComponent._Properties;
			for (let j = 0; j < properties.length; j++)
			{
				const property = properties[j];
				switch (property._Type)
				{
					case AnimatedPropertyTypes.Trigger:
						{
							const keyFrames = property._KeyFrames;

							const kfl = keyFrames.length;
							if (kfl === 0)
							{
								continue;
							}

							const idx = keyFrameLocation(toTime, keyFrames, 0, keyFrames.length - 1);
							if (idx === 0)
							{
								if (keyFrames.length > 0 && keyFrames[0]._Time === toTime)
								{
									const component = artboardComponents[keyedComponent._ComponentIndex];
									triggered.push({
										name: component._Name,
										component: component,
										propertyType: property._Type,
										keyFrameTime: toTime,
										elapsed: 0
									});
								}
							}
							else
							{
								for (let k = idx - 1; k >= 0; k--)
								{
									const frame = keyFrames[k];
									if (frame._Time > fromTime)
									{
										const component = artboardComponents[keyedComponent._ComponentIndex];
										triggered.push({
											name: component._Name,
											component: component,
											propertyType: property._Type,
											keyFrameTime: frame._Time,
											elapsed: toTime - frame._Time
										});
									}
									else
									{
										break;
									}
								}
							}
							break;
						}
					default:
						break;
				}
			}
		}
	}

	apply(time, artboard, mix)
	{
		const components = this._Components;
		const imix = 1.0 - mix;
		const artboardComponents = artboard._Components;
		for (let i = 0; i < components.length; i++)
		{
			const animatedComponent = components[i];
			const component = artboardComponents[animatedComponent._ComponentIndex];
			if (!component)
			{
				continue;
			}

			const properties = animatedComponent._Properties;
			for (let j = 0; j < properties.length; j++)
			{
				const property = properties[j];
				const keyFrames = property._KeyFrames;

				const kfl = keyFrames.length;
				if (kfl === 0)
				{
					continue;
				}

				const idx = keyFrameLocation(time, keyFrames, 0, keyFrames.length - 1);
				let value = 0.0;

				if (idx === 0)
				{
					value = keyFrames[0]._Value;
				}
				else
				{
					if (idx < keyFrames.length)
					{
						const fromFrame = keyFrames[idx - 1];
						const toFrame = keyFrames[idx];
						if (time == toFrame._Time)
						{
							value = toFrame._Value;
						}
						else
						{
							let mix = (time - fromFrame._Time) / (toFrame._Time - fromFrame._Time);
							const interpolator = fromFrame._Interpolator;

							if (interpolator)
							{
								mix = interpolator.getEasedMix(mix);
							}
							value = fromFrame.interpolate(mix, toFrame);
						}
					}
					else
					{
						const kf = keyFrames[idx - 1];
						value = kf._Value;
					}
				}

				let markDirty = false;
				switch (property._Type)
				{
					case AnimatedPropertyTypes.PosX:
						if (mix === 1.0)
						{
							component._Translation[0] = value;
						}
						else
						{
							component._Translation[0] = component._Translation[0] * imix + value * mix;
						}

						markDirty = true;
						break;
					case AnimatedPropertyTypes.PosY:
						if (mix === 1.0)
						{
							component._Translation[1] = value;
						}
						else
						{
							component._Translation[1] = component._Translation[1] * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.ScaleX:
						if (mix === 1.0)
						{
							component._Scale[0] = value;
						}
						else
						{
							component._Scale[0] = component._Scale[0] * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.ScaleY:
						if (mix === 1.0)
						{
							component._Scale[1] = value;
						}
						else
						{
							component._Scale[1] = component._Scale[1] * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.Rotation:
						if (mix === 1.0)
						{
							component._Rotation = value;
						}
						else
						{
							component._Rotation = component._Rotation * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.Opacity:
						if (mix === 1.0)
						{
							component._Opacity = value;
						}
						else
						{
							component._Opacity = component._Opacity * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.ConstraintStrength:
						if (mix === 1.0)
						{
							component.strength = value;
						}
						else
						{
							component.strength = component._Strength * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.DrawOrder:
						if (artboard._LastSetDrawOrder != value)
						{
							artboard._LastSetDrawOrder = value;
							for (let i = 0; i < value.length; i++)
							{
								const v = value[i];
								artboardComponents[v.componentIdx]._DrawOrder = v.value;
							}
							artboard._IsImageSortDirty = true;
						}
						break;
					case AnimatedPropertyTypes.Length:
						markDirty = true;
						if (mix === 1.0)
						{
							component._Length = value;
						}
						else
						{
							component._Length = component._Length * imix + value * mix;
						}

						for (let l = 0; l < component._Children.length; l++)
						{
							const chd = component._Children[l];
							if (chd.constructor === ActorBone)
							{
								chd._Translation[0] = component._Length;
								chd._IsDirty = true;
							}
						}
						break;
					case AnimatedPropertyTypes.ImageVertices:
						{
							const nv = component._NumVertices;
							const to = component.deformVertices;
							let fidx = 0;
							if (mix === 1.0)
							{
								for (let l = 0; l < nv; l++)
								{
									const p = to[l];
									p[0] = value[fidx++];
									p[1] = value[fidx++];
								}
							}
							else
							{
								for (let l = 0; l < nv; l++)
								{
									const p = to[l];
									p[0] = p[0] * imix + value[fidx++] * mix;
									p[1] = p[1] * imix + value[fidx++] * mix;
								}
							}
							component.invalidateDrawable();
							break;
						}
					case AnimatedPropertyTypes.StringProperty:
						component._Value = value;
						break;
					case AnimatedPropertyTypes.IntProperty:
						if (mix === 1.0)
						{
							component._Value = value;
						}
						else
						{
							component._Value = Math.round(component._Value * imix + value * mix);
						}
						break;
					case AnimatedPropertyTypes.FloatProperty:
						if (mix === 1.0)
						{
							component._Value = value;
						}
						else
						{
							component._Value = component._Value * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.BooleanProperty:
						component._Value = value;
						break;
					case AnimatedPropertyTypes.IsCollisionEnabled:
						component._IsCollisionEnabled = value;
						break;
					case AnimatedPropertyTypes.Sequence:
						if (component._SequenceFrames)
						{
							let frameIndex = Math.floor(value) % component._SequenceFrames.length;
							if (frameIndex < 0)
							{
								frameIndex += component._SequenceFrames.length;
							}
							component._SequenceFrame = frameIndex;
						}
						break;

					case AnimatedPropertyTypes.ActiveChildIndex:
						component.activeChildIndex = value;
						markDirty = true;
						break;

					case AnimatedPropertyTypes.PathVertices:
						{
							component.invalidateDrawable();
							let readIdx = 0;
							if (mix !== 1.0)
							{
								for (const point of component._Points)
								{
									point._Translation[0] = point._Translation[0] * imix + value[readIdx++] * mix;
									point._Translation[1] = point._Translation[1] * imix + value[readIdx++] * mix;
									if (point.constructor === StraightPathPoint)
									{
										point._Radius = point._Radius * imix + value[readIdx++] * mix;
									}
									else
									{
										point._In[0] = point._In[0] * imix + value[readIdx++] * mix;
										point._In[1] = point._In[1] * imix + value[readIdx++] * mix;
										point._Out[0] = point._Out[0] * imix + value[readIdx++] * mix;
										point._Out[1] = point._Out[1] * imix + value[readIdx++] * mix;
									}
								}
							}
							else
							{
								for (const point of component._Points)
								{
									point._Translation[0] = value[readIdx++];
									point._Translation[1] = value[readIdx++];
									if (point.constructor === StraightPathPoint)
									{
										point._Radius = value[readIdx++];
									}
									else
									{
										point._In[0] = value[readIdx++];
										point._In[1] = value[readIdx++];
										point._Out[0] = value[readIdx++];
										point._Out[1] = value[readIdx++];
									}
								}
							}
							break;
						}
					case AnimatedPropertyTypes.ShapeWidth:
					case AnimatedPropertyTypes.StrokeWidth:
						component.width = mix === 1.0 ? value : component._Width * imix + value * mix;
						break;
					case AnimatedPropertyTypes.StrokeStart:
						component.trimStart = mix === 1.0 ? value : component.trimStart * imix + value * mix;
						break;
					case AnimatedPropertyTypes.StrokeEnd:
						component.trimEnd = mix === 1.0 ? value : component.trimEnd * imix + value * mix;
						break;
					case AnimatedPropertyTypes.StrokeOffset:
						component.trimOffset = mix === 1.0 ? value : component.trimOffset * imix + value * mix;
						break;
					case AnimatedPropertyTypes.FillOpacity:
					case AnimatedPropertyTypes.StrokeOpacity:
						if (mix === 1.0)
						{
							component._Opacity = value;
						}
						else
						{
							component._Opacity = component._Opacity * imix + value * mix;
						}
						component.markDirty();
						break;
					case AnimatedPropertyTypes.FillColor:
					case AnimatedPropertyTypes.StrokeColor:
						{
							const color = component._Color;
							if (mix === 1.0)
							{
								color[0] = value[0];
								color[1] = value[1];
								color[2] = value[2];
								color[3] = value[3];
							}
							else
							{
								color[0] = color[0] * imix + value[0] * mix;
								color[1] = color[1] * imix + value[1] * mix;
								color[2] = color[2] * imix + value[2] * mix;
								color[3] = color[3] * imix + value[3] * mix;
							}
							component.markDirty();
							break;
						}
					case AnimatedPropertyTypes.FillGradient:
					case AnimatedPropertyTypes.StrokeGradient:
						{
							if (mix === 1.0)
							{
								let ridx = 0;
								component._Start[0] = value[ridx++];
								component._Start[1] = value[ridx++];
								component._End[0] = value[ridx++];
								component._End[1] = value[ridx++];

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length)
								{
									cs[wi++] = value[ridx++];
								}
							}
							else
							{
								let ridx = 0;
								component._Start[0] = component._Start[0] * imix + value[ridx++] * mix;
								component._Start[1] = component._Start[1] * imix + value[ridx++] * mix;
								component._End[0] = component._End[0] * imix + value[ridx++] * mix;
								component._End[1] = component._End[1] * imix + value[ridx++] * mix;

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length)
								{
									cs[wi] = cs[wi] * imix + value[ridx++];
									wi++;
								}
							}
							component.markDirty();
							break;
						}
					case AnimatedPropertyTypes.FillRadial:
					case AnimatedPropertyTypes.StrokeRadial:
						{
							if (mix === 1.0)
							{
								let ridx = 0;
								component._SecondaryRadiusScale = value[ridx++];
								component._Start[0] = value[ridx++];
								component._Start[1] = value[ridx++];
								component._End[0] = value[ridx++];
								component._End[1] = value[ridx++];

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length)
								{
									cs[wi++] = value[ridx++];
								}
							}
							else
							{
								let ridx = 0;
								component._SecondaryRadiusScale = component._SecondaryRadiusScale * imix + value[ridx++] * mix;
								component._Start[0] = component._Start[0] * imix + value[ridx++] * mix;
								component._Start[1] = component._Start[1] * imix + value[ridx++] * mix;
								component._End[0] = component._End[0] * imix + value[ridx++] * mix;
								component._End[1] = component._End[1] * imix + value[ridx++] * mix;

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length)
								{
									cs[wi] = cs[wi] * imix + value[ridx++];
									wi++;
								}
							}
							component.markDirty();
							break;
						}
					case AnimatedPropertyTypes.ShapeHeight:
						component.height = mix === 1.0 ? value : component._Height * imix + value * mix;
						break;
					case AnimatedPropertyTypes.CornerRadius:
						component.cornerRadius = mix === 1.0 ? value : component._CornerRadius * imix + value * mix;
						break;
					case AnimatedPropertyTypes.InnerRadius:
						component.innerRadius = mix === 1.0 ? value : component._InnerRadius * imix + value * mix;
						break;

				}

				if (markDirty)
				{
					component.markTransformDirty();
				}
			}
		}
	}
}