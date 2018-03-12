import AnimatedProperty from "./AnimatedProperty.js";
import ActorBone from "./ActorBone.js";

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
							value = fromFrame.interpolate(time, toFrame);
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
				}

				if(markDirty)
				{
					component.markTransformDirty();
				}
			}
		}
	}
}