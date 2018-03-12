export default class Dispatcher
{
	constructor()
	{
		this.events = {};
	}

	addEventListener(event, callback)
	{
		let evt = this.events[event];
		if(!evt)
		{
			this.events[event] = evt = [];
		}
		if(evt.indexOf(callback) !== -1)
		{
			return;
		}
		evt.push(callback);
	}

	removeEventListener(event, callback)
	{
		let evt = this.events[event];
		if(!evt)
		{
			return true;
		}
		for(let i = 0; i < evt.length; i++)
		{
			if(evt[i] === callback)
			{
				evt.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	dispatch(event, data, extraContext)
	{
		let evt = this.events[event];
		if(evt)
		{
			for(let i = 0; i < evt.length; i++)
			{
				evt[i].call(this, data, extraContext);
			}
		}
	}
}