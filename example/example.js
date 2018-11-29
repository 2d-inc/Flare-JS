const FlareExample = (function ()
{
	const _ViewCenter = [600.0, 600.0];
	const _Scale = 0.25;
	const _ScreenScale = 1.0;

	const _ScreenMouse = vec2.create();
	const _WorldMouse = vec2.create();

	function FlareExample(canvas, ready)
	{
		this._Graphics = new Flare.Graphics(canvas);
		this._Graphics.initialize("../build/", () =>
		{
			this._LastAdvanceTime = Date.now();
			this._ViewTransform = mat2d.create();
			this._AnimationInstance = null;
			this._Animation = null;
			this._SoloSkaterAnimation = null;

			const _This = this;

			_ScheduleAdvance(_This);
			_Advance(_This);

			document.addEventListener("keydown", function(ev)
			{
				// 68 D
				// 65 A
				// 39 right
				// 37 left
				switch(ev.keyCode)
				{
					case 32: // Enter
						break;
					case 16: // Shift
						break;
					case 68: // 'D'
					case 39: // right
						break;	
					case 65: // 'A'
					case 37: // left
						break;	
					case 87: 
					case 38:
						break;

				}
			});

			ready();
		});
	}

	function _Advance(_This)
	{
		_This.setSize(window.innerWidth, window.innerHeight);

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
		_ScheduleAdvance(_This);
	}

	function _Draw(viewer, graphics)
	{
		if(!viewer._Actor)
		{
			return;
		}

        graphics.clear([0.3628, 0.3628, 0.3628, 1.0]);
		graphics.setView(viewer._ViewTransform);
		viewer._ActorInstance.draw(graphics);
		graphics.flush();
	}

	function _ScheduleAdvance(viewer)
	{
		clearTimeout(viewer._AdvanceTimeout);
		//if(document.hasFocus())
		{
			window.requestAnimationFrame(function()
				{
					_Advance(viewer);
				});	
		}
		/*else
		{
			viewer._AdvanceTimeout = setTimeout(function()
				{
					_Advance(viewer);
				}, _LowFrequencyAdvanceTime);
		}*/
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

	return FlareExample;
}());