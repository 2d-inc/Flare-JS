import Dispatcher from "./Dispatcher.js";

export default class AnimationInstance extends Dispatcher
{
	constructor(actor, animation)
	{
		super();
		this._Actor = actor;
		this._Animation = animation;
		this._Time = 0;

		this._Min = 0;
		this._Max = animation._Duration;
		this._Loop = animation._Loop;
		this._Range = this._Max - this._Min;
	}

	get loop()
	{
		return this._Loop;
	}
	
	set loop(value)
	{
		this._Loop = value;
	}

	get time()
	{
		return this._Time;
	}

	get isOver()
	{
		return this._Time >= this._Max;
	}

	set time(newTime)
	{
		var delta = newTime - this._Time;
		var time = this._Time + (delta % this._Range);

		if(time < this._Min)
		{
			if(this._Loop)
			{
				time = this._Max - (this._Min - time);	
			}
			else
			{
				time = this._Min;
			}
		}
		else if(time > this._Max)
		{
			if(this._Loop)
			{
				time = this._Min + (time - this._Max);
			}
			else
			{
				time = this._Max;
			}
		}
		this._Time = time;
	}

	reset()
	{
		this._Time = 0.0;
	}

	advance(seconds)
	{
		var triggeredEvents = [];
		var actorComponents = this._Actor._Components;
		var time = this._Time;
		time += seconds%this._Range;
		if(time < this._Min)
		{
			if(this._Loop)
			{
				this._Animation.triggerEvents(actorComponents, time, this._Time, triggeredEvents);
				time = this._Max - (this._Min - time);
				this._Animation.triggerEvents(actorComponents, time, this._Max, triggeredEvents);
			}
			else
			{
				time = this._Min;
				if(this._Time != time)
				{
					this._Animation.triggerEvents(actorComponents, this._Min, this._Time, triggeredEvents);
				}
			}
		}
		else if(time > this._Max)
		{
			if(this._Loop)
			{
				this._Animation.triggerEvents(actorComponents, time, this._Time, triggeredEvents);
				time = this._Min + (time - this._Max);
				this._Animation.triggerEvents(actorComponents, this._Min-0.001, time, triggeredEvents);
			}
			else
			{
				time = this._Max;
				if(this._Time != time)
				{
					this._Animation.triggerEvents(actorComponents, this._Time, this._Max, triggeredEvents);
				}
			}
		}
		else if(time > this._Time)
		{
			this._Animation.triggerEvents(actorComponents, this._Time, time, triggeredEvents);
		}
		else
		{
			this._Animation.triggerEvents(actorComponents, time, this._Time, triggeredEvents);
		}

		for(var i = 0; i < triggeredEvents.length; i++)
		{
			var event = triggeredEvents[i];
			this.dispatch("animationEvent", event);
			this._Actor.dispatch("animationEvent", event);
		}
		this._Time = time;

		return triggeredEvents;
	}

	apply(actor, mix)
	{
		this._Animation.apply(this._Time, actor, mix);
	}
}