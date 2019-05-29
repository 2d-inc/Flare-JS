export default class Dispatcher
{
	constructor()
	{
		this.events = new Map();
		this.removeLater = [];
	}

	addEventListener(event, callback)
	{
		let evt = this.events.get(event);
		if (!evt)
		{
			this.events.set(event, (evt = []));
		}
		if (evt.indexOf(callback) !== -1)
		{
			return;
		}
		evt.push(callback);
	}

	removeEventListener(event, callback)
	{
		if (this.dispatchGuard)
		{
			this.removeLater.push({ event, callback });
			return;
		}
		const evt = this.events.get(event);
		if (!evt)
		{
			return true;
		}
		const index = evt.indexOf(callback);
		if (index !== -1)
		{
			evt.splice(index, 1);
			return true;
		}
		return false;
	}

	dispatch(event, data, extraContext)
	{
		const evt = this.events.get(event);
		if (evt)
		{
			this.dispatchGuard = true;
			for (const e of evt)
			{
				e.call(this, data, extraContext);
			}
			this.dispatchGuard = false;
			if (this.removeLater.length)
			{
				for (const { event, callback } of this.removeLater)
				{
					this.removeEventListener(event, callback);
				}
				this.removeLater.length = 0;
			}
		}
	}
}