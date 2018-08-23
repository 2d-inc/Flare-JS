import AnimatedProperty from "./AnimatedProperty.js";
import ActorBone from "./ActorBone.js";
import {StraightPathPoint, CubicPathPoint, PointType} from "./PathPoint.js";

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
	constructor(actor)
	{
		this._Actor = actor;
		this._Components = [];
		this._TriggerComponents = [];
		this._DisplayStart = 0;
		this._DisplayEnd = 0;

		this._Name = null;
		this._FPS = 60;
		this._Duration = 0;
		this._Loop = false;
	}

	get duration()
	{
		return this._Duration;
	}

	triggerEvents(actorComponents, fromTime, toTime, triggered)
	{
		let keyedTriggerComponents = this._TriggerComponents;
		for(let i = 0; i < keyedTriggerComponents.length; i++)
		{
			let keyedComponent = keyedTriggerComponents[i];
			let properties = keyedComponent._Properties;
			for(let j = 0; j < properties.length; j++)
			{
				let property = properties[j];
				switch(property._Type)
				{
					case AnimatedProperty.Properties.Trigger:
					{
						let keyFrames = property._KeyFrames;

						let kfl = keyFrames.length;
						if(kfl === 0)
						{
							continue;
						}

						let idx = keyFrameLocation(toTime, keyFrames, 0, keyFrames.length-1);
						if(idx === 0)
						{
							if(keyFrames.length > 0 && keyFrames[0]._Time === toTime)
							{
								let component = actorComponents[keyedComponent._ComponentIndex];
								triggered.push({
									name:component._Name,
									component:component,
									propertyType:property._Type,
									keyFrameTime:toTime,
									elapsed:0
								});
							}
						}
						else
						{
							for(let k = idx-1; k >= 0; k--)
							{
								let frame = keyFrames[k];	
								if(frame._Time > fromTime)
								{
									let component = actorComponents[keyedComponent._ComponentIndex];
									triggered.push({
										name:component._Name,
										component:component,
										propertyType:property._Type,
										keyFrameTime:frame._Time,
										elapsed:toTime-frame._Time
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

	apply(time, actor, mix)
	{
		let components = this._Components;
		let imix = 1.0-mix;
		let actorComponents = actor._Components;
		for(let i = 0; i < components.length; i++)
		{
			let animatedComponent = components[i];
			let component = actorComponents[animatedComponent._ComponentIndex];
			if(!component)
			{
				continue;
			}

			let properties = animatedComponent._Properties;
			for(let j = 0; j < properties.length; j++)
			{
				let property = properties[j];
				let keyFrames = property._KeyFrames;

				let kfl = keyFrames.length;
				if(kfl === 0)
				{
					continue;
				}

				let idx = keyFrameLocation(time, keyFrames, 0, keyFrames.length-1);
				let value = 0.0;

				if(idx === 0)
				{
					value = keyFrames[0]._Value;
				}
				else
				{
					if(idx < keyFrames.length)
					{
						let fromFrame = keyFrames[idx-1];
						let toFrame = keyFrames[idx];
						if(time == toFrame._Time)
						{
							value = toFrame._Value;
						}
						else
						{
							let mix = (time - fromFrame._Time)/(toFrame._Time-fromFrame._Time);
							let interpolator = fromFrame._Interpolator;
							
							if(interpolator)
							{
								mix = interpolator.getEasedMix(mix);
							}
							value = fromFrame.interpolate(mix, toFrame);
						}
					}
					else
					{
						let kf = keyFrames[idx-1];
						value = kf._Value;
					}
				}

				let markDirty = false;
				switch(property._Type)
				{
					case AnimatedProperty.Properties.PosX:
						if(mix === 1.0)
						{
							component._Translation[0] = value;	
						}
						else
						{
							component._Translation[0] = component._Translation[0] * imix + value * mix;
						}
						
						markDirty = true;
						break;
					case AnimatedProperty.Properties.PosY:
						if(mix === 1.0)
						{
							component._Translation[1] = value;
						}
						else
						{
							component._Translation[1] = component._Translation[1] * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedProperty.Properties.ScaleX:
						if(mix === 1.0)
						{
							component._Scale[0] = value;
						}
						else
						{
							component._Scale[0] = value * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedProperty.Properties.ScaleY:
						if(mix === 1.0)
						{
							component._Scale[1] = value;
						}
						else
						{
							component._Scale[1] = value * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedProperty.Properties.Rotation:
						if(mix === 1.0)
						{
							component._Rotation = value;
						}
						else
						{
							component._Rotation = component._Rotation * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedProperty.Properties.Opacity:
						if(mix === 1.0)
						{
							component._Opacity = value;
						}
						else
						{
							component._Opacity = component._Opacity * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedProperty.Properties.ConstraintStrength:
						if(mix === 1.0)
						{
							component.strength = value;
						}
						else
						{
							component.strength = component._Strength * imix + value * mix;	
						}
						break;
					case AnimatedProperty.Properties.DrawOrder:
						if(actor._LastSetDrawOrder != value)
						{
							actor._LastSetDrawOrder = value;
							for(let i = 0; i < value.length; i++)
							{
								let v = value[i];
								actorComponents[v.componentIdx]._DrawOrder = v.value;
							}
							actor._IsImageSortDirty = true;
						}
						break;
					case AnimatedProperty.Properties.Length:
						markDirty = true;
						if(mix === 1.0)
						{
							component._Length = value;
						}
						else
						{
							component._Length = component._Length * imix + value * mix;
						}
						
						for(let l = 0; l < component._Children.length; l++)
						{
							let chd = component._Children[l];
							if(chd.constructor === ActorBone)
							{
								chd._Translation[0] = component._Length;
								chd._IsDirty = true;
							}
						}
						break;
					case AnimatedProperty.Properties.VertexDeform:
					{
						component._VerticesDirty = true;
						let nv = component._NumVertices;
						let to = component._AnimationDeformedVertices;
						let tidx = 0;
						let fidx = 0;
						if(mix === 1.0)
						{
							for(let l = 0; l < nv; l++)
							{
								to[tidx] = value[fidx++];
								to[tidx+1] = value[fidx++];
								tidx+=2;
							}
						}
						else
						{
							for(let l = 0; l < nv; l++)
							{
								to[tidx] = to[tidx] * imix + value[fidx++] * mix;
								to[tidx+1] = to[tidx+1] * imix + value[fidx++] * mix;
								tidx+=2;
							}
						}
						break;
					}
					case AnimatedProperty.Properties.StringProperty:
						component._Value = value;
						break;
					case AnimatedProperty.Properties.IntProperty:
						if(mix === 1.0)
						{
							component._Value = value;	
						}
						else
						{
							component._Value = Math.round(component._Value * imix + value * mix);
						}
						break;
					case AnimatedProperty.Properties.FloatProperty:
						if(mix === 1.0)
						{
							component._Value = value;	
						}
						else
						{
							component._Value = component._Value * imix + value * mix;
						}
						break;
					case AnimatedProperty.Properties.BooleanProperty:
						component._Value = value;
						break;
					case AnimatedProperty.Properties.IsCollisionEnabled:
						component._IsCollisionEnabled = value;
						break;
					case AnimatedProperty.Properties.Sequence:
						if(component._SequenceFrames)
						{
							var frameIndex = Math.floor(value)%component._SequenceFrames.length;
							if(frameIndex < 0)
							{
								frameIndex += component._SequenceFrames.length;
							}
							component._SequenceFrame = frameIndex;
						}
						break;

					case AnimatedProperty.Properties.ActiveChildIndex:
						component.activeChildIndex = value;
						markDirty = true;
						break;

					case AnimatedProperty.Properties.PathVertices:
					{
						let readIdx = 0;
						if(mix !== 1.0)
						{
							for(let point of component._Points)
							{
								point._Translation[0] = point._Translation[0] * imix + value[readIdx++] * mix;
								point._Translation[1] = point._Translation[1] * imix + value[readIdx++] * mix;
								if(point.constructor === StraightPathPoint)
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
							for(let point of component._Points)
							{
								point._Translation[0] = value[readIdx++];
								point._Translation[1] = value[readIdx++];
								if(point.constructor === StraightPathPoint)
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
					case AnimatedProperty.Properties.StrokeWidth:
						if(mix === 1.0)
						{
							component._Width = value;	
						}
						else
						{
							component._Width = component._Width * imix + value * mix;
						}
						break;
						case AnimatedProperty.Properties.FillOpacity:
					case AnimatedProperty.Properties.StrokeOpacity:
						if(mix === 1.0)
						{
							component._Opacity = value;	
						}
						else
						{
							component._Opacity = component._Opacity * imix + value * mix;
						}
						break;
					case AnimatedProperty.Properties.FillColor:
					case AnimatedProperty.Properties.StrokeColor:
					{
						let color = component._Color;
						if(mix === 1.0)
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
						break;
					}
					case AnimatedProperty.Properties.FillGradient:
					case AnimatedProperty.Properties.StrokeGradient:
					{
						if(mix === 1.0)
						{
							let ridx = 0;
							component._Start[0] = value[ridx++];
							component._Start[1] = value[ridx++];
							component._End[0] = value[ridx++];
							component._End[1] = value[ridx++];

							let cs = component._ColorStops;
							let wi = 0;
							while(ridx < value.length && wi < cs.length)
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

							let cs = component._ColorStops;
							let wi = 0;
							while(ridx < value.length && wi < cs.length)
							{
								cs[wi] = cs[wi] * imix + value[ridx++];
								wi++;
							}
						}
						break;
					}
					case AnimatedProperty.Properties.FillRadial:
					case AnimatedProperty.Properties.StrokeRadial:
					{
						if(mix === 1.0)
						{
							let ridx = 0;
							component._SecondaryRadiusScale = value[ridx++];
							component._Start[0] = value[ridx++];
							component._Start[1] = value[ridx++];
							component._End[0] = value[ridx++];
							component._End[1] = value[ridx++];

							let cs = component._ColorStops;
							let wi = 0;
							while(ridx < value.length && wi < cs.length)
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

							let cs = component._ColorStops;
							let wi = 0;
							while(ridx < value.length && wi < cs.length)
							{
								cs[wi] = cs[wi] * imix + value[ridx++];
								wi++;
							}
						}
						break;
					}
				}

				if(markDirty)
				{
					component.markTransformDirty();
				}
			}
		}
	}
}