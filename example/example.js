import { mat2d } from 'gl-matrix'
const Flare = require('../source/Flare.js')

const _ViewCenter = [500.0, 500.0];
const _Scale = 0.5;

function FlareExample(canvas)
{
	this._Graphics = new Flare.Graphics(canvas);
	this._LastAdvanceTime = Date.now();
	this._ViewTransform = mat2d.create();
	this._AnimationInstance = null;
	this._Animation = null;
	this._SoloSkaterAnimation = null;

	const _This = this;

	_ScheduleAdvance(_This);
	_Advance(_This);
}

function _Advance(_This)
{
	_ScheduleAdvance(_This);

	_This.setSize(self.innerWidth, self.innerHeight);

	const now = Date.now();
	const elapsed = (now - _This._LastAdvanceTime)/1000.0;
	_This._LastAdvanceTime = now;

	const actor = _This._ActorInstance;

	if(_This._AnimationInstance)
	{
		const ai = _This._AnimationInstance;
		ai.time = ai.time + elapsed;
		ai.apply(_This._ActorInstance, 1.0);
	}

	if(actor)
	{
		const graphics = _This._Graphics;

		const w = graphics.viewportWidth;
		const h = graphics.viewportHeight;

		const vt = _This._ViewTransform;
		vt[0] = _Scale;
		vt[3] = _Scale;
		vt[4] = (-_ViewCenter[0] * _Scale + w/2);
		vt[5] = (-_ViewCenter[1] * _Scale + h/2);

		actor.advance(elapsed);
	}

	_Draw(_This, _This._Graphics);
}

let count = 0

setInterval(() => {
	console.log(count)

	count = 0
}, 1000)

function _Draw(viewer, graphics)
{
	if(!viewer._Actor)
	{
		return;
	}

	count++

	graphics.clear([0.3628, 0.3628, 0.3628, 1.0]);
	graphics.setView(viewer._ViewTransform);
	viewer._ActorInstance.draw(graphics);
}

function _ScheduleAdvance(viewer)
{
	{
		self.requestAnimationFrame(function()
			{
				_Advance(viewer);
			});
	}
}

FlareExample.prototype.load = function(url, callback)
{
	const loader = new Flare.ActorLoader();
	const _This = this;
	loader.load(url, function(actor)
	{
		if(!actor || actor.error)
		{
			callback(!actor ? null : actor.error);
		}
		else
		{
			_This.setActor(actor);
			callback();
		}
	});
};

FlareExample.prototype.setActor = function(actor)
{
	if(this._Actor)
	{
		this._Actor.dispose(this._Graphics);
	}
	if(this._ActorInstance)
	{
		this._ActorInstance.dispose(this._Graphics);
	}
	actor.initialize(this._Graphics);

	const actorInstance = actor.makeInstance();
	actorInstance.initialize(this._Graphics);

	this._Actor = actor;
	this._ActorInstance = actorInstance;

	if(actorInstance)
	{
		actorInstance.initialize(this._Graphics);
		if(actorInstance._Animations.length)
		{
			this._Animation = actorInstance._Animations[0];
			this._AnimationInstance = new Flare.AnimationInstance(this._Animation._Actor, this._Animation);

			if(!this._AnimationInstance)
			{
				console.log("NO ANIMATION IN HERE!?");
				return;
			}

		}
	}
};

FlareExample.prototype.setSize = function(width, height)
{
	this._Graphics.setSize(width, height);
};

let flareExample;

self.addEventListener("message", (event) => {
	switch (event.data.type)
		{
			case "INIT":
				/*
				 * Window isn't available in WW so we're getting this info
				 * passed from the main thread and then mocking it. IRL it
				 * would make sense for the app to have no refs to window.
				 */
				self.innerWidth = event.data.innerWidth
				self.innerHeight = event.data.innerHeight
				flareExample = new FlareExample(event.data.canvas);
				break;

			case "LOAD":
				flareExample.load(event.data.url, function (error) {
						if (error) {
							console.log("failed to load actor file...", error);
						}
				});
				break;

			case "SET_SIZE":
				flareExample.setSize(event.data.width, event.data.height)
		}
});