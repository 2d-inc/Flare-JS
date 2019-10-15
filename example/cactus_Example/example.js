const FlareExample = (function ()
{
	const _ViewCenter = [600.0, 600.0];
	const _Scale = 0.25;
	const _ScreenScale = 1.0;

	const _ScreenMouse = vec2.create();
	const _WorldMouse = vec2.create();

	/**
	 * @constructs FlareExample
	 * 
	 * @param {Element} canvas - a canvas element object on the html page that's rendering this example.
	 * @param {onReadyCallback} ready - callback that's called after everything's been properly initialized.
	*/
	function FlareExample(canvas, ready)
	{
		/** Build and initialize the Graphics object. */
		this._Graphics = new Flare.Graphics(canvas);
		this._Graphics.initialize("../build/", () =>
		{
			this._LastAdvanceTime = Date.now();
			this._ViewTransform = mat2d.create();
			this._AnimationInstance = null;
			this._Animation = null; 

			this._CanPlay = false;
			this._ChangedAnimation = null; 
			this._SmileTime = 0; 
			this._SoloIdx = 1;
			this._ChangedInstance = null;
			this._SoloNode = null; 

			this._ProgressTracker = null;
			this._MyNode = null;

			this._Song = new Audio();
			this._Song.src = 'huh_sound_cartoon.wav';

			const _This = this;
			
			/** Start the render loop. */
			_ScheduleAdvance(_This);
			_Advance(_This);

			
			/** Call-back. */
			ready();
		});
	}

	/**
	 * Advance the current viewport and, if present, the AnimationInstance and Actor.
	 * 
	 * @param {Object} _This - the current viewer.
	 */
	function _Advance(_This)
	{
		let _animationEvents = [];

		let _currLayerAnim = _This._SmileTime;

		_This.setSize(window.innerWidth, window.innerHeight);

		const now = Date.now();
		const elapsed = (now - _This._LastAdvanceTime)/1000.0;
		_This._LastAdvanceTime = now;

		const actor = _This._ActorInstance;
		
		if (_This._CanPlay === true)
		{
			if (_This._ChangedInstance)
			{
				const ai = _This._ChangedInstance;

				ai.time = _This._SmileTime;

				ai.apply(_This._ActorInstance, 1.0);				
			}
			
		}
		else
		{
			if (_This._AnimationInstance)
			{
				const ai = _This._AnimationInstance;
				/** Compute the new time and apply it */
				ai.time = ai.time + elapsed;

				ai.apply(_This._ActorInstance, 1.0);
			}
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
			/** Advance the actor to its new time. */
			actor.advance(elapsed);
		}
		
		_This._SmileTime += elapsed * 1;		

		if (_This._ChangedAnimation !== null)
		{			
			if (_This._SmileTime > _This._ChangedAnimation.duration)
			{
				_This._CanPlay = false;
				
			}
		}
		
		if (actor)
		{
			if (_This._ProgressTracker)
			{
				_This._ProgressTracker.triggerEvents(actor._Components, _currLayerAnim, _This._SmileTime, _animationEvents);
				
			}
		}

		for (let event in _animationEvents)
		{
			//console.log(_animationEvents[event]);
			switch (_animationEvents[event].name)
			{
				case "Event":
					///play our sound when the event happens
					_This._Song.play();
					break;
			}
		}

		if (_This._MyNode)
		{
			
			for (let props in _This._MyNode._CustomProperties)
			{
				
				switch (_This._MyNode._CustomProperties[props]._Name)
				{

					case "happy_sound":
						///play our sound when the custom property changes
						if (_This._MyNode._CustomProperties[props]._Value === true)
						{
							console.log("hey yay");
						}
						break;

				}

			}
		}

		_Draw(_This, _This._Graphics);
		/** Schedule a new frame. */
		_ScheduleAdvance(_This);
	}

	/**
	 * Performs the drawing operation onto the canvas.
	 * 
	 * @param {Object} viewer - the object containing the reference to the Actor that'll be drawn.
	 * @param {Object} graphics - the renderer.
	 */
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

	/** Schedule the next frame. */
	function _ScheduleAdvance(viewer)
	{
		clearTimeout(viewer._AdvanceTimeout);
		window.requestAnimationFrame(function()
			{
				_Advance(viewer);
			}
		);
	}

	/**
	 * Loads the Flare file from disk.
	 * 
	 * @param {string} url - the .flr file location.
	 * @param {onSuccessCallback} callback - the callback that's triggered upon a successful load.
	 */ 
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

	/**
	 * Cleans up old resources, and then initializes Actors and Animations, storing the instance references for both.
	 * This is the final step of the setup process for a Flare file.
	 */
	FlareExample.prototype.setActor = function(actor)
	{
		/** Cleanup */
		if(this._Actor)
		{
			this._Actor.dispose(this._Graphics);
		}
		if(this._ActorInstance)
		{
			this._ActorInstance.dispose(this._Graphics);
		}
		/** Initialize all the Artboards within this Actor. */
		actor.initialize(this._Graphics);

		/** Creates new ActorArtboard instance */
		const actorInstance = actor.makeInstance();
		actorInstance.initialize(this._Graphics);
		
		this._Actor = actor;
		this._ActorInstance = actorInstance;

		//console.log(this._ActorInstance.components);
		if(actorInstance)
		{
			/** ActorArtboard.initialize() */
			actorInstance.initialize(this._Graphics);			


			this._MyNode = actorInstance.getNode("Scale Node_Special Property");
			for (var props in this._MyNode._CustomProperties)
			{
				//console.log(props.propertyType);
			}
			if(actorInstance._Animations.length)
			{
				/** Instantiate the Animation. */
				this._Animation = actorInstance.getAnimation("Idle");
				this._AnimationInstance = new Flare.AnimationInstance(this._Animation._Actor, this._Animation);
				
				this._ChangedAnimation = actorInstance.getAnimation("Mustache_New");
				this._ChangedInstance = new Flare.AnimationInstance(this._ChangedAnimation._Actor, this._ChangedAnimation);
				
				this._ProgressTracker = actorInstance.getAnimation("Mustache_New");

				this._MyBone = actorInstance.getNode("Bone");				

				this._MyNode = actorInstance.getNode("Scale Node_Special Property");

				if(!this._AnimationInstance) 
				{
					console.log("NO ANIMATION IN HERE!?"); 
					return;
				}				
				 
			}
		}
	};

	/** Set the renderer's viewport to the desired width/height. */
	FlareExample.prototype.setSize = function(width, height)
	{
		this._Graphics.setSize(width, height);
	};

	FlareExample.prototype.updateActor = function (actor) {
		
		this._CanPlay = true;
		this._SmileTime = 0;
		this._SoloIdx++;
		if (this._SoloIdx > 5)
		{
			this._SoloIdx = 1;
		}

		this._SoloNode = this._ActorInstance.getNode("Mustache_Solo");
		this._SoloNode.setActiveChildIndex(this._SoloIdx);
		 
		
		//this._Song.play();
	};

	return FlareExample;
}());