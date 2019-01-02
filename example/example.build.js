/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./example/example.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./example/example.js":
/*!****************************!*\
  !*** ./example/example.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");

const Flare = __webpack_require__(/*! ../source/Flare.js */ "./source/Flare.js")

const _ViewCenter = [500.0, 500.0];
const _Scale = 0.5;

function FlareExample(canvas)
{
	this._Graphics = new Flare.Graphics(canvas);
	this._LastAdvanceTime = Date.now();
	this._ViewTransform = gl_matrix__WEBPACK_IMPORTED_MODULE_0__["mat2d"].create();
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

/***/ }),

/***/ "./node_modules/@svgdotjs/svg.js/dist/svg.node.js":
/*!********************************************************!*\
  !*** ./node_modules/@svgdotjs/svg.js/dist/svg.node.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*!
* @svgdotjs/svg.js - A lightweight library for manipulating and animating SVG.
* @version 3.0.5
* https://svgdotjs.github.io/
*
* @copyright Wout Fierens <wout@mick-wout.com>
* @license MIT
*
* BUILT: Wed Dec 12 2018 23:21:54 GMT+0100 (GMT+01:00)
*/;
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const methods = {};
const names = [];
function registerMethods(name, m) {
  if (Array.isArray(name)) {
    for (let _name of name) {
      registerMethods(_name, m);
    }

    return;
  }

  if (typeof name === 'object') {
    for (let _name in name) {
      registerMethods(_name, name[_name]);
    }

    return;
  }

  addMethodNames(Object.getOwnPropertyNames(m));
  methods[name] = Object.assign(methods[name] || {}, m);
}
function getMethodsFor(name) {
  return methods[name] || {};
}
function getMethodNames() {
  return [...new Set(names)];
}
function addMethodNames(_names) {
  names.push(..._names);
}

// Map function
function map(array, block) {
  var i;
  var il = array.length;
  var result = [];

  for (i = 0; i < il; i++) {
    result.push(block(array[i]));
  }

  return result;
} // Filter function

function filter(array, block) {
  var i;
  var il = array.length;
  var result = [];

  for (i = 0; i < il; i++) {
    if (block(array[i])) {
      result.push(array[i]);
    }
  }

  return result;
} // Degrees to radians

function radians(d) {
  return d % 360 * Math.PI / 180;
} // Radians to degrees

function degrees(r) {
  return r * 180 / Math.PI % 360;
} // Convert dash-separated-string to camelCase

function camelCase(s) {
  return s.toLowerCase().replace(/-(.)/g, function (m, g) {
    return g.toUpperCase();
  });
} // Convert camel cased string to string seperated

function unCamelCase(s) {
  return s.replace(/([A-Z])/g, function (m, g) {
    return '-' + g.toLowerCase();
  });
} // Capitalize first letter of a string

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
} // Calculate proportional width and height values when necessary

function proportionalSize(element, width, height, box) {
  if (width == null || height == null) {
    box = box || element.bbox();

    if (width == null) {
      width = box.width / box.height * height;
    } else if (height == null) {
      height = box.height / box.width * width;
    }
  }

  return {
    width: width,
    height: height
  };
}
function getOrigin(o, element) {
  // Allow origin or around as the names
  let origin = o.origin; // o.around == null ? o.origin : o.around

  let ox, oy; // Allow the user to pass a string to rotate around a given point

  if (typeof origin === 'string' || origin == null) {
    // Get the bounding box of the element with no transformations applied
    const string = (origin || 'center').toLowerCase().trim();
    const {
      height,
      width,
      x,
      y
    } = element.bbox(); // Calculate the transformed x and y coordinates

    let bx = string.includes('left') ? x : string.includes('right') ? x + width : x + width / 2;
    let by = string.includes('top') ? y : string.includes('bottom') ? y + height : y + height / 2; // Set the bounds eg : "bottom-left", "Top right", "middle" etc...

    ox = o.ox != null ? o.ox : bx;
    oy = o.oy != null ? o.oy : by;
  } else {
    ox = origin[0];
    oy = origin[1];
  } // Return the origin as it is if it wasn't a string


  return [ox, oy];
}

var utils = ({
  map: map,
  filter: filter,
  radians: radians,
  degrees: degrees,
  camelCase: camelCase,
  unCamelCase: unCamelCase,
  capitalize: capitalize,
  proportionalSize: proportionalSize,
  getOrigin: getOrigin
});

// Default namespaces
let ns = 'http://www.w3.org/2000/svg';
let xmlns = 'http://www.w3.org/2000/xmlns/';
let xlink = 'http://www.w3.org/1999/xlink';
let svgjs = 'http://svgjs.com/svgjs';

var namespaces = ({
  ns: ns,
  xmlns: xmlns,
  xlink: xlink,
  svgjs: svgjs
});

const globals = {
  window: typeof window === 'undefined' ? null : window,
  document: typeof document === 'undefined' ? null : document
};
function registerWindow(win = null, doc = null) {
  globals.window = win;
  globals.document = doc;
}

class Base {// constructor (node/*, {extensions = []} */) {
  //   // this.tags = []
  //   //
  //   // for (let extension of extensions) {
  //   //   extension.setup.call(this, node)
  //   //   this.tags.push(extension.name)
  //   // }
  // }
}

const elements = {};
const root = '___SYMBOL___ROOT___'; // Method for element creation

function create(name) {
  // create element
  return globals.document.createElementNS(ns, name);
}
function makeInstance(element) {
  if (element instanceof Base) return element;

  if (typeof element === 'object') {
    return adopter(element);
  }

  if (element == null) {
    return new elements[root]();
  }

  if (typeof element === 'string' && element.charAt(0) !== '<') {
    return adopter(globals.document.querySelector(element));
  }

  var node = create('svg');
  node.innerHTML = element; // We can use firstChild here because we know,
  // that the first char is < and thus an element

  element = adopter(node.firstChild);
  return element;
}
function nodeOrNew(name, node) {
  return node instanceof globals.window.Node ? node : create(name);
} // Adopt existing svg elements

function adopt(node) {
  // check for presence of node
  if (!node) return null; // make sure a node isn't already adopted

  if (node.instance instanceof Base) return node.instance; // initialize variables

  var className = capitalize(node.nodeName || 'Dom'); // Make sure that gradients are adopted correctly

  if (className === 'LinearGradient' || className === 'RadialGradient') {
    className = 'Gradient'; // Fallback to Dom if element is not known
  } else if (!elements[className]) {
    className = 'Dom';
  }

  return new elements[className](node);
}
let adopter = adopt;
function mockAdopt(mock = adopt) {
  adopter = mock;
}
function register(element, name = element.name, asRoot = false) {
  elements[name] = element;
  if (asRoot) elements[root] = element;
  addMethodNames(Object.getOwnPropertyNames(element.prototype));
  return element;
}
function getClass(name) {
  return elements[name];
} // Element id sequence

let did = 1000; // Get next named element id

function eid(name) {
  return 'Svgjs' + capitalize(name) + did++;
} // Deep new id assignment

function assignNewId(node) {
  // do the same for SVG child nodes as well
  for (var i = node.children.length - 1; i >= 0; i--) {
    assignNewId(node.children[i]);
  }

  if (node.id) {
    return adopt(node).id(eid(node.nodeName));
  }

  return adopt(node);
} // Method for extending objects

function extend(modules, methods, attrCheck) {
  var key, i;
  modules = Array.isArray(modules) ? modules : [modules];

  for (i = modules.length - 1; i >= 0; i--) {
    for (key in methods) {
      let method = methods[key];

      if (attrCheck) {
        method = wrapWithAttrCheck(methods[key]);
      }

      modules[i].prototype[key] = method;
    }
  }
} // export function extendWithAttrCheck (...args) {
//   extend(...args, true)
// }

function wrapWithAttrCheck(fn) {
  return function (...args) {
    let o = args[args.length - 1];

    if (o && o.constructor === Object && !(o instanceof Array)) {
      return fn.apply(this, args.slice(0, -1)).attr(o);
    } else {
      return fn.apply(this, args);
    }
  };
}

function siblings() {
  return this.parent().children();
} // Get the curent position siblings

function position() {
  return this.parent().index(this);
} // Get the next element (will return null if there is none)

function next() {
  return this.siblings()[this.position() + 1];
} // Get the next element (will return null if there is none)

function prev() {
  return this.siblings()[this.position() - 1];
} // Send given element one step forward

function forward() {
  var i = this.position() + 1;
  var p = this.parent(); // move node one step forward

  p.removeElement(this).add(this, i); // make sure defs node is always at the top

  if (typeof p.isRoot === 'function' && p.isRoot()) {
    p.node.appendChild(p.defs().node);
  }

  return this;
} // Send given element one step backward

function backward() {
  var i = this.position();

  if (i > 0) {
    this.parent().removeElement(this).add(this, i - 1);
  }

  return this;
} // Send given element all the way to the front

function front() {
  var p = this.parent(); // Move node forward

  p.node.appendChild(this.node); // Make sure defs node is always at the top

  if (typeof p.isRoot === 'function' && p.isRoot()) {
    p.node.appendChild(p.defs().node);
  }

  return this;
} // Send given element all the way to the back

function back() {
  if (this.position() > 0) {
    this.parent().removeElement(this).add(this, 0);
  }

  return this;
} // Inserts a given element before the targeted element

function before(element) {
  element = makeInstance(element);
  element.remove();
  var i = this.position();
  this.parent().add(element, i);
  return this;
} // Inserts a given element after the targeted element

function after(element) {
  element = makeInstance(element);
  element.remove();
  var i = this.position();
  this.parent().add(element, i + 1);
  return this;
}
function insertBefore(element) {
  element = makeInstance(element);
  element.before(this);
  return this;
}
function insertAfter(element) {
  element = makeInstance(element);
  element.after(this);
  return this;
}
registerMethods('Dom', {
  siblings,
  position,
  next,
  prev,
  forward,
  backward,
  front,
  back,
  before,
  after,
  insertBefore,
  insertAfter
});

// Parse unit value
let numberAndUnit = /^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i; // Parse hex value

let hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i; // Parse rgb value

let rgb = /rgb\((\d+),(\d+),(\d+)\)/; // Parse reference id

let reference = /(#[a-z0-9\-_]+)/i; // splits a transformation chain

let transforms = /\)\s*,?\s*/; // Whitespace

let whitespace = /\s/g; // Test hex value

let isHex = /^#[a-f0-9]{3,6}$/i; // Test rgb value

let isRgb = /^rgb\(/; // Test css declaration

let isCss = /[^:]+:[^;]+;?/; // Test for blank string

let isBlank = /^(\s+)?$/; // Test for numeric string

let isNumber = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i; // Test for percent value

let isPercent = /^-?[\d.]+%$/; // Test for image url

let isImage = /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i; // split at whitespace and comma

let delimiter = /[\s,]+/; // The following regex are used to parse the d attribute of a path
// Matches all hyphens which are not after an exponent

let hyphen = /([^e])-/gi; // Replaces and tests for all path letters

let pathLetters = /[MLHVCSQTAZ]/gi; // yes we need this one, too

let isPathLetter = /[MLHVCSQTAZ]/i; // matches 0.154.23.45

let numbersWithDots = /((\d?\.\d+(?:e[+-]?\d+)?)((?:\.\d+(?:e[+-]?\d+)?)+))+/gi; // matches .

let dots = /\./g;

var regex = ({
  numberAndUnit: numberAndUnit,
  hex: hex,
  rgb: rgb,
  reference: reference,
  transforms: transforms,
  whitespace: whitespace,
  isHex: isHex,
  isRgb: isRgb,
  isCss: isCss,
  isBlank: isBlank,
  isNumber: isNumber,
  isPercent: isPercent,
  isImage: isImage,
  delimiter: delimiter,
  hyphen: hyphen,
  pathLetters: pathLetters,
  isPathLetter: isPathLetter,
  numbersWithDots: numbersWithDots,
  dots: dots
});

function classes() {
  var attr = this.attr('class');
  return attr == null ? [] : attr.trim().split(delimiter);
} // Return true if class exists on the node, false otherwise

function hasClass(name) {
  return this.classes().indexOf(name) !== -1;
} // Add class to the node

function addClass(name) {
  if (!this.hasClass(name)) {
    var array = this.classes();
    array.push(name);
    this.attr('class', array.join(' '));
  }

  return this;
} // Remove class from the node

function removeClass(name) {
  if (this.hasClass(name)) {
    this.attr('class', this.classes().filter(function (c) {
      return c !== name;
    }).join(' '));
  }

  return this;
} // Toggle the presence of a class on the node

function toggleClass(name) {
  return this.hasClass(name) ? this.removeClass(name) : this.addClass(name);
}
registerMethods('Dom', {
  classes,
  hasClass,
  addClass,
  removeClass,
  toggleClass
});

function css(style, val) {
  let ret = {};

  if (arguments.length === 0) {
    // get full style as object
    this.node.style.cssText.split(/\s*;\s*/).filter(function (el) {
      return !!el.length;
    }).forEach(function (el) {
      let t = el.split(/\s*:\s*/);
      ret[t[0]] = t[1];
    });
    return ret;
  }

  if (arguments.length < 2) {
    // get style properties in the array
    if (Array.isArray(style)) {
      for (let name of style) {
        let cased = camelCase(name);
        ret[cased] = this.node.style[cased];
      }

      return ret;
    } // get style for property


    if (typeof style === 'string') {
      return this.node.style[camelCase(style)];
    } // set styles in object


    if (typeof style === 'object') {
      for (let name in style) {
        // set empty string if null/undefined/'' was given
        this.node.style[camelCase(name)] = style[name] == null || isBlank.test(style[name]) ? '' : style[name];
      }
    }
  } // set style for property


  if (arguments.length === 2) {
    this.node.style[camelCase(style)] = val == null || isBlank.test(val) ? '' : val;
  }

  return this;
} // Show element

function show() {
  return this.css('display', '');
} // Hide element

function hide() {
  return this.css('display', 'none');
} // Is element visible?

function visible() {
  return this.css('display') !== 'none';
}
registerMethods('Dom', {
  css,
  show,
  hide,
  visible
});

function data(a, v, r) {
  if (typeof a === 'object') {
    for (v in a) {
      this.data(v, a[v]);
    }
  } else if (arguments.length < 2) {
    try {
      return JSON.parse(this.attr('data-' + a));
    } catch (e) {
      return this.attr('data-' + a);
    }
  } else {
    this.attr('data-' + a, v === null ? null : r === true || typeof v === 'string' || typeof v === 'number' ? v : JSON.stringify(v));
  }

  return this;
}
registerMethods('Dom', {
  data
});

function remember(k, v) {
  // remember every item in an object individually
  if (typeof arguments[0] === 'object') {
    for (var key in k) {
      this.remember(key, k[key]);
    }
  } else if (arguments.length === 1) {
    // retrieve memory
    return this.memory()[k];
  } else {
    // store memory
    this.memory()[k] = v;
  }

  return this;
} // Erase a given memory

function forget() {
  if (arguments.length === 0) {
    this._memory = {};
  } else {
    for (var i = arguments.length - 1; i >= 0; i--) {
      delete this.memory()[arguments[i]];
    }
  }

  return this;
} // This triggers creation of a new hidden class which is not performant
// However, this function is not rarely used so it will not happen frequently
// Return local memory object

function memory() {
  return this._memory = this._memory || {};
}
registerMethods('Dom', {
  remember,
  forget,
  memory
});

let listenerId = 0;
let windowEvents = {};

function getEvents(instance) {
  let n = instance.getEventHolder(); // We dont want to save events in global space

  if (n === globals.window) n = windowEvents;
  if (!n.events) n.events = {};
  return n.events;
}

function getEventTarget(instance) {
  return instance.getEventTarget();
}

function clearEvents(instance) {
  const n = instance.getEventHolder();
  if (n.events) n.events = {};
} // Add event binder in the SVG namespace


function on(node, events, listener, binding, options) {
  var l = listener.bind(binding || node);
  var instance = makeInstance(node);
  var bag = getEvents(instance);
  var n = getEventTarget(instance); // events can be an array of events or a string of events

  events = Array.isArray(events) ? events : events.split(delimiter); // add id to listener

  if (!listener._svgjsListenerId) {
    listener._svgjsListenerId = ++listenerId;
  }

  events.forEach(function (event) {
    var ev = event.split('.')[0];
    var ns = event.split('.')[1] || '*'; // ensure valid object

    bag[ev] = bag[ev] || {};
    bag[ev][ns] = bag[ev][ns] || {}; // reference listener

    bag[ev][ns][listener._svgjsListenerId] = l; // add listener

    n.addEventListener(ev, l, options || false);
  });
} // Add event unbinder in the SVG namespace

function off(node, events, listener, options) {
  var instance = makeInstance(node);
  var bag = getEvents(instance);
  var n = getEventTarget(instance); // listener can be a function or a number

  if (typeof listener === 'function') {
    listener = listener._svgjsListenerId;
    if (!listener) return;
  } // events can be an array of events or a string or undefined


  events = Array.isArray(events) ? events : (events || '').split(delimiter);
  events.forEach(function (event) {
    var ev = event && event.split('.')[0];
    var ns = event && event.split('.')[1];
    var namespace, l;

    if (listener) {
      // remove listener reference
      if (bag[ev] && bag[ev][ns || '*']) {
        // removeListener
        n.removeEventListener(ev, bag[ev][ns || '*'][listener], options || false);
        delete bag[ev][ns || '*'][listener];
      }
    } else if (ev && ns) {
      // remove all listeners for a namespaced event
      if (bag[ev] && bag[ev][ns]) {
        for (l in bag[ev][ns]) {
          off(n, [ev, ns].join('.'), l);
        }

        delete bag[ev][ns];
      }
    } else if (ns) {
      // remove all listeners for a specific namespace
      for (event in bag) {
        for (namespace in bag[event]) {
          if (ns === namespace) {
            off(n, [event, ns].join('.'));
          }
        }
      }
    } else if (ev) {
      // remove all listeners for the event
      if (bag[ev]) {
        for (namespace in bag[ev]) {
          off(n, [ev, namespace].join('.'));
        }

        delete bag[ev];
      }
    } else {
      // remove all listeners on a given node
      for (event in bag) {
        off(n, event);
      }

      clearEvents(instance);
    }
  });
}
function dispatch(node, event, data) {
  var n = getEventTarget(node); // Dispatch event

  if (event instanceof globals.window.Event) {
    n.dispatchEvent(event);
  } else {
    event = new globals.window.CustomEvent(event, {
      detail: data,
      cancelable: true
    });
    n.dispatchEvent(event);
  }

  return event;
}

function sixDigitHex(hex$$1) {
  return hex$$1.length === 4 ? ['#', hex$$1.substring(1, 2), hex$$1.substring(1, 2), hex$$1.substring(2, 3), hex$$1.substring(2, 3), hex$$1.substring(3, 4), hex$$1.substring(3, 4)].join('') : hex$$1;
}

function componentHex(component) {
  const integer = Math.round(component);
  const bounded = Math.max(0, Math.min(255, integer));
  const hex$$1 = bounded.toString(16);
  return hex$$1.length === 1 ? '0' + hex$$1 : hex$$1;
}

function is(object, space) {
  for (let i = space.length; i--;) {
    if (object[space[i]] == null) {
      return false;
    }
  }

  return true;
}

function getParameters(a, b) {
  const params = is(a, 'rgb') ? {
    _a: a.r,
    _b: a.g,
    _c: a.b,
    space: 'rgb'
  } : is(a, 'xyz') ? {
    _a: a.x,
    _b: a.y,
    _c: a.z,
    _d: 0,
    space: 'xyz'
  } : is(a, 'hsl') ? {
    _a: a.h,
    _b: a.s,
    _c: a.l,
    _d: 0,
    space: 'hsl'
  } : is(a, 'lab') ? {
    _a: a.l,
    _b: a.a,
    _c: a.b,
    _d: 0,
    space: 'lab'
  } : is(a, 'lch') ? {
    _a: a.l,
    _b: a.c,
    _c: a.h,
    _d: 0,
    space: 'lch'
  } : is(a, 'cmyk') ? {
    _a: a.c,
    _b: a.m,
    _c: a.y,
    _d: a.k,
    space: 'cmyk'
  } : {
    _a: 0,
    _b: 0,
    _c: 0,
    space: 'rgb'
  };
  params.space = b || params.space;
  return params;
}

function cieSpace(space) {
  if (space === 'lab' || space === 'xyz' || space === 'lch') {
    return true;
  } else {
    return false;
  }
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

class Color {
  constructor(...inputs) {
    this.init(...inputs);
  }

  init(a = 0, b = 0, c = 0, d = 0, space = 'rgb') {
    // This catches the case when a falsy value is passed like ''
    a = !a ? 0 : a; // Reset all values in case the init function is rerun with new color space

    if (this.space) {
      for (let component in this.space) {
        delete this[this.space[component]];
      }
    }

    if (typeof a === 'number') {
      // Allow for the case that we don't need d...
      space = typeof d === 'string' ? d : space;
      d = typeof d === 'string' ? 0 : d; // Assign the values straight to the color

      Object.assign(this, {
        _a: a,
        _b: b,
        _c: c,
        _d: d,
        space
      }); // If the user gave us an array, make the color from it
    } else if (a instanceof Array) {
      this.space = b || (typeof a[3] === 'string' ? a[3] : a[4]) || 'rgb';
      Object.assign(this, {
        _a: a[0],
        _b: a[1],
        _c: a[2],
        _d: a[3] || 0
      });
    } else if (a instanceof Object) {
      // Set the object up and assign its values directly
      const values = getParameters(a, b);
      Object.assign(this, values);
    } else if (typeof a === 'string') {
      if (isRgb.test(a)) {
        const noWhitespace = a.replace(whitespace, '');
        const [_a, _b, _c] = rgb.exec(noWhitespace).slice(1, 4).map(v => parseInt(v));
        Object.assign(this, {
          _a,
          _b,
          _c,
          _d: 0,
          space: 'rgb'
        });
      } else if (isHex.test(a)) {
        const hexParse = v => parseInt(v, 16);

        const [, _a, _b, _c] = hex.exec(sixDigitHex(a)).map(hexParse);
        Object.assign(this, {
          _a,
          _b,
          _c,
          _d: 0,
          space: 'rgb'
        });
      } else throw Error(`Unsupported string format, can't construct Color`);
    } // Now add the components as a convenience


    const {
      _a,
      _b,
      _c,
      _d
    } = this;
    const components = this.space === 'rgb' ? {
      r: _a,
      g: _b,
      b: _c
    } : this.space === 'xyz' ? {
      x: _a,
      y: _b,
      z: _c
    } : this.space === 'hsl' ? {
      h: _a,
      s: _b,
      l: _c
    } : this.space === 'lab' ? {
      l: _a,
      a: _b,
      b: _c
    } : this.space === 'lch' ? {
      l: _a,
      c: _b,
      h: _c
    } : this.space === 'cmyk' ? {
      c: _a,
      m: _b,
      y: _c,
      k: _d
    } : {};
    Object.assign(this, components);
  }
  /*
  Conversion Methods
  */


  rgb() {
    if (this.space === 'rgb') {
      return this;
    } else if (cieSpace(this.space)) {
      // Convert to the xyz color space
      let {
        x,
        y,
        z
      } = this;

      if (this.space === 'lab' || this.space === 'lch') {
        // Get the values in the lab space
        let {
          l,
          a,
          b
        } = this;

        if (this.space === 'lch') {
          let {
            c,
            h
          } = this;
          const dToR = Math.PI / 180;
          a = c * Math.cos(dToR * h);
          b = c * Math.sin(dToR * h);
        } // Undo the nonlinear function


        const yL = (l + 16) / 116;
        const xL = a / 500 + yL;
        const zL = yL - b / 200; // Get the xyz values

        const ct = 16 / 116;
        const mx = 0.008856;
        const nm = 7.787;
        x = 0.95047 * (Math.pow(xL, 3) > mx ? Math.pow(xL, 3) : (xL - ct) / nm);
        y = 1.00000 * (Math.pow(yL, 3) > mx ? Math.pow(yL, 3) : (yL - ct) / nm);
        z = 1.08883 * (Math.pow(zL, 3) > mx ? Math.pow(zL, 3) : (zL - ct) / nm);
      } // Convert xyz to unbounded rgb values


      const rU = x * 3.2406 + y * -1.5372 + z * -0.4986;
      const gU = x * -0.9689 + y * 1.8758 + z * 0.0415;
      const bU = x * 0.0557 + y * -0.2040 + z * 1.0570; // Convert the values to true rgb values

      let pow = Math.pow;
      let bd = 0.0031308;
      const r = rU > bd ? 1.055 * pow(rU, 1 / 2.4) - 0.055 : 12.92 * rU;
      const g = gU > bd ? 1.055 * pow(gU, 1 / 2.4) - 0.055 : 12.92 * gU;
      const b = bU > bd ? 1.055 * pow(bU, 1 / 2.4) - 0.055 : 12.92 * bU; // Make and return the color

      const color = new Color(255 * r, 255 * g, 255 * b);
      return color;
    } else if (this.space === 'hsl') {
      // https://bgrins.github.io/TinyColor/docs/tinycolor.html
      // Get the current hsl values
      let {
        h,
        s,
        l
      } = this;
      h /= 360;
      s /= 100;
      l /= 100; // If we are grey, then just make the color directly

      if (s === 0) {
        l *= 255;
        let color = new Color(l, l, l);
        return color;
      } // TODO I have no idea what this does :D If you figure it out, tell me!


      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q; // Get the rgb values

      const r = 255 * hueToRgb(p, q, h + 1 / 3);
      const g = 255 * hueToRgb(p, q, h);
      const b = 255 * hueToRgb(p, q, h - 1 / 3); // Make a new color

      const color = new Color(r, g, b);
      return color;
    } else if (this.space === 'cmyk') {
      // https://gist.github.com/felipesabino/5066336
      // Get the normalised cmyk values
      const {
        c,
        m,
        y,
        k
      } = this; // Get the rgb values

      const r = 255 * (1 - Math.min(1, c * (1 - k) + k));
      const g = 255 * (1 - Math.min(1, m * (1 - k) + k));
      const b = 255 * (1 - Math.min(1, y * (1 - k) + k)); // Form the color and return it

      const color = new Color(r, g, b);
      return color;
    } else {
      return this;
    }
  }

  lab() {
    // Get the xyz color
    const {
      x,
      y,
      z
    } = this.xyz(); // Get the lab components

    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z); // Construct and return a new color

    const color = new Color(l, a, b, 'lab');
    return color;
  }

  xyz() {
    // Normalise the red, green and blue values
    const {
      _a: r255,
      _b: g255,
      _c: b255
    } = this.rgb();
    const [r, g, b] = [r255, g255, b255].map(v => v / 255); // Convert to the lab rgb space

    const rL = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    const gL = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    const bL = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92; // Convert to the xyz color space without bounding the values

    const xU = (rL * 0.4124 + gL * 0.3576 + bL * 0.1805) / 0.95047;
    const yU = (rL * 0.2126 + gL * 0.7152 + bL * 0.0722) / 1.00000;
    const zU = (rL * 0.0193 + gL * 0.1192 + bL * 0.9505) / 1.08883; // Get the proper xyz values by applying the bounding

    const x = xU > 0.008856 ? Math.pow(xU, 1 / 3) : 7.787 * xU + 16 / 116;
    const y = yU > 0.008856 ? Math.pow(yU, 1 / 3) : 7.787 * yU + 16 / 116;
    const z = zU > 0.008856 ? Math.pow(zU, 1 / 3) : 7.787 * zU + 16 / 116; // Make and return the color

    const color = new Color(x, y, z, 'xyz');
    return color;
  }

  lch() {
    // Get the lab color directly
    const {
      l,
      a,
      b
    } = this.lab(); // Get the chromaticity and the hue using polar coordinates

    const c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    let h = 180 * Math.atan2(b, a) / Math.PI;

    if (h < 0) {
      h *= -1;
      h = 360 - h;
    } // Make a new color and return it


    const color = new Color(l, c, h, 'lch');
    return color;
  }

  hsl() {
    // Get the rgb values
    const {
      _a,
      _b,
      _c
    } = this.rgb();
    const [r, g, b] = [_a, _b, _c].map(v => v / 255); // Find the maximum and minimum values to get the lightness

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2; // If the r, g, v values are identical then we are grey

    const isGrey = max === min; // Calculate the hue and saturation

    const delta = max - min;
    const s = isGrey ? 0 : l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    const h = isGrey ? 0 : max === r ? ((g - b) / delta + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / delta + 2) / 6 : max === b ? ((r - g) / delta + 4) / 6 : 0; // Construct and return the new color

    const color = new Color(360 * h, 100 * s, 100 * l, 'hsl');
    return color;
  }

  cmyk() {
    // Get the rgb values for the current color
    const {
      _a,
      _b,
      _c
    } = this.rgb();
    const [r, g, b] = [_a, _b, _c].map(v => v / 255); // Get the cmyk values in an unbounded format

    const k = Math.min(1 - r, 1 - g, 1 - b);

    if (k === 1) {
      // Catch the black case
      return new Color(0, 0, 0, 1, 'cmyk');
    }

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k); // Construct the new color

    const color = new Color(c, m, y, k, 'cmyk');
    return color;
  }
  /*
  Input and Output methods
  */


  _clamped() {
    let {
      _a,
      _b,
      _c
    } = this.rgb();
    let {
      max,
      min,
      round
    } = Math;

    let format = v => max(0, min(round(v), 255));

    return [_a, _b, _c].map(format);
  }

  toHex() {
    let [r, g, b] = this._clamped().map(componentHex);

    return `#${r}${g}${b}`;
  }

  toString() {
    return this.toHex();
  }

  toRgb() {
    let [rV, gV, bV] = this._clamped();

    let string = `rgb(${rV},${gV},${bV})`;
    return string;
  }

  toArray() {
    let {
      _a,
      _b,
      _c,
      _d,
      space
    } = this;
    return [_a, _b, _c, _d, space];
  }
  /*
  Generating random colors
  */


  static random(mode = 'vibrant', t, u) {
    // Get the math modules
    const {
      random,
      round,
      sin,
      PI: pi
    } = Math; // Run the correct generator

    if (mode === 'vibrant') {
      const l = (81 - 57) * random() + 57;
      const c = (83 - 45) * random() + 45;
      const h = 360 * random();
      const color = new Color(l, c, h, 'lch');
      return color;
    } else if (mode === 'sine') {
      t = t == null ? random() : t;
      const r = round(80 * sin(2 * pi * t / 0.5 + 0.01) + 150);
      const g = round(50 * sin(2 * pi * t / 0.5 + 4.6) + 200);
      const b = round(100 * sin(2 * pi * t / 0.5 + 2.3) + 150);
      const color = new Color(r, g, b);
      return color;
    } else if (mode === 'pastel') {
      const l = (94 - 86) * random() + 86;
      const c = (26 - 9) * random() + 9;
      const h = 360 * random();
      const color = new Color(l, c, h, 'lch');
      return color;
    } else if (mode === 'dark') {
      const l = 10 + 10 * random();
      const c = (125 - 75) * random() + 86;
      const h = 360 * random();
      const color = new Color(l, c, h, 'lch');
      return color;
    } else if (mode === 'rgb') {
      const r = 255 * random();
      const g = 255 * random();
      const b = 255 * random();
      const color = new Color(r, g, b);
      return color;
    } else if (mode === 'lab') {
      const l = 100 * random();
      const a = 256 * random() - 128;
      const b = 256 * random() - 128;
      const color = new Color(l, a, b, 'lab');
      return color;
    } else if (mode === 'grey') {
      const grey = 255 * random();
      const color = new Color(grey, grey, grey);
      return color;
    }
  }
  /*
  Constructing colors
  */
  // Test if given value is a color string


  static test(color) {
    color += '';
    return isHex.test(color) || isRgb.test(color);
  } // Test if given value is a rgb object


  static isRgb(color) {
    return color && typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number';
  } // Test if given value is a color


  static isColor(color) {
    return this.isRgb(color) || this.test(color);
  }

}

class Point {
  // Initialize
  constructor(...args) {
    this.init(...args);
  }

  init(x, y) {
    let source;
    let base = {
      x: 0,
      y: 0 // ensure source as object

    };
    source = Array.isArray(x) ? {
      x: x[0],
      y: x[1]
    } : typeof x === 'object' ? {
      x: x.x,
      y: x.y
    } : {
      x: x,
      y: y // merge source

    };
    this.x = source.x == null ? base.x : source.x;
    this.y = source.y == null ? base.y : source.y;
    return this;
  } // Clone point


  clone() {
    return new Point(this);
  } // transform point with matrix


  transform(m) {
    // Perform the matrix multiplication
    var x = m.a * this.x + m.c * this.y + m.e;
    var y = m.b * this.x + m.d * this.y + m.f; // Return the required point

    return new Point(x, y);
  }

  toArray() {
    return [this.x, this.y];
  }

}
function point(x, y) {
  return new Point(x, y).transform(this.screenCTM().inverse());
}

function closeEnough(a, b, threshold) {
  return Math.abs(b - a) < (threshold || 1e-6);
}

class Matrix {
  constructor(...args) {
    this.init(...args);
  } // Initialize


  init(source) {
    var base = Matrix.fromArray([1, 0, 0, 1, 0, 0]); // ensure source as object

    source = source instanceof Element ? source.matrixify() : typeof source === 'string' ? Matrix.fromArray(source.split(delimiter).map(parseFloat)) : Array.isArray(source) ? Matrix.fromArray(source) : typeof source === 'object' && Matrix.isMatrixLike(source) ? source : typeof source === 'object' ? new Matrix().transform(source) : arguments.length === 6 ? Matrix.fromArray([].slice.call(arguments)) : base; // Merge the source matrix with the base matrix

    this.a = source.a != null ? source.a : base.a;
    this.b = source.b != null ? source.b : base.b;
    this.c = source.c != null ? source.c : base.c;
    this.d = source.d != null ? source.d : base.d;
    this.e = source.e != null ? source.e : base.e;
    this.f = source.f != null ? source.f : base.f;
    return this;
  } // Clones this matrix


  clone() {
    return new Matrix(this);
  } // Transform a matrix into another matrix by manipulating the space


  transform(o) {
    // Check if o is a matrix and then left multiply it directly
    if (Matrix.isMatrixLike(o)) {
      var matrix = new Matrix(o);
      return matrix.multiplyO(this);
    } // Get the proposed transformations and the current transformations


    var t = Matrix.formatTransforms(o);
    var current = this;
    let {
      x: ox,
      y: oy
    } = new Point(t.ox, t.oy).transform(current); // Construct the resulting matrix

    var transformer = new Matrix().translateO(t.rx, t.ry).lmultiplyO(current).translateO(-ox, -oy).scaleO(t.scaleX, t.scaleY).skewO(t.skewX, t.skewY).shearO(t.shear).rotateO(t.theta).translateO(ox, oy); // If we want the origin at a particular place, we force it there

    if (isFinite(t.px) || isFinite(t.py)) {
      const origin = new Point(ox, oy).transform(transformer); // TODO: Replace t.px with isFinite(t.px)

      const dx = t.px ? t.px - origin.x : 0;
      const dy = t.py ? t.py - origin.y : 0;
      transformer.translateO(dx, dy);
    } // Translate now after positioning


    transformer.translateO(t.tx, t.ty);
    return transformer;
  } // Applies a matrix defined by its affine parameters


  compose(o) {
    if (o.origin) {
      o.originX = o.origin[0];
      o.originY = o.origin[1];
    } // Get the parameters


    var ox = o.originX || 0;
    var oy = o.originY || 0;
    var sx = o.scaleX || 1;
    var sy = o.scaleY || 1;
    var lam = o.shear || 0;
    var theta = o.rotate || 0;
    var tx = o.translateX || 0;
    var ty = o.translateY || 0; // Apply the standard matrix

    var result = new Matrix().translateO(-ox, -oy).scaleO(sx, sy).shearO(lam).rotateO(theta).translateO(tx, ty).lmultiplyO(this).translateO(ox, oy);
    return result;
  } // Decomposes this matrix into its affine parameters


  decompose(cx = 0, cy = 0) {
    // Get the parameters from the matrix
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var e = this.e;
    var f = this.f; // Figure out if the winding direction is clockwise or counterclockwise

    var determinant = a * d - b * c;
    var ccw = determinant > 0 ? 1 : -1; // Since we only shear in x, we can use the x basis to get the x scale
    // and the rotation of the resulting matrix

    var sx = ccw * Math.sqrt(a * a + b * b);
    var thetaRad = Math.atan2(ccw * b, ccw * a);
    var theta = 180 / Math.PI * thetaRad;
    var ct = Math.cos(thetaRad);
    var st = Math.sin(thetaRad); // We can then solve the y basis vector simultaneously to get the other
    // two affine parameters directly from these parameters

    var lam = (a * c + b * d) / determinant;
    var sy = c * sx / (lam * a - b) || d * sx / (lam * b + a); // Use the translations

    let tx = e - cx + cx * ct * sx + cy * (lam * ct * sx - st * sy);
    let ty = f - cy + cx * st * sx + cy * (lam * st * sx + ct * sy); // Construct the decomposition and return it

    return {
      // Return the affine parameters
      scaleX: sx,
      scaleY: sy,
      shear: lam,
      rotate: theta,
      translateX: tx,
      translateY: ty,
      originX: cx,
      originY: cy,
      // Return the matrix parameters
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e,
      f: this.f
    };
  } // Left multiplies by the given matrix


  multiply(matrix) {
    return this.clone().multiplyO(matrix);
  }

  multiplyO(matrix) {
    // Get the matrices
    var l = this;
    var r = matrix instanceof Matrix ? matrix : new Matrix(matrix);
    return Matrix.matrixMultiply(l, r, this);
  }

  lmultiply(matrix) {
    return this.clone().lmultiplyO(matrix);
  }

  lmultiplyO(matrix) {
    var r = this;
    var l = matrix instanceof Matrix ? matrix : new Matrix(matrix);
    return Matrix.matrixMultiply(l, r, this);
  } // Inverses matrix


  inverseO() {
    // Get the current parameters out of the matrix
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var e = this.e;
    var f = this.f; // Invert the 2x2 matrix in the top left

    var det = a * d - b * c;
    if (!det) throw new Error('Cannot invert ' + this); // Calculate the top 2x2 matrix

    var na = d / det;
    var nb = -b / det;
    var nc = -c / det;
    var nd = a / det; // Apply the inverted matrix to the top right

    var ne = -(na * e + nc * f);
    var nf = -(nb * e + nd * f); // Construct the inverted matrix

    this.a = na;
    this.b = nb;
    this.c = nc;
    this.d = nd;
    this.e = ne;
    this.f = nf;
    return this;
  }

  inverse() {
    return this.clone().inverseO();
  } // Translate matrix


  translate(x, y) {
    return this.clone().translateO(x, y);
  }

  translateO(x, y) {
    this.e += x || 0;
    this.f += y || 0;
    return this;
  } // Scale matrix


  scale(x, y, cx, cy) {
    return this.clone().scaleO(...arguments);
  }

  scaleO(x, y = x, cx = 0, cy = 0) {
    // Support uniform scaling
    if (arguments.length === 3) {
      cy = cx;
      cx = y;
      y = x;
    }

    let {
      a,
      b,
      c,
      d,
      e,
      f
    } = this;
    this.a = a * x;
    this.b = b * y;
    this.c = c * x;
    this.d = d * y;
    this.e = e * x - cx * x + cx;
    this.f = f * y - cy * y + cy;
    return this;
  } // Rotate matrix


  rotate(r, cx, cy) {
    return this.clone().rotateO(r, cx, cy);
  }

  rotateO(r, cx = 0, cy = 0) {
    // Convert degrees to radians
    r = radians(r);
    let cos = Math.cos(r);
    let sin = Math.sin(r);
    let {
      a,
      b,
      c,
      d,
      e,
      f
    } = this;
    this.a = a * cos - b * sin;
    this.b = b * cos + a * sin;
    this.c = c * cos - d * sin;
    this.d = d * cos + c * sin;
    this.e = e * cos - f * sin + cy * sin - cx * cos + cx;
    this.f = f * cos + e * sin - cx * sin - cy * cos + cy;
    return this;
  } // Flip matrix on x or y, at a given offset


  flip(axis, around) {
    return this.clone().flipO(axis, around);
  }

  flipO(axis, around) {
    return axis === 'x' ? this.scaleO(-1, 1, around, 0) : axis === 'y' ? this.scaleO(1, -1, 0, around) : this.scaleO(-1, -1, axis, around || axis); // Define an x, y flip point
  } // Shear matrix


  shear(a, cx, cy) {
    return this.clone().shearO(a, cx, cy);
  }

  shearO(lx, cx = 0, cy = 0) {
    let {
      a,
      b,
      c,
      d,
      e,
      f
    } = this;
    this.a = a + b * lx;
    this.c = c + d * lx;
    this.e = e + f * lx - cy * lx;
    return this;
  } // Skew Matrix


  skew(x, y, cx, cy) {
    return this.clone().skewO(...arguments);
  }

  skewO(x, y = x, cx = 0, cy = 0) {
    // support uniformal skew
    if (arguments.length === 3) {
      cy = cx;
      cx = y;
      y = x;
    } // Convert degrees to radians


    x = radians(x);
    y = radians(y);
    let lx = Math.tan(x);
    let ly = Math.tan(y);
    let {
      a,
      b,
      c,
      d,
      e,
      f
    } = this;
    this.a = a + b * lx;
    this.b = b + a * ly;
    this.c = c + d * lx;
    this.d = d + c * ly;
    this.e = e + f * lx - cy * lx;
    this.f = f + e * ly - cx * ly;
    return this;
  } // SkewX


  skewX(x, cx, cy) {
    return this.skew(x, 0, cx, cy);
  }

  skewXO(x, cx, cy) {
    return this.skewO(x, 0, cx, cy);
  } // SkewY


  skewY(y, cx, cy) {
    return this.skew(0, y, cx, cy);
  }

  skewYO(y, cx, cy) {
    return this.skewO(0, y, cx, cy);
  } // Transform around a center point


  aroundO(cx, cy, matrix) {
    var dx = cx || 0;
    var dy = cy || 0;
    return this.translateO(-dx, -dy).lmultiplyO(matrix).translateO(dx, dy);
  }

  around(cx, cy, matrix) {
    return this.clone().aroundO(cx, cy, matrix);
  } // Check if two matrices are equal


  equals(other) {
    var comp = new Matrix(other);
    return closeEnough(this.a, comp.a) && closeEnough(this.b, comp.b) && closeEnough(this.c, comp.c) && closeEnough(this.d, comp.d) && closeEnough(this.e, comp.e) && closeEnough(this.f, comp.f);
  } // Convert matrix to string


  toString() {
    return 'matrix(' + this.a + ',' + this.b + ',' + this.c + ',' + this.d + ',' + this.e + ',' + this.f + ')';
  }

  toArray() {
    return [this.a, this.b, this.c, this.d, this.e, this.f];
  }

  valueOf() {
    return {
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e,
      f: this.f
    };
  }

  static fromArray(a) {
    return {
      a: a[0],
      b: a[1],
      c: a[2],
      d: a[3],
      e: a[4],
      f: a[5]
    };
  }

  static isMatrixLike(o) {
    return o.a != null || o.b != null || o.c != null || o.d != null || o.e != null || o.f != null;
  }

  static formatTransforms(o) {
    // Get all of the parameters required to form the matrix
    var flipBoth = o.flip === 'both' || o.flip === true;
    var flipX = o.flip && (flipBoth || o.flip === 'x') ? -1 : 1;
    var flipY = o.flip && (flipBoth || o.flip === 'y') ? -1 : 1;
    var skewX = o.skew && o.skew.length ? o.skew[0] : isFinite(o.skew) ? o.skew : isFinite(o.skewX) ? o.skewX : 0;
    var skewY = o.skew && o.skew.length ? o.skew[1] : isFinite(o.skew) ? o.skew : isFinite(o.skewY) ? o.skewY : 0;
    var scaleX = o.scale && o.scale.length ? o.scale[0] * flipX : isFinite(o.scale) ? o.scale * flipX : isFinite(o.scaleX) ? o.scaleX * flipX : flipX;
    var scaleY = o.scale && o.scale.length ? o.scale[1] * flipY : isFinite(o.scale) ? o.scale * flipY : isFinite(o.scaleY) ? o.scaleY * flipY : flipY;
    var shear = o.shear || 0;
    var theta = o.rotate || o.theta || 0;
    var origin = new Point(o.origin || o.around || o.ox || o.originX, o.oy || o.originY);
    var ox = origin.x;
    var oy = origin.y;
    var position = new Point(o.position || o.px || o.positionX, o.py || o.positionY);
    var px = position.x;
    var py = position.y;
    var translate = new Point(o.translate || o.tx || o.translateX, o.ty || o.translateY);
    var tx = translate.x;
    var ty = translate.y;
    var relative = new Point(o.relative || o.rx || o.relativeX, o.ry || o.relativeY);
    var rx = relative.x;
    var ry = relative.y; // Populate all of the values

    return {
      scaleX,
      scaleY,
      skewX,
      skewY,
      shear,
      theta,
      rx,
      ry,
      tx,
      ty,
      ox,
      oy,
      px,
      py
    };
  } // left matrix, right matrix, target matrix which is overwritten


  static matrixMultiply(l, r, o) {
    // Work out the product directly
    var a = l.a * r.a + l.c * r.b;
    var b = l.b * r.a + l.d * r.b;
    var c = l.a * r.c + l.c * r.d;
    var d = l.b * r.c + l.d * r.d;
    var e = l.e + l.a * r.e + l.c * r.f;
    var f = l.f + l.b * r.e + l.d * r.f; // make sure to use local variables because l/r and o could be the same

    o.a = a;
    o.b = b;
    o.c = c;
    o.d = d;
    o.e = e;
    o.f = f;
    return o;
  }

}
function ctm() {
  return new Matrix(this.node.getCTM());
}
function screenCTM() {
  /* https://bugzilla.mozilla.org/show_bug.cgi?id=1344537
     This is needed because FF does not return the transformation matrix
     for the inner coordinate system when getScreenCTM() is called on nested svgs.
     However all other Browsers do that */
  if (typeof this.isRoot === 'function' && !this.isRoot()) {
    var rect = this.rect(1, 1);
    var m = rect.node.getScreenCTM();
    rect.remove();
    return new Matrix(m);
  }

  return new Matrix(this.node.getScreenCTM());
}
register(Matrix);

function parser() {
  // Reuse cached element if possible
  if (!parser.nodes) {
    let svg = makeInstance().size(2, 0);
    svg.node.style.cssText = ['opacity: 0', 'position: absolute', 'left: -100%', 'top: -100%', 'overflow: hidden'].join(';');
    svg.attr('focusable', 'false');
    let path = svg.path().node;
    parser.nodes = {
      svg,
      path
    };
  }

  if (!parser.nodes.svg.node.parentNode) {
    let b = globals.document.body || globals.document.documentElement;
    parser.nodes.svg.addTo(b);
  }

  return parser.nodes;
}

function isNulledBox(box) {
  return !box.w && !box.h && !box.x && !box.y;
}

function domContains(node) {
  return (globals.document.documentElement.contains || function (node) {
    // This is IE - it does not support contains() for top-level SVGs
    while (node.parentNode) {
      node = node.parentNode;
    }

    return node === document;
  }).call(globals.document.documentElement, node);
}

class Box {
  constructor(...args) {
    this.init(...args);
  }

  init(source) {
    var base = [0, 0, 0, 0];
    source = typeof source === 'string' ? source.split(delimiter).map(parseFloat) : Array.isArray(source) ? source : typeof source === 'object' ? [source.left != null ? source.left : source.x, source.top != null ? source.top : source.y, source.width, source.height] : arguments.length === 4 ? [].slice.call(arguments) : base;
    this.x = source[0] || 0;
    this.y = source[1] || 0;
    this.width = this.w = source[2] || 0;
    this.height = this.h = source[3] || 0; // Add more bounding box properties

    this.x2 = this.x + this.w;
    this.y2 = this.y + this.h;
    this.cx = this.x + this.w / 2;
    this.cy = this.y + this.h / 2;
    return this;
  } // Merge rect box with another, return a new instance


  merge(box) {
    let x = Math.min(this.x, box.x);
    let y = Math.min(this.y, box.y);
    let width = Math.max(this.x + this.width, box.x + box.width) - x;
    let height = Math.max(this.y + this.height, box.y + box.height) - y;
    return new Box(x, y, width, height);
  }

  transform(m) {
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let pts = [new Point(this.x, this.y), new Point(this.x2, this.y), new Point(this.x, this.y2), new Point(this.x2, this.y2)];
    pts.forEach(function (p) {
      p = p.transform(m);
      xMin = Math.min(xMin, p.x);
      xMax = Math.max(xMax, p.x);
      yMin = Math.min(yMin, p.y);
      yMax = Math.max(yMax, p.y);
    });
    return new Box(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  addOffset() {
    // offset by window scroll position, because getBoundingClientRect changes when window is scrolled
    this.x += globals.window.pageXOffset;
    this.y += globals.window.pageYOffset;
    return this;
  }

  toString() {
    return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
  }

  toArray() {
    return [this.x, this.y, this.width, this.height];
  }

  isNulled() {
    return isNulledBox(this);
  }

}

function getBox(cb, retry) {
  let box;

  try {
    box = cb(this.node);

    if (isNulledBox(box) && !domContains(this.node)) {
      throw new Error('Element not in the dom');
    }
  } catch (e) {
    box = retry(this);
  }

  return box;
}

function bbox() {
  return new Box(getBox.call(this, node => node.getBBox(), el => {
    try {
      let clone = el.clone().addTo(parser().svg).show();
      let box = clone.node.getBBox();
      clone.remove();
      return box;
    } catch (e) {
      throw new Error('Getting bbox of element "' + el.node.nodeName + '" is not possible');
    }
  }));
}
function rbox(el) {
  let box = new Box(getBox.call(this, node => node.getBoundingClientRect(), el => {
    throw new Error('Getting rbox of element "' + el.node.nodeName + '" is not possible');
  }));
  if (el) return box.transform(el.screenCTM().inverse());
  return box.addOffset();
}
registerMethods({
  viewbox: {
    viewbox(x, y, width, height) {
      // act as getter
      if (x == null) return new Box(this.attr('viewBox')); // act as setter

      return this.attr('viewBox', new Box(x, y, width, height));
    },

    zoom(level, point$$1) {
      var style = window.getComputedStyle(this.node);
      var width = parseFloat(style.getPropertyValue('width'));
      var height = parseFloat(style.getPropertyValue('height'));
      var v = this.viewbox();
      var zoomX = width / v.width;
      var zoomY = height / v.height;
      var zoom = Math.min(zoomX, zoomY);

      if (level == null) {
        return zoom;
      }

      var zoomAmount = zoom / level;
      if (zoomAmount === Infinity) zoomAmount = Number.MIN_VALUE;
      point$$1 = point$$1 || new Point(width / 2 / zoomX + v.x, height / 2 / zoomY + v.y);
      var box = new Box(v).transform(new Matrix({
        scale: zoomAmount,
        origin: point$$1
      }));
      return this.viewbox(box);
    }

  }
});
register(Box);

/* eslint no-new-func: "off" */
const subClassArray = function () {
  try {
    // try es6 subclassing
    return Function('name', 'baseClass', '_constructor', ['baseClass = baseClass || Array', 'return {', '  [name]: class extends baseClass {', '    constructor (...args) {', '      super(...args)', '      _constructor && _constructor.apply(this, args)', '    }', '  }', '}[name]'].join('\n'));
  } catch (e) {
    // Use es5 approach
    return (name, baseClass = Array, _constructor) => {
      const Arr = function () {
        baseClass.apply(this, arguments);
        _constructor && _constructor.apply(this, arguments);
      };

      Arr.prototype = Object.create(baseClass.prototype);
      Arr.prototype.constructor = Arr;

      Arr.prototype.map = function (fn) {
        const arr = new Arr();
        arr.push.apply(arr, Array.prototype.map.call(this, fn));
        return arr;
      };

      return Arr;
    };
  }
}();

const List = subClassArray('List', Array, function (arr = []) {
  // This catches the case, that native map tries to create an array with new Array(1)
  if (typeof arr === 'number') return this;
  this.length = 0;
  this.push(...arr);
});
extend(List, {
  each(fnOrMethodName, ...args) {
    if (typeof fnOrMethodName === 'function') {
      return this.map(el => {
        return fnOrMethodName.call(el, el);
      });
    } else {
      return this.map(el => {
        return el[fnOrMethodName](...args);
      });
    }
  },

  toArray() {
    return Array.prototype.concat.apply([], this);
  }

});
const reserved = ['toArray', 'constructor', 'each'];

List.extend = function (methods) {
  methods = methods.reduce((obj, name) => {
    // Don't overwrite own methods
    if (reserved.includes(name)) return obj; // Don't add private methods

    if (name[0] === '_') return obj; // Relay every call to each()

    obj[name] = function (...attrs) {
      return this.each(name, ...attrs);
    };

    return obj;
  }, {});
  extend(List, methods);
};

function baseFind(query, parent) {
  return new List(map((parent || globals.document).querySelectorAll(query), function (node) {
    return adopt(node);
  }));
} // Scoped find method

function find(query) {
  return baseFind(query, this.node);
}

class EventTarget extends Base {
  constructor({
    events = {}
  } = {}) {
    super();
    this.events = events;
  }

  addEventListener() {}

  dispatch(event, data) {
    return dispatch(this, event, data);
  }

  dispatchEvent(event) {
    const bag = this.getEventHolder().events;
    if (!bag) return true;
    const events = bag[event.type];

    for (let i in events) {
      for (let j in events[i]) {
        events[i][j](event);
      }
    }

    return !event.defaultPrevented;
  } // Fire given event


  fire(event, data) {
    this.dispatch(event, data);
    return this;
  }

  getEventHolder() {
    return this;
  }

  getEventTarget() {
    return this;
  } // Unbind event from listener


  off(event, listener) {
    off(this, event, listener);
    return this;
  } // Bind given event to listener


  on(event, listener, binding, options) {
    on(this, event, listener, binding, options);
    return this;
  }

  removeEventListener() {}

}
register(EventTarget);

function noop() {} // Default animation values

let timeline = {
  duration: 400,
  ease: '>',
  delay: 0 // Default attribute values

};
let attrs = {
  // fill and stroke
  'fill-opacity': 1,
  'stroke-opacity': 1,
  'stroke-width': 0,
  'stroke-linejoin': 'miter',
  'stroke-linecap': 'butt',
  fill: '#000000',
  stroke: '#000000',
  opacity: 1,
  // position
  x: 0,
  y: 0,
  cx: 0,
  cy: 0,
  // size
  width: 0,
  height: 0,
  // radius
  r: 0,
  rx: 0,
  ry: 0,
  // gradient
  offset: 0,
  'stop-opacity': 1,
  'stop-color': '#000000',
  // text
  'font-size': 16,
  'font-family': 'Helvetica, Arial, sans-serif',
  'text-anchor': 'start'
};

var defaults = ({
  noop: noop,
  timeline: timeline,
  attrs: attrs
});

const SVGArray = subClassArray('SVGArray', Array, function (arr) {
  this.init(arr);
});
extend(SVGArray, {
  init(arr) {
    // This catches the case, that native map tries to create an array with new Array(1)
    if (typeof arr === 'number') return this;
    this.length = 0;
    this.push(...this.parse(arr));
    return this;
  },

  toArray() {
    return Array.prototype.concat.apply([], this);
  },

  toString() {
    return this.join(' ');
  },

  // Flattens the array if needed
  valueOf() {
    const ret = [];
    ret.push(...this);
    return ret;
  },

  // Parse whitespace separated string
  parse(array = []) {
    // If already is an array, no need to parse it
    if (array instanceof Array) return array;
    return array.trim().split(delimiter).map(parseFloat);
  },

  clone() {
    return new this.constructor(this);
  },

  toSet() {
    return new Set(this);
  }

});

class SVGNumber {
  // Initialize
  constructor(...args) {
    this.init(...args);
  }

  init(value, unit) {
    unit = Array.isArray(value) ? value[1] : unit;
    value = Array.isArray(value) ? value[0] : value; // initialize defaults

    this.value = 0;
    this.unit = unit || ''; // parse value

    if (typeof value === 'number') {
      // ensure a valid numeric value
      this.value = isNaN(value) ? 0 : !isFinite(value) ? value < 0 ? -3.4e+38 : +3.4e+38 : value;
    } else if (typeof value === 'string') {
      unit = value.match(numberAndUnit);

      if (unit) {
        // make value numeric
        this.value = parseFloat(unit[1]); // normalize

        if (unit[5] === '%') {
          this.value /= 100;
        } else if (unit[5] === 's') {
          this.value *= 1000;
        } // store unit


        this.unit = unit[5];
      }
    } else {
      if (value instanceof SVGNumber) {
        this.value = value.valueOf();
        this.unit = value.unit;
      }
    }

    return this;
  }

  toString() {
    return (this.unit === '%' ? ~~(this.value * 1e8) / 1e6 : this.unit === 's' ? this.value / 1e3 : this.value) + this.unit;
  }

  toJSON() {
    return this.toString();
  }

  toArray() {
    return [this.value, this.unit];
  }

  valueOf() {
    return this.value;
  } // Add number


  plus(number) {
    number = new SVGNumber(number);
    return new SVGNumber(this + number, this.unit || number.unit);
  } // Subtract number


  minus(number) {
    number = new SVGNumber(number);
    return new SVGNumber(this - number, this.unit || number.unit);
  } // Multiply number


  times(number) {
    number = new SVGNumber(number);
    return new SVGNumber(this * number, this.unit || number.unit);
  } // Divide number


  divide(number) {
    number = new SVGNumber(number);
    return new SVGNumber(this / number, this.unit || number.unit);
  }

}

const hooks = [];
function registerAttrHook(fn) {
  hooks.push(fn);
} // Set svg element attribute

function attr(attr, val, ns) {
  // act as full getter
  if (attr == null) {
    // get an object of attributes
    attr = {};
    val = this.node.attributes;

    for (let node of val) {
      attr[node.nodeName] = isNumber.test(node.nodeValue) ? parseFloat(node.nodeValue) : node.nodeValue;
    }

    return attr;
  } else if (attr instanceof Array) {
    // loop through array and get all values
    return attr.reduce((last, curr) => {
      last[curr] = this.attr(curr);
      return last;
    }, {});
  } else if (typeof attr === 'object' && attr.constructor === Object) {
    // apply every attribute individually if an object is passed
    for (val in attr) this.attr(val, attr[val]);
  } else if (val === null) {
    // remove value
    this.node.removeAttribute(attr);
  } else if (val == null) {
    // act as a getter if the first and only argument is not an object
    val = this.node.getAttribute(attr);
    return val == null ? attrs[attr] : isNumber.test(val) ? parseFloat(val) : val;
  } else {
    // Loop through hooks and execute them to convert value
    val = hooks.reduce((_val, hook) => {
      return hook(attr, _val, this);
    }, val); // ensure correct numeric values (also accepts NaN and Infinity)

    if (typeof val === 'number') {
      val = new SVGNumber(val);
    } else if (Color.isColor(val)) {
      // ensure full hex color
      val = new Color(val);
    } else if (val.constructor === Array) {
      // Check for plain arrays and parse array values
      val = new SVGArray(val);
    } // if the passed attribute is leading...


    if (attr === 'leading') {
      // ... call the leading method instead
      if (this.leading) {
        this.leading(val);
      }
    } else {
      // set given attribute on node
      typeof ns === 'string' ? this.node.setAttributeNS(ns, attr, val.toString()) : this.node.setAttribute(attr, val.toString());
    } // rebuild if required


    if (this.rebuild && (attr === 'font-size' || attr === 'x')) {
      this.rebuild();
    }
  }

  return this;
}

class Dom extends EventTarget {
  constructor(node, attrs) {
    super(node);
    this.node = node;
    this.type = node.nodeName;

    if (attrs && node !== attrs) {
      this.attr(attrs);
    }
  } // Add given element at a position


  add(element, i) {
    element = makeInstance(element);

    if (i == null) {
      this.node.appendChild(element.node);
    } else if (element.node !== this.node.childNodes[i]) {
      this.node.insertBefore(element.node, this.node.childNodes[i]);
    }

    return this;
  } // Add element to given container and return self


  addTo(parent) {
    return makeInstance(parent).put(this);
  } // Returns all child elements


  children() {
    return new List(map(this.node.children, function (node) {
      return adopt(node);
    }));
  } // Remove all elements in this container


  clear() {
    // remove children
    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.lastChild);
    }

    return this;
  } // Clone element


  clone() {
    // write dom data to the dom so the clone can pickup the data
    this.writeDataToDom(); // clone element and assign new id

    return assignNewId(this.node.cloneNode(true));
  } // Iterates over all children and invokes a given block


  each(block, deep) {
    var children = this.children();
    var i, il;

    for (i = 0, il = children.length; i < il; i++) {
      block.apply(children[i], [i, children]);

      if (deep) {
        children[i].each(block, deep);
      }
    }

    return this;
  }

  element(nodeName) {
    return this.put(new Dom(create(nodeName)));
  } // Get first child


  first() {
    return adopt(this.node.firstChild);
  } // Get a element at the given index


  get(i) {
    return adopt(this.node.childNodes[i]);
  }

  getEventHolder() {
    return this.node;
  }

  getEventTarget() {
    return this.node;
  } // Checks if the given element is a child


  has(element) {
    return this.index(element) >= 0;
  } // Get / set id


  id(id) {
    // generate new id if no id set
    if (typeof id === 'undefined' && !this.node.id) {
      this.node.id = eid(this.type);
    } // dont't set directly width this.node.id to make `null` work correctly


    return this.attr('id', id);
  } // Gets index of given element


  index(element) {
    return [].slice.call(this.node.childNodes).indexOf(element.node);
  } // Get the last child


  last() {
    return adopt(this.node.lastChild);
  } // matches the element vs a css selector


  matches(selector) {
    const el = this.node;
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  } // Returns the parent element instance


  parent(type) {
    var parent = this; // check for parent

    if (!parent.node.parentNode) return null; // get parent element

    parent = adopt(parent.node.parentNode);
    if (!type) return parent; // loop trough ancestors if type is given

    while (parent) {
      if (typeof type === 'string' ? parent.matches(type) : parent instanceof type) return parent;
      if (!parent.node.parentNode || parent.node.parentNode.nodeName === '#document' || parent.node.parentNode.nodeName === '#document-fragment') return null; // #759, #720

      parent = adopt(parent.node.parentNode);
    }
  } // Basically does the same as `add()` but returns the added element instead


  put(element, i) {
    this.add(element, i);
    return element;
  } // Add element to given container and return container


  putIn(parent) {
    return makeInstance(parent).add(this);
  } // Remove element


  remove() {
    if (this.parent()) {
      this.parent().removeElement(this);
    }

    return this;
  } // Remove a given child


  removeElement(element) {
    this.node.removeChild(element.node);
    return this;
  } // Replace this with element


  replace(element) {
    element = makeInstance(element);
    this.node.parentNode.replaceChild(element.node, this.node);
    return element;
  }

  round(precision = 2, map$$1) {
    const factor = Math.pow(10, precision);
    const attrs = this.attr(); // If we have no map, build one from attrs

    if (!map$$1) {
      map$$1 = Object.keys(attrs);
    } // Holds rounded attributes


    const newAttrs = {};
    map$$1.forEach(key => {
      newAttrs[key] = Math.round(attrs[key] * factor) / factor;
    });
    this.attr(newAttrs);
    return this;
  } // Return id on string conversion


  toString() {
    return this.id();
  } // Import raw svg


  svg(svgOrFn, outerHTML) {
    var well, len, fragment;

    if (svgOrFn === false) {
      outerHTML = false;
      svgOrFn = null;
    } // act as getter if no svg string is given


    if (svgOrFn == null || typeof svgOrFn === 'function') {
      // The default for exports is, that the outerNode is included
      outerHTML = outerHTML == null ? true : outerHTML; // write svgjs data to the dom

      this.writeDataToDom();
      let current = this; // An export modifier was passed

      if (svgOrFn != null) {
        current = adopt(current.node.cloneNode(true)); // If the user wants outerHTML we need to process this node, too

        if (outerHTML) {
          let result = svgOrFn(current);
          current = result || current; // The user does not want this node? Well, then he gets nothing

          if (result === false) return '';
        } // Deep loop through all children and apply modifier


        current.each(function () {
          let result = svgOrFn(this);

          let _this = result || this; // If modifier returns false, discard node


          if (result === false) {
            this.remove(); // If modifier returns new node, use it
          } else if (result && this !== _this) {
            this.replace(_this);
          }
        }, true);
      } // Return outer or inner content


      return outerHTML ? current.node.outerHTML : current.node.innerHTML;
    } // Act as setter if we got a string
    // The default for import is, that the current node is not replaced


    outerHTML = outerHTML == null ? false : outerHTML; // Create temporary holder

    well = globals.document.createElementNS(ns, 'svg');
    fragment = globals.document.createDocumentFragment(); // Dump raw svg

    well.innerHTML = svgOrFn; // Transplant nodes into the fragment

    for (len = well.children.length; len--;) {
      fragment.appendChild(well.firstElementChild);
    }

    let parent = this.parent(); // Add the whole fragment at once

    return outerHTML ? this.replace(fragment) && parent : this.add(fragment);
  }

  words(text) {
    // This is faster than removing all children and adding a new one
    this.node.textContent = text;
    return this;
  } // write svgjs data to the dom


  writeDataToDom() {
    // dump variables recursively
    this.each(function () {
      this.writeDataToDom();
    });
    return this;
  }

}
extend(Dom, {
  attr,
  find
});
register(Dom);

const Svg = getClass(root);
class Element extends Dom {
  constructor(node, attrs) {
    super(node, attrs); // initialize data object

    this.dom = {}; // create circular reference

    this.node.instance = this;

    if (node.hasAttribute('svgjs:data')) {
      // pull svgjs data from the dom (getAttributeNS doesn't work in html5)
      this.setData(JSON.parse(node.getAttribute('svgjs:data')) || {});
    }
  } // Move element by its center


  center(x, y) {
    return this.cx(x).cy(y);
  } // Move by center over x-axis


  cx(x) {
    return x == null ? this.x() + this.width() / 2 : this.x(x - this.width() / 2);
  } // Move by center over y-axis


  cy(y) {
    return y == null ? this.y() + this.height() / 2 : this.y(y - this.height() / 2);
  } // Get defs


  defs() {
    return this.root().defs();
  } // Relative move over x axis


  dx(x) {
    return this.x(new SVGNumber(x).plus(this.x()));
  } // Relative move over y axis


  dy(y) {
    return this.y(new SVGNumber(y).plus(this.y()));
  } // Get parent document


  root() {
    let p = this.parent(Svg);
    return p && p.root();
  }

  getEventHolder() {
    return this;
  } // Set height of element


  height(height) {
    return this.attr('height', height);
  } // Checks whether the given point inside the bounding box of the element


  inside(x, y) {
    let box = this.bbox();
    return x > box.x && y > box.y && x < box.x + box.width && y < box.y + box.height;
  } // Move element to given x and y values


  move(x, y) {
    return this.x(x).y(y);
  } // return array of all ancestors of given type up to the root svg


  parents(until = globals.document) {
    until = makeInstance(until);
    let parents = new List();
    let parent = this;

    while ((parent = parent.parent()) && parent.node !== until.node && parent.node !== globals.document) {
      parents.push(parent);
    }

    return parents;
  } // Get referenced element form attribute value


  reference(attr) {
    attr = this.attr(attr);
    if (!attr) return null;
    const m = attr.match(reference);
    return m ? makeInstance(m[1]) : null;
  } // set given data to the elements data property


  setData(o) {
    this.dom = o;
    return this;
  } // Set element size to given width and height


  size(width, height) {
    let p = proportionalSize(this, width, height);
    return this.width(new SVGNumber(p.width)).height(new SVGNumber(p.height));
  } // Set width of element


  width(width) {
    return this.attr('width', width);
  } // write svgjs data to the dom


  writeDataToDom() {
    // remove previously set data
    this.node.removeAttribute('svgjs:data');

    if (Object.keys(this.dom).length) {
      this.node.setAttribute('svgjs:data', JSON.stringify(this.dom)); // see #428
    }

    return super.writeDataToDom();
  } // Move over x-axis


  x(x) {
    return this.attr('x', x);
  } // Move over y-axis


  y(y) {
    return this.attr('y', y);
  }

}
extend(Element, {
  bbox,
  rbox,
  point,
  ctm,
  screenCTM
});
register(Element);

var sugar = {
  stroke: ['color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset'],
  fill: ['color', 'opacity', 'rule'],
  prefix: function (t, a) {
    return a === 'color' ? t : t + '-' + a;
  } // Add sugar for fill and stroke

};
['fill', 'stroke'].forEach(function (m) {
  var extension = {};
  var i;

  extension[m] = function (o) {
    if (typeof o === 'undefined') {
      return this.attr(m);
    }

    if (typeof o === 'string' || o instanceof Color || Color.isRgb(o) || o instanceof Element) {
      this.attr(m, o);
    } else {
      // set all attributes from sugar.fill and sugar.stroke list
      for (i = sugar[m].length - 1; i >= 0; i--) {
        if (o[sugar[m][i]] != null) {
          this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]]);
        }
      }
    }

    return this;
  };

  registerMethods(['Element', 'Runner'], extension);
});
registerMethods(['Element', 'Runner'], {
  // Let the user set the matrix directly
  matrix: function (mat, b, c, d, e, f) {
    // Act as a getter
    if (mat == null) {
      return new Matrix(this);
    } // Act as a setter, the user can pass a matrix or a set of numbers


    return this.attr('transform', new Matrix(mat, b, c, d, e, f));
  },
  // Map rotation to transform
  rotate: function (angle, cx, cy) {
    return this.transform({
      rotate: angle,
      ox: cx,
      oy: cy
    }, true);
  },
  // Map skew to transform
  skew: function (x, y, cx, cy) {
    return arguments.length === 1 || arguments.length === 3 ? this.transform({
      skew: x,
      ox: y,
      oy: cx
    }, true) : this.transform({
      skew: [x, y],
      ox: cx,
      oy: cy
    }, true);
  },
  shear: function (lam, cx, cy) {
    return this.transform({
      shear: lam,
      ox: cx,
      oy: cy
    }, true);
  },
  // Map scale to transform
  scale: function (x, y, cx, cy) {
    return arguments.length === 1 || arguments.length === 3 ? this.transform({
      scale: x,
      ox: y,
      oy: cx
    }, true) : this.transform({
      scale: [x, y],
      ox: cx,
      oy: cy
    }, true);
  },
  // Map translate to transform
  translate: function (x, y) {
    return this.transform({
      translate: [x, y]
    }, true);
  },
  // Map relative translations to transform
  relative: function (x, y) {
    return this.transform({
      relative: [x, y]
    }, true);
  },
  // Map flip to transform
  flip: function (direction, around) {
    var directionString = typeof direction === 'string' ? direction : isFinite(direction) ? 'both' : 'both';
    var origin = direction === 'both' && isFinite(around) ? [around, around] : direction === 'x' ? [around, 0] : direction === 'y' ? [0, around] : isFinite(direction) ? [direction, direction] : [0, 0];
    return this.transform({
      flip: directionString,
      origin: origin
    }, true);
  },
  // Opacity
  opacity: function (value) {
    return this.attr('opacity', value);
  },
  // Relative move over x and y axes
  dmove: function (x, y) {
    return this.dx(x).dy(y);
  }
});
registerMethods('radius', {
  // Add x and y radius
  radius: function (x, y) {
    var type = (this._element || this).type;
    return type === 'radialGradient' || type === 'radialGradient' ? this.attr('r', new SVGNumber(x)) : this.rx(x).ry(y == null ? x : y);
  }
});
registerMethods('Path', {
  // Get path length
  length: function () {
    return this.node.getTotalLength();
  },
  // Get point at length
  pointAt: function (length) {
    return new Point(this.node.getPointAtLength(length));
  }
});
registerMethods(['Element', 'Runner'], {
  // Set font
  font: function (a, v) {
    if (typeof a === 'object') {
      for (v in a) this.font(v, a[v]);
    }

    return a === 'leading' ? this.leading(v) : a === 'anchor' ? this.attr('text-anchor', v) : a === 'size' || a === 'family' || a === 'weight' || a === 'stretch' || a === 'variant' || a === 'style' ? this.attr('font-' + a, v) : this.attr(a, v);
  }
});
registerMethods('Text', {
  ax(x) {
    return this.attr('x', x);
  },

  ay(y) {
    return this.attr('y', y);
  },

  amove(x, y) {
    return this.ax(x).ay(y);
  }

}); // Add events to elements

const methods$1 = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'touchstart', 'touchmove', 'touchleave', 'touchend', 'touchcancel'].reduce(function (last, event) {
  // add event to Element
  const fn = function (f) {
    if (f === null) {
      off(this, event);
    } else {
      on(this, event, f);
    }

    return this;
  };

  last[event] = fn;
  return last;
}, {});
registerMethods('Element', methods$1);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function untransform() {
  return this.attr('transform', null);
} // merge the whole transformation chain into one matrix and returns it

function matrixify() {
  var matrix = (this.attr('transform') || ''). // split transformations
  split(transforms).slice(0, -1).map(function (str) {
    // generate key => value pairs
    var kv = str.trim().split('(');
    return [kv[0], kv[1].split(delimiter).map(function (str) {
      return parseFloat(str);
    })];
  }).reverse() // merge every transformation into one matrix
  .reduce(function (matrix, transform) {
    if (transform[0] === 'matrix') {
      return matrix.lmultiply(Matrix.fromArray(transform[1]));
    }

    return matrix[transform[0]].apply(matrix, transform[1]);
  }, new Matrix());
  return matrix;
} // add an element to another parent without changing the visual representation on the screen

function toParent(parent) {
  if (this === parent) return this;
  var ctm$$1 = this.screenCTM();
  var pCtm = parent.screenCTM().inverse();
  this.addTo(parent).untransform().transform(pCtm.multiply(ctm$$1));
  return this;
} // same as above with parent equals root-svg

function toRoot() {
  return this.toParent(this.root());
} // Add transformations

function transform(o, relative) {
  // Act as a getter if no object was passed
  if (o == null || typeof o === 'string') {
    var decomposed = new Matrix(this).decompose();
    return decomposed[o] || decomposed;
  }

  if (!Matrix.isMatrixLike(o)) {
    // Set the origin according to the defined transform
    o = _objectSpread({}, o, {
      origin: getOrigin(o, this)
    });
  } // The user can pass a boolean, an Element or an Matrix or nothing


  var cleanRelative = relative === true ? this : relative || false;
  var result = new Matrix(cleanRelative).transform(o);
  return this.attr('transform', result);
}
registerMethods('Element', {
  untransform,
  matrixify,
  toParent,
  toRoot,
  transform
});

function rx(rx) {
  return this.attr('rx', rx);
} // Radius y value

function ry(ry) {
  return this.attr('ry', ry);
} // Move over x-axis

function x(x) {
  return x == null ? this.cx() - this.rx() : this.cx(x + this.rx());
} // Move over y-axis

function y(y) {
  return y == null ? this.cy() - this.ry() : this.cy(y + this.ry());
} // Move by center over x-axis

function cx(x) {
  return x == null ? this.attr('cx') : this.attr('cx', x);
} // Move by center over y-axis

function cy(y) {
  return y == null ? this.attr('cy') : this.attr('cy', y);
} // Set width of element

function width(width) {
  return width == null ? this.rx() * 2 : this.rx(new SVGNumber(width).divide(2));
} // Set height of element

function height(height) {
  return height == null ? this.ry() * 2 : this.ry(new SVGNumber(height).divide(2));
}

var circled = ({
  rx: rx,
  ry: ry,
  x: x,
  y: y,
  cx: cx,
  cy: cy,
  width: width,
  height: height
});

class Shape extends Element {}
register(Shape);

class Circle extends Shape {
  constructor(node) {
    super(nodeOrNew('circle', node), node);
  }

  radius(r) {
    return this.attr('r', r);
  } // Radius x value


  rx(rx$$1) {
    return this.attr('r', rx$$1);
  } // Alias radius x value


  ry(ry$$1) {
    return this.rx(ry$$1);
  }

  size(size) {
    return this.radius(new SVGNumber(size).divide(2));
  }

}
extend(Circle, {
  x,
  y,
  cx,
  cy,
  width,
  height
});
registerMethods({
  Element: {
    // Create circle element
    circle: wrapWithAttrCheck(function (size) {
      return this.put(new Circle()).size(size).move(0, 0);
    })
  }
});
register(Circle);

class Container extends Element {
  flatten(parent) {
    this.each(function () {
      if (this instanceof Container) return this.flatten(parent).ungroup(parent);
      return this.toParent(parent);
    }); // we need this so that the root does not get removed

    this.node.firstElementChild || this.remove();
    return this;
  }

  ungroup(parent) {
    parent = parent || this.parent();
    this.each(function () {
      return this.toParent(parent);
    });
    this.remove();
    return this;
  }

}
register(Container);

class Defs extends Container {
  constructor(node) {
    super(nodeOrNew('defs', node), node);
  }

  flatten() {
    return this;
  }

  ungroup() {
    return this;
  }

}
register(Defs);

class Ellipse extends Shape {
  constructor(node) {
    super(nodeOrNew('ellipse', node), node);
  }

  size(width$$1, height$$1) {
    var p = proportionalSize(this, width$$1, height$$1);
    return this.rx(new SVGNumber(p.width).divide(2)).ry(new SVGNumber(p.height).divide(2));
  }

}
extend(Ellipse, circled);
registerMethods('Container', {
  // Create an ellipse
  ellipse: wrapWithAttrCheck(function (width$$1, height$$1) {
    return this.put(new Ellipse()).size(width$$1, height$$1).move(0, 0);
  })
});
register(Ellipse);

class Stop extends Element {
  constructor(node) {
    super(nodeOrNew('stop', node), node);
  } // add color stops


  update(o) {
    if (typeof o === 'number' || o instanceof SVGNumber) {
      o = {
        offset: arguments[0],
        color: arguments[1],
        opacity: arguments[2]
      };
    } // set attributes


    if (o.opacity != null) this.attr('stop-opacity', o.opacity);
    if (o.color != null) this.attr('stop-color', o.color);
    if (o.offset != null) this.attr('offset', new SVGNumber(o.offset));
    return this;
  }

}
register(Stop);

function from(x, y) {
  return (this._element || this).type === 'radialGradient' ? this.attr({
    fx: new SVGNumber(x),
    fy: new SVGNumber(y)
  }) : this.attr({
    x1: new SVGNumber(x),
    y1: new SVGNumber(y)
  });
}
function to(x, y) {
  return (this._element || this).type === 'radialGradient' ? this.attr({
    cx: new SVGNumber(x),
    cy: new SVGNumber(y)
  }) : this.attr({
    x2: new SVGNumber(x),
    y2: new SVGNumber(y)
  });
}

var gradiented = ({
  from: from,
  to: to
});

class Gradient extends Container {
  constructor(type, attrs) {
    super(nodeOrNew(type + 'Gradient', typeof type === 'string' ? null : type), attrs);
  } // Add a color stop


  stop(offset, color, opacity) {
    return this.put(new Stop()).update(offset, color, opacity);
  } // Update gradient


  update(block) {
    // remove all stops
    this.clear(); // invoke passed block

    if (typeof block === 'function') {
      block.call(this, this);
    }

    return this;
  } // Return the fill id


  url() {
    return 'url(#' + this.id() + ')';
  } // Alias string convertion to fill


  toString() {
    return this.url();
  } // custom attr to handle transform


  attr(a, b, c) {
    if (a === 'transform') a = 'gradientTransform';
    return super.attr(a, b, c);
  }

  targets() {
    return baseFind('svg [fill*="' + this.id() + '"]');
  }

  bbox() {
    return new Box();
  }

}
extend(Gradient, gradiented);
registerMethods({
  Container: {
    // Create gradient element in defs
    gradient: wrapWithAttrCheck(function (type, block) {
      return this.defs().gradient(type, block);
    })
  },
  // define gradient
  Defs: {
    gradient: wrapWithAttrCheck(function (type, block) {
      return this.put(new Gradient(type)).update(block);
    })
  }
});
register(Gradient);

class Pattern extends Container {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('pattern', node), node);
  } // Return the fill id


  url() {
    return 'url(#' + this.id() + ')';
  } // Update pattern by rebuilding


  update(block) {
    // remove content
    this.clear(); // invoke passed block

    if (typeof block === 'function') {
      block.call(this, this);
    }

    return this;
  } // Alias string convertion to fill


  toString() {
    return this.url();
  } // custom attr to handle transform


  attr(a, b, c) {
    if (a === 'transform') a = 'patternTransform';
    return super.attr(a, b, c);
  }

  targets() {
    return baseFind('svg [fill*="' + this.id() + '"]');
  }

  bbox() {
    return new Box();
  }

}
registerMethods({
  Container: {
    // Create pattern element in defs
    pattern(...args) {
      return this.defs().pattern(...args);
    }

  },
  Defs: {
    pattern: wrapWithAttrCheck(function (width, height, block) {
      return this.put(new Pattern()).update(block).attr({
        x: 0,
        y: 0,
        width: width,
        height: height,
        patternUnits: 'userSpaceOnUse'
      });
    })
  }
});
register(Pattern);

class Image extends Shape {
  constructor(node) {
    super(nodeOrNew('image', node), node);
  } // (re)load image


  load(url, callback) {
    if (!url) return this;
    var img = new globals.window.Image();
    on(img, 'load', function (e) {
      var p = this.parent(Pattern); // ensure image size

      if (this.width() === 0 && this.height() === 0) {
        this.size(img.width, img.height);
      }

      if (p instanceof Pattern) {
        // ensure pattern size if not set
        if (p.width() === 0 && p.height() === 0) {
          p.size(this.width(), this.height());
        }
      }

      if (typeof callback === 'function') {
        callback.call(this, e);
      }
    }, this);
    on(img, 'load error', function () {
      // dont forget to unbind memory leaking events
      off(img);
    });
    return this.attr('href', img.src = url, xlink);
  }

}
registerAttrHook(function (attr$$1, val, _this) {
  // convert image fill and stroke to patterns
  if (attr$$1 === 'fill' || attr$$1 === 'stroke') {
    if (isImage.test(val)) {
      val = _this.root().defs().image(val);
    }
  }

  if (val instanceof Image) {
    val = _this.root().defs().pattern(0, 0, pattern => {
      pattern.add(val);
    });
  }

  return val;
});
registerMethods({
  Container: {
    // create image element, load image and set its size
    image: wrapWithAttrCheck(function (source, callback) {
      return this.put(new Image()).size(0, 0).load(source, callback);
    })
  }
});
register(Image);

const PointArray = subClassArray('PointArray', SVGArray);
extend(PointArray, {
  // Convert array to string
  toString() {
    // convert to a poly point string
    for (var i = 0, il = this.length, array = []; i < il; i++) {
      array.push(this[i].join(','));
    }

    return array.join(' ');
  },

  // Convert array to line object
  toLine() {
    return {
      x1: this[0][0],
      y1: this[0][1],
      x2: this[1][0],
      y2: this[1][1]
    };
  },

  // Get morphed array at given position
  at(pos) {
    // make sure a destination is defined
    if (!this.destination) return this; // generate morphed point string

    for (var i = 0, il = this.length, array = []; i < il; i++) {
      array.push([this[i][0] + (this.destination[i][0] - this[i][0]) * pos, this[i][1] + (this.destination[i][1] - this[i][1]) * pos]);
    }

    return new PointArray(array);
  },

  // Parse point string and flat array
  parse(array = [[0, 0]]) {
    var points = []; // if it is an array

    if (array instanceof Array) {
      // and it is not flat, there is no need to parse it
      if (array[0] instanceof Array) {
        return array;
      }
    } else {
      // Else, it is considered as a string
      // parse points
      array = array.trim().split(delimiter).map(parseFloat);
    } // validate points - https://svgwg.org/svg2-draft/shapes.html#DataTypePoints
    // Odd number of coordinates is an error. In such cases, drop the last odd coordinate.


    if (array.length % 2 !== 0) array.pop(); // wrap points in two-tuples and parse points as floats

    for (var i = 0, len = array.length; i < len; i = i + 2) {
      points.push([array[i], array[i + 1]]);
    }

    return points;
  },

  // Move point string
  move(x, y) {
    var box = this.bbox(); // get relative offset

    x -= box.x;
    y -= box.y; // move every point

    if (!isNaN(x) && !isNaN(y)) {
      for (var i = this.length - 1; i >= 0; i--) {
        this[i] = [this[i][0] + x, this[i][1] + y];
      }
    }

    return this;
  },

  // Resize poly string
  size(width, height) {
    var i;
    var box = this.bbox(); // recalculate position of all points according to new size

    for (i = this.length - 1; i >= 0; i--) {
      if (box.width) this[i][0] = (this[i][0] - box.x) * width / box.width + box.x;
      if (box.height) this[i][1] = (this[i][1] - box.y) * height / box.height + box.y;
    }

    return this;
  },

  // Get bounding box of points
  bbox() {
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;
    this.forEach(function (el) {
      maxX = Math.max(el[0], maxX);
      maxY = Math.max(el[1], maxY);
      minX = Math.min(el[0], minX);
      minY = Math.min(el[1], minY);
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

});

let MorphArray = PointArray; // Move by left top corner over x-axis

function x$1(x) {
  return x == null ? this.bbox().x : this.move(x, this.bbox().y);
} // Move by left top corner over y-axis

function y$1(y) {
  return y == null ? this.bbox().y : this.move(this.bbox().x, y);
} // Set width of element

function width$1(width) {
  let b = this.bbox();
  return width == null ? b.width : this.size(width, b.height);
} // Set height of element

function height$1(height) {
  let b = this.bbox();
  return height == null ? b.height : this.size(b.width, height);
}

var pointed = ({
  MorphArray: MorphArray,
  x: x$1,
  y: y$1,
  width: width$1,
  height: height$1
});

class Line extends Shape {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('line', node), node);
  } // Get array


  array() {
    return new PointArray([[this.attr('x1'), this.attr('y1')], [this.attr('x2'), this.attr('y2')]]);
  } // Overwrite native plot() method


  plot(x1, y1, x2, y2) {
    if (x1 == null) {
      return this.array();
    } else if (typeof y1 !== 'undefined') {
      x1 = {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      };
    } else {
      x1 = new PointArray(x1).toLine();
    }

    return this.attr(x1);
  } // Move by left top corner


  move(x, y) {
    return this.attr(this.array().move(x, y).toLine());
  } // Set element size to given width and height


  size(width, height) {
    var p = proportionalSize(this, width, height);
    return this.attr(this.array().size(p.width, p.height).toLine());
  }

}
extend(Line, pointed);
registerMethods({
  Container: {
    // Create a line element
    line: wrapWithAttrCheck(function (...args) {
      // make sure plot is called as a setter
      // x1 is not necessarily a number, it can also be an array, a string and a PointArray
      return Line.prototype.plot.apply(this.put(new Line()), args[0] != null ? args : [0, 0, 0, 0]);
    })
  }
});
register(Line);

class Marker extends Container {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('marker', node), node);
  } // Set width of element


  width(width) {
    return this.attr('markerWidth', width);
  } // Set height of element


  height(height) {
    return this.attr('markerHeight', height);
  } // Set marker refX and refY


  ref(x, y) {
    return this.attr('refX', x).attr('refY', y);
  } // Update marker


  update(block) {
    // remove all content
    this.clear(); // invoke passed block

    if (typeof block === 'function') {
      block.call(this, this);
    }

    return this;
  } // Return the fill id


  toString() {
    return 'url(#' + this.id() + ')';
  }

}
registerMethods({
  Container: {
    marker(...args) {
      // Create marker element in defs
      return this.defs().marker(...args);
    }

  },
  Defs: {
    // Create marker
    marker: wrapWithAttrCheck(function (width, height, block) {
      // Set default viewbox to match the width and height, set ref to cx and cy and set orient to auto
      return this.put(new Marker()).size(width, height).ref(width / 2, height / 2).viewbox(0, 0, width, height).attr('orient', 'auto').update(block);
    })
  },
  marker: {
    // Create and attach markers
    marker(marker, width, height, block) {
      var attr = ['marker']; // Build attribute name

      if (marker !== 'all') attr.push(marker);
      attr = attr.join('-'); // Set marker attribute

      marker = arguments[1] instanceof Marker ? arguments[1] : this.defs().marker(width, height, block);
      return this.attr(attr, marker);
    }

  }
});
register(Marker);

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document$1 = _global.document;
// typeof document.createElement is 'object' in old IE
var is$1 = _isObject(document$1) && _isObject(document$1.createElement);
var _domCreate = function (it) {
  return is$1 ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _redefine = createCommonjsModule(function (module) {
var SRC = _uid('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

_core.inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === _global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    _hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    _hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // extend global
    if (target) _redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
_global.core = _core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// 7.1.13 ToObject(argument)

var _toObject = function (it) {
  return Object(_defined(it));
};

var _strictMethod = function (method, arg) {
  return !!method && _fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};

var $sort = [].sort;
var test = [1, 2, 3];

_export(_export.P + _export.F * (_fails(function () {
  // IE8-
  test.sort(undefined);
}) || !_fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !_strictMethod($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(_toObject(this))
      : $sort.call(_toObject(this), _aFunction(comparefn));
  }
});

/***
Base Class
==========
The base stepper class that will be
***/

function makeSetterGetter(k, f) {
  return function (v) {
    if (v == null) return this[v];
    this[k] = v;
    if (f) f.call(this);
    return this;
  };
}

let easing = {
  '-': function (pos) {
    return pos;
  },
  '<>': function (pos) {
    return -Math.cos(pos * Math.PI) / 2 + 0.5;
  },
  '>': function (pos) {
    return Math.sin(pos * Math.PI / 2);
  },
  '<': function (pos) {
    return -Math.cos(pos * Math.PI / 2) + 1;
  },
  bezier: function (x1, y1, x2, y2) {
    // see https://www.w3.org/TR/css-easing-1/#cubic-bezier-algo
    return function (t) {
      if (t < 0) {
        if (x1 > 0) {
          return y1 / x1 * t;
        } else if (x2 > 0) {
          return y2 / x2 * t;
        } else {
          return 0;
        }
      } else if (t > 1) {
        if (x2 < 1) {
          return (1 - y2) / (1 - x2) * t + (y2 - x2) / (1 - x2);
        } else if (x1 < 1) {
          return (1 - y1) / (1 - x1) * t + (y1 - x1) / (1 - x1);
        } else {
          return 1;
        }
      } else {
        return 3 * t * Math.pow(1 - t, 2) * y1 + 3 * Math.pow(t, 2) * (1 - t) * y2 + Math.pow(t, 3);
      }
    };
  },
  // see https://www.w3.org/TR/css-easing-1/#step-timing-function-algo
  steps: function (steps, stepPosition = 'end') {
    // deal with "jump-" prefix
    stepPosition = stepPosition.split('-').reverse()[0];
    let jumps = steps;

    if (stepPosition === 'none') {
      --jumps;
    } else if (stepPosition === 'both') {
      ++jumps;
    } // The beforeFlag is essentially useless


    return (t, beforeFlag = false) => {
      // Step is called currentStep in referenced url
      let step = Math.floor(t * steps);
      const jumping = t * step % 1 === 0;

      if (stepPosition === 'start' || stepPosition === 'both') {
        ++step;
      }

      if (beforeFlag && jumping) {
        --step;
      }

      if (t >= 0 && step < 0) {
        step = 0;
      }

      if (t <= 1 && step > jumps) {
        step = jumps;
      }

      return step / jumps;
    };
  }
};
class Stepper {
  done() {
    return false;
  }

}
/***
Easing Functions
================
***/

class Ease extends Stepper {
  constructor(fn) {
    super();
    this.ease = easing[fn || timeline.ease] || fn;
  }

  step(from, to, pos) {
    if (typeof from !== 'number') {
      return pos < 1 ? from : to;
    }

    return from + (to - from) * this.ease(pos);
  }

}
/***
Controller Types
================
***/

class Controller extends Stepper {
  constructor(fn) {
    super();
    this.stepper = fn;
  }

  step(current, target, dt, c) {
    return this.stepper(current, target, dt, c);
  }

  done(c) {
    return c.done;
  }

}

function recalculate() {
  // Apply the default parameters
  var duration = (this._duration || 500) / 1000;
  var overshoot = this._overshoot || 0; // Calculate the PID natural response

  var eps = 1e-10;
  var pi = Math.PI;
  var os = Math.log(overshoot / 100 + eps);
  var zeta = -os / Math.sqrt(pi * pi + os * os);
  var wn = 3.9 / (zeta * duration); // Calculate the Spring values

  this.d = 2 * zeta * wn;
  this.k = wn * wn;
}

class Spring extends Controller {
  constructor(duration, overshoot) {
    super();
    this.duration(duration || 500).overshoot(overshoot || 0);
  }

  step(current, target, dt, c) {
    if (typeof current === 'string') return current;
    c.done = dt === Infinity;
    if (dt === Infinity) return target;
    if (dt === 0) return current;
    if (dt > 100) dt = 16;
    dt /= 1000; // Get the previous velocity

    var velocity = c.velocity || 0; // Apply the control to get the new position and store it

    var acceleration = -this.d * velocity - this.k * (current - target);
    var newPosition = current + velocity * dt + acceleration * dt * dt / 2; // Store the velocity

    c.velocity = velocity + acceleration * dt; // Figure out if we have converged, and if so, pass the value

    c.done = Math.abs(target - newPosition) + Math.abs(velocity) < 0.002;
    return c.done ? target : newPosition;
  }

}
extend(Spring, {
  duration: makeSetterGetter('_duration', recalculate),
  overshoot: makeSetterGetter('_overshoot', recalculate)
});
class PID extends Controller {
  constructor(p, i, d, windup) {
    super();
    p = p == null ? 0.1 : p;
    i = i == null ? 0.01 : i;
    d = d == null ? 0 : d;
    windup = windup == null ? 1000 : windup;
    this.p(p).i(i).d(d).windup(windup);
  }

  step(current, target, dt, c) {
    if (typeof current === 'string') return current;
    c.done = dt === Infinity;
    if (dt === Infinity) return target;
    if (dt === 0) return current;
    var p = target - current;
    var i = (c.integral || 0) + p * dt;
    var d = (p - (c.error || 0)) / dt;
    var windup = this.windup; // antiwindup

    if (windup !== false) {
      i = Math.max(-windup, Math.min(i, windup));
    }

    c.error = p;
    c.integral = i;
    c.done = Math.abs(p) < 0.001;
    return c.done ? target : current + (this.P * p + this.I * i + this.D * d);
  }

}
extend(PID, {
  windup: makeSetterGetter('windup'),
  p: makeSetterGetter('P'),
  i: makeSetterGetter('I'),
  d: makeSetterGetter('D')
});

const PathArray = subClassArray('PathArray', SVGArray);
function pathRegReplace(a, b, c, d) {
  return c + d.replace(dots, ' .');
}

function arrayToString(a) {
  for (var i = 0, il = a.length, s = ''; i < il; i++) {
    s += a[i][0];

    if (a[i][1] != null) {
      s += a[i][1];

      if (a[i][2] != null) {
        s += ' ';
        s += a[i][2];

        if (a[i][3] != null) {
          s += ' ';
          s += a[i][3];
          s += ' ';
          s += a[i][4];

          if (a[i][5] != null) {
            s += ' ';
            s += a[i][5];
            s += ' ';
            s += a[i][6];

            if (a[i][7] != null) {
              s += ' ';
              s += a[i][7];
            }
          }
        }
      }
    }
  }

  return s + ' ';
}

const pathHandlers = {
  M: function (c, p, p0) {
    p.x = p0.x = c[0];
    p.y = p0.y = c[1];
    return ['M', p.x, p.y];
  },
  L: function (c, p) {
    p.x = c[0];
    p.y = c[1];
    return ['L', c[0], c[1]];
  },
  H: function (c, p) {
    p.x = c[0];
    return ['H', c[0]];
  },
  V: function (c, p) {
    p.y = c[0];
    return ['V', c[0]];
  },
  C: function (c, p) {
    p.x = c[4];
    p.y = c[5];
    return ['C', c[0], c[1], c[2], c[3], c[4], c[5]];
  },
  S: function (c, p) {
    p.x = c[2];
    p.y = c[3];
    return ['S', c[0], c[1], c[2], c[3]];
  },
  Q: function (c, p) {
    p.x = c[2];
    p.y = c[3];
    return ['Q', c[0], c[1], c[2], c[3]];
  },
  T: function (c, p) {
    p.x = c[0];
    p.y = c[1];
    return ['T', c[0], c[1]];
  },
  Z: function (c, p, p0) {
    p.x = p0.x;
    p.y = p0.y;
    return ['Z'];
  },
  A: function (c, p) {
    p.x = c[5];
    p.y = c[6];
    return ['A', c[0], c[1], c[2], c[3], c[4], c[5], c[6]];
  }
};
let mlhvqtcsaz = 'mlhvqtcsaz'.split('');

for (var i = 0, il = mlhvqtcsaz.length; i < il; ++i) {
  pathHandlers[mlhvqtcsaz[i]] = function (i) {
    return function (c, p, p0) {
      if (i === 'H') c[0] = c[0] + p.x;else if (i === 'V') c[0] = c[0] + p.y;else if (i === 'A') {
        c[5] = c[5] + p.x;
        c[6] = c[6] + p.y;
      } else {
        for (var j = 0, jl = c.length; j < jl; ++j) {
          c[j] = c[j] + (j % 2 ? p.y : p.x);
        }
      }
      return pathHandlers[i](c, p, p0);
    };
  }(mlhvqtcsaz[i].toUpperCase());
}

extend(PathArray, {
  // Convert array to string
  toString() {
    return arrayToString(this);
  },

  // Move path string
  move(x, y) {
    // get bounding box of current situation
    var box = this.bbox(); // get relative offset

    x -= box.x;
    y -= box.y;

    if (!isNaN(x) && !isNaN(y)) {
      // move every point
      for (var l, i = this.length - 1; i >= 0; i--) {
        l = this[i][0];

        if (l === 'M' || l === 'L' || l === 'T') {
          this[i][1] += x;
          this[i][2] += y;
        } else if (l === 'H') {
          this[i][1] += x;
        } else if (l === 'V') {
          this[i][1] += y;
        } else if (l === 'C' || l === 'S' || l === 'Q') {
          this[i][1] += x;
          this[i][2] += y;
          this[i][3] += x;
          this[i][4] += y;

          if (l === 'C') {
            this[i][5] += x;
            this[i][6] += y;
          }
        } else if (l === 'A') {
          this[i][6] += x;
          this[i][7] += y;
        }
      }
    }

    return this;
  },

  // Resize path string
  size(width, height) {
    // get bounding box of current situation
    var box = this.bbox();
    var i, l; // recalculate position of all points according to new size

    for (i = this.length - 1; i >= 0; i--) {
      l = this[i][0];

      if (l === 'M' || l === 'L' || l === 'T') {
        this[i][1] = (this[i][1] - box.x) * width / box.width + box.x;
        this[i][2] = (this[i][2] - box.y) * height / box.height + box.y;
      } else if (l === 'H') {
        this[i][1] = (this[i][1] - box.x) * width / box.width + box.x;
      } else if (l === 'V') {
        this[i][1] = (this[i][1] - box.y) * height / box.height + box.y;
      } else if (l === 'C' || l === 'S' || l === 'Q') {
        this[i][1] = (this[i][1] - box.x) * width / box.width + box.x;
        this[i][2] = (this[i][2] - box.y) * height / box.height + box.y;
        this[i][3] = (this[i][3] - box.x) * width / box.width + box.x;
        this[i][4] = (this[i][4] - box.y) * height / box.height + box.y;

        if (l === 'C') {
          this[i][5] = (this[i][5] - box.x) * width / box.width + box.x;
          this[i][6] = (this[i][6] - box.y) * height / box.height + box.y;
        }
      } else if (l === 'A') {
        // resize radii
        this[i][1] = this[i][1] * width / box.width;
        this[i][2] = this[i][2] * height / box.height; // move position values

        this[i][6] = (this[i][6] - box.x) * width / box.width + box.x;
        this[i][7] = (this[i][7] - box.y) * height / box.height + box.y;
      }
    }

    return this;
  },

  // Test if the passed path array use the same path data commands as this path array
  equalCommands(pathArray) {
    var i, il, equalCommands;
    pathArray = new PathArray(pathArray);
    equalCommands = this.length === pathArray.length;

    for (i = 0, il = this.length; equalCommands && i < il; i++) {
      equalCommands = this[i][0] === pathArray[i][0];
    }

    return equalCommands;
  },

  // Make path array morphable
  morph(pathArray) {
    pathArray = new PathArray(pathArray);

    if (this.equalCommands(pathArray)) {
      this.destination = pathArray;
    } else {
      this.destination = null;
    }

    return this;
  },

  // Get morphed path array at given position
  at(pos) {
    // make sure a destination is defined
    if (!this.destination) return this;
    var sourceArray = this;
    var destinationArray = this.destination.value;
    var array = [];
    var pathArray = new PathArray();
    var i, il, j, jl; // Animate has specified in the SVG spec
    // See: https://www.w3.org/TR/SVG11/paths.html#PathElement

    for (i = 0, il = sourceArray.length; i < il; i++) {
      array[i] = [sourceArray[i][0]];

      for (j = 1, jl = sourceArray[i].length; j < jl; j++) {
        array[i][j] = sourceArray[i][j] + (destinationArray[i][j] - sourceArray[i][j]) * pos;
      } // For the two flags of the elliptical arc command, the SVG spec say:
      // Flags and booleans are interpolated as fractions between zero and one, with any non-zero value considered to be a value of one/true
      // Elliptical arc command as an array followed by corresponding indexes:
      // ['A', rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y]
      //   0    1   2        3                 4             5      6  7


      if (array[i][0] === 'A') {
        array[i][4] = +(array[i][4] !== 0);
        array[i][5] = +(array[i][5] !== 0);
      }
    } // Directly modify the value of a path array, this is done this way for performance


    pathArray.value = array;
    return pathArray;
  },

  // Absolutize and parse path to array
  parse(array = [['M', 0, 0]]) {
    // if it's already a patharray, no need to parse it
    if (array instanceof PathArray) return array; // prepare for parsing

    var s;
    var paramCnt = {
      'M': 2,
      'L': 2,
      'H': 1,
      'V': 1,
      'C': 6,
      'S': 4,
      'Q': 4,
      'T': 2,
      'A': 7,
      'Z': 0
    };

    if (typeof array === 'string') {
      array = array.replace(numbersWithDots, pathRegReplace) // convert 45.123.123 to 45.123 .123
      .replace(pathLetters, ' $& ') // put some room between letters and numbers
      .replace(hyphen, '$1 -') // add space before hyphen
      .trim() // trim
      .split(delimiter); // split into array
    } else {
      array = array.reduce(function (prev, curr) {
        return [].concat.call(prev, curr);
      }, []);
    } // array now is an array containing all parts of a path e.g. ['M', '0', '0', 'L', '30', '30' ...]


    var result = [];
    var p = new Point();
    var p0 = new Point();
    var index = 0;
    var len = array.length;

    do {
      // Test if we have a path letter
      if (isPathLetter.test(array[index])) {
        s = array[index];
        ++index; // If last letter was a move command and we got no new, it defaults to [L]ine
      } else if (s === 'M') {
        s = 'L';
      } else if (s === 'm') {
        s = 'l';
      }

      result.push(pathHandlers[s].call(null, array.slice(index, index = index + paramCnt[s.toUpperCase()]).map(parseFloat), p, p0));
    } while (len > index);

    return result;
  },

  // Get bounding box of path
  bbox() {
    parser().path.setAttribute('d', this.toString());
    return parser.nodes.path.getBBox();
  }

});

class Morphable {
  constructor(stepper) {
    this._stepper = stepper || new Ease('-');
    this._from = null;
    this._to = null;
    this._type = null;
    this._context = null;
    this._morphObj = null;
  }

  from(val) {
    if (val == null) {
      return this._from;
    }

    this._from = this._set(val);
    return this;
  }

  to(val) {
    if (val == null) {
      return this._to;
    }

    this._to = this._set(val);
    return this;
  }

  type(type) {
    // getter
    if (type == null) {
      return this._type;
    } // setter


    this._type = type;
    return this;
  }

  _set(value) {
    if (!this._type) {
      var type = typeof value;

      if (type === 'number') {
        this.type(SVGNumber);
      } else if (type === 'string') {
        if (Color.isColor(value)) {
          this.type(Color);
        } else if (delimiter.test(value)) {
          this.type(pathLetters.test(value) ? PathArray : SVGArray);
        } else if (numberAndUnit.test(value)) {
          this.type(SVGNumber);
        } else {
          this.type(NonMorphable);
        }
      } else if (morphableTypes.indexOf(value.constructor) > -1) {
        this.type(value.constructor);
      } else if (Array.isArray(value)) {
        this.type(SVGArray);
      } else if (type === 'object') {
        this.type(ObjectBag);
      } else {
        this.type(NonMorphable);
      }
    }

    var result = new this._type(value);

    if (this._type === Color) {
      result = this._to ? result[this._to[4]]() : this._from ? result[this._from[4]]() : result;
    }

    result = result.toArray();
    this._morphObj = this._morphObj || new this._type();
    this._context = this._context || Array.apply(null, Array(result.length)).map(Object).map(function (o) {
      o.done = true;
      return o;
    });
    return result;
  }

  stepper(stepper) {
    if (stepper == null) return this._stepper;
    this._stepper = stepper;
    return this;
  }

  done() {
    var complete = this._context.map(this._stepper.done).reduce(function (last, curr) {
      return last && curr;
    }, true);

    return complete;
  }

  at(pos) {
    var _this = this;

    return this._morphObj.fromArray(this._from.map(function (i, index) {
      return _this._stepper.step(i, _this._to[index], pos, _this._context[index], _this._context);
    }));
  }

}
class NonMorphable {
  constructor(...args) {
    this.init(...args);
  }

  init(val) {
    val = Array.isArray(val) ? val[0] : val;
    this.value = val;
    return this;
  }

  valueOf() {
    return this.value;
  }

  toArray() {
    return [this.value];
  }

}
class TransformBag {
  constructor(...args) {
    this.init(...args);
  }

  init(obj) {
    if (Array.isArray(obj)) {
      obj = {
        scaleX: obj[0],
        scaleY: obj[1],
        shear: obj[2],
        rotate: obj[3],
        translateX: obj[4],
        translateY: obj[5],
        originX: obj[6],
        originY: obj[7]
      };
    }

    Object.assign(this, TransformBag.defaults, obj);
    return this;
  }

  toArray() {
    var v = this;
    return [v.scaleX, v.scaleY, v.shear, v.rotate, v.translateX, v.translateY, v.originX, v.originY];
  }

}
TransformBag.defaults = {
  scaleX: 1,
  scaleY: 1,
  shear: 0,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  originX: 0,
  originY: 0
};
class ObjectBag {
  constructor(...args) {
    this.init(...args);
  }

  init(objOrArr) {
    this.values = [];

    if (Array.isArray(objOrArr)) {
      this.values = objOrArr;
      return;
    }

    objOrArr = objOrArr || {};
    var entries = [];

    for (let i in objOrArr) {
      entries.push([i, objOrArr[i]]);
    }

    entries.sort((a, b) => {
      return a[0] - b[0];
    });
    this.values = entries.reduce((last, curr) => last.concat(curr), []);
    return this;
  }

  valueOf() {
    var obj = {};
    var arr = this.values;

    for (var i = 0, len = arr.length; i < len; i += 2) {
      obj[arr[i]] = arr[i + 1];
    }

    return obj;
  }

  toArray() {
    return this.values;
  }

}
const morphableTypes = [NonMorphable, TransformBag, ObjectBag];
function registerMorphableType(type = []) {
  morphableTypes.push(...[].concat(type));
}
function makeMorphable() {
  extend(morphableTypes, {
    to(val) {
      return new Morphable().type(this.constructor).from(this.valueOf()).to(val);
    },

    fromArray(arr) {
      this.init(arr);
      return this;
    }

  });
}

class Path extends Shape {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('path', node), node);
  } // Get array


  array() {
    return this._array || (this._array = new PathArray(this.attr('d')));
  } // Plot new path


  plot(d) {
    return d == null ? this.array() : this.clear().attr('d', typeof d === 'string' ? d : this._array = new PathArray(d));
  } // Clear array cache


  clear() {
    delete this._array;
    return this;
  } // Move by left top corner


  move(x, y) {
    return this.attr('d', this.array().move(x, y));
  } // Move by left top corner over x-axis


  x(x) {
    return x == null ? this.bbox().x : this.move(x, this.bbox().y);
  } // Move by left top corner over y-axis


  y(y) {
    return y == null ? this.bbox().y : this.move(this.bbox().x, y);
  } // Set element size to given width and height


  size(width, height) {
    var p = proportionalSize(this, width, height);
    return this.attr('d', this.array().size(p.width, p.height));
  } // Set width of element


  width(width) {
    return width == null ? this.bbox().width : this.size(width, this.bbox().height);
  } // Set height of element


  height(height) {
    return height == null ? this.bbox().height : this.size(this.bbox().width, height);
  }

  targets() {
    return baseFind('svg textpath [href*="' + this.id() + '"]');
  }

} // Define morphable array

Path.prototype.MorphArray = PathArray; // Add parent method

registerMethods({
  Container: {
    // Create a wrapped path element
    path: wrapWithAttrCheck(function (d) {
      // make sure plot is called as a setter
      return this.put(new Path()).plot(d || new PathArray());
    })
  }
});
register(Path);

function array() {
  return this._array || (this._array = new PointArray(this.attr('points')));
} // Plot new path

function plot(p) {
  return p == null ? this.array() : this.clear().attr('points', typeof p === 'string' ? p : this._array = new PointArray(p));
} // Clear array cache

function clear() {
  delete this._array;
  return this;
} // Move by left top corner

function move(x, y) {
  return this.attr('points', this.array().move(x, y));
} // Set element size to given width and height

function size(width, height) {
  let p = proportionalSize(this, width, height);
  return this.attr('points', this.array().size(p.width, p.height));
}

var poly = ({
  array: array,
  plot: plot,
  clear: clear,
  move: move,
  size: size
});

class Polygon extends Shape {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('polygon', node), node);
  }

}
registerMethods({
  Container: {
    // Create a wrapped polygon element
    polygon: wrapWithAttrCheck(function (p) {
      // make sure plot is called as a setter
      return this.put(new Polygon()).plot(p || new PointArray());
    })
  }
});
extend(Polygon, pointed);
extend(Polygon, poly);
register(Polygon);

class Polyline extends Shape {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('polyline', node), node);
  }

}
registerMethods({
  Container: {
    // Create a wrapped polygon element
    polyline: wrapWithAttrCheck(function (p) {
      // make sure plot is called as a setter
      return this.put(new Polyline()).plot(p || new PointArray());
    })
  }
});
extend(Polyline, pointed);
extend(Polyline, poly);
register(Polyline);

class Rect extends Shape {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('rect', node), node);
  }

}
extend(Rect, {
  rx,
  ry
});
registerMethods({
  Container: {
    // Create a rect element
    rect: wrapWithAttrCheck(function (width$$1, height$$1) {
      return this.put(new Rect()).size(width$$1, height$$1);
    })
  }
});
register(Rect);

class Queue {
  constructor() {
    this._first = null;
    this._last = null;
  }

  push(value) {
    // An item stores an id and the provided value
    var item = value.next ? value : {
      value: value,
      next: null,
      prev: null // Deal with the queue being empty or populated

    };

    if (this._last) {
      item.prev = this._last;
      this._last.next = item;
      this._last = item;
    } else {
      this._last = item;
      this._first = item;
    } // Return the current item


    return item;
  }

  shift() {
    // Check if we have a value
    var remove = this._first;
    if (!remove) return null; // If we do, remove it and relink things

    this._first = remove.next;
    if (this._first) this._first.prev = null;
    this._last = this._first ? this._last : null;
    return remove.value;
  } // Shows us the first item in the list


  first() {
    return this._first && this._first.value;
  } // Shows us the last item in the list


  last() {
    return this._last && this._last.value;
  } // Removes the item that was returned from the push


  remove(item) {
    // Relink the previous item
    if (item.prev) item.prev.next = item.next;
    if (item.next) item.next.prev = item.prev;
    if (item === this._last) this._last = item.prev;
    if (item === this._first) this._first = item.next; // Invalidate item

    item.prev = null;
    item.next = null;
  }

}

const Animator = {
  nextDraw: null,
  frames: new Queue(),
  timeouts: new Queue(),
  immediates: new Queue(),
  timer: () => globals.window.performance || globals.window.Date,
  transforms: [],

  frame(fn) {
    // Store the node
    var node = Animator.frames.push({
      run: fn
    }); // Request an animation frame if we don't have one

    if (Animator.nextDraw === null) {
      Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
    } // Return the node so we can remove it easily


    return node;
  },

  timeout(fn, delay) {
    delay = delay || 0; // Work out when the event should fire

    var time = Animator.timer().now() + delay; // Add the timeout to the end of the queue

    var node = Animator.timeouts.push({
      run: fn,
      time: time
    }); // Request another animation frame if we need one

    if (Animator.nextDraw === null) {
      Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
    }

    return node;
  },

  immediate(fn) {
    // Add the immediate fn to the end of the queue
    var node = Animator.immediates.push(fn); // Request another animation frame if we need one

    if (Animator.nextDraw === null) {
      Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
    }

    return node;
  },

  cancelFrame(node) {
    node != null && Animator.frames.remove(node);
  },

  clearTimeout(node) {
    node != null && Animator.timeouts.remove(node);
  },

  cancelImmediate(node) {
    node != null && Animator.immediates.remove(node);
  },

  _draw(now) {
    // Run all the timeouts we can run, if they are not ready yet, add them
    // to the end of the queue immediately! (bad timeouts!!! [sarcasm])
    var nextTimeout = null;
    var lastTimeout = Animator.timeouts.last();

    while (nextTimeout = Animator.timeouts.shift()) {
      // Run the timeout if its time, or push it to the end
      if (now >= nextTimeout.time) {
        nextTimeout.run();
      } else {
        Animator.timeouts.push(nextTimeout);
      } // If we hit the last item, we should stop shifting out more items


      if (nextTimeout === lastTimeout) break;
    } // Run all of the animation frames


    var nextFrame = null;
    var lastFrame = Animator.frames.last();

    while (nextFrame !== lastFrame && (nextFrame = Animator.frames.shift())) {
      nextFrame.run(now);
    }

    var nextImmediate = null;

    while (nextImmediate = Animator.immediates.shift()) {
      nextImmediate();
    } // If we have remaining timeouts or frames, draw until we don't anymore


    Animator.nextDraw = Animator.timeouts.first() || Animator.frames.first() ? globals.window.requestAnimationFrame(Animator._draw) : null;
  }

};

var makeSchedule = function (runnerInfo) {
  var start = runnerInfo.start;
  var duration = runnerInfo.runner.duration();
  var end = start + duration;
  return {
    start: start,
    duration: duration,
    end: end,
    runner: runnerInfo.runner
  };
};

const defaultSource = function () {
  let w = globals.window;
  return (w.performance || w.Date).now();
};

class Timeline extends EventTarget {
  // Construct a new timeline on the given element
  constructor(timeSource = defaultSource) {
    super();
    this._timeSource = timeSource; // Store the timing variables

    this._startTime = 0;
    this._speed = 1.0; // Determines how long a runner is hold in memory. Can be a dt or true/false

    this._persist = 0; // Keep track of the running animations and their starting parameters

    this._nextFrame = null;
    this._paused = true;
    this._runners = [];
    this._runnerIds = [];
    this._lastRunnerId = -1;
    this._time = 0;
    this._lastSourceTime = 0;
    this._lastStepTime = 0; // Make sure that step is always called in class context

    this._step = this._stepFn.bind(this, false);
    this._stepImmediate = this._stepFn.bind(this, true);
  } // schedules a runner on the timeline


  schedule(runner, delay, when) {
    if (runner == null) {
      return this._runners.map(makeSchedule);
    } // The start time for the next animation can either be given explicitly,
    // derived from the current timeline time or it can be relative to the
    // last start time to chain animations direclty


    var absoluteStartTime = 0;
    var endTime = this.getEndTime();
    delay = delay || 0; // Work out when to start the animation

    if (when == null || when === 'last' || when === 'after') {
      // Take the last time and increment
      absoluteStartTime = endTime;
    } else if (when === 'absolute' || when === 'start') {
      absoluteStartTime = delay;
      delay = 0;
    } else if (when === 'now') {
      absoluteStartTime = this._time;
    } else if (when === 'relative') {
      let runnerInfo = this._runners[runner.id];

      if (runnerInfo) {
        absoluteStartTime = runnerInfo.start + delay;
        delay = 0;
      }
    } else {
      throw new Error('Invalid value for the "when" parameter');
    } // Manage runner


    runner.unschedule();
    runner.timeline(this);
    const persist = runner.persist();
    const runnerInfo = {
      persist: persist === null ? this._persist : persist,
      start: absoluteStartTime + delay,
      runner
    };
    this._lastRunnerId = runner.id;

    this._runners.push(runnerInfo);

    this._runners.sort((a, b) => a.start - b.start);

    this._runnerIds = this._runners.map(info => info.runner.id);

    this.updateTime()._continue();

    return this;
  } // Remove the runner from this timeline


  unschedule(runner) {
    var index = this._runnerIds.indexOf(runner.id);

    if (index < 0) return this;

    this._runners.splice(index, 1);

    this._runnerIds.splice(index, 1);

    runner.timeline(null);
    return this;
  } // Calculates the end of the timeline


  getEndTime() {
    var lastRunnerInfo = this._runners[this._runnerIds.indexOf(this._lastRunnerId)];

    var lastDuration = lastRunnerInfo ? lastRunnerInfo.runner.duration() : 0;
    var lastStartTime = lastRunnerInfo ? lastRunnerInfo.start : 0;
    return lastStartTime + lastDuration;
  } // Makes sure, that after pausing the time doesn't jump


  updateTime() {
    if (!this.active()) {
      this._lastSourceTime = this._timeSource();
    }

    return this;
  }

  play() {
    // Now make sure we are not paused and continue the animation
    this._paused = false;
    return this.updateTime()._continue();
  }

  pause() {
    this._paused = true;
    return this._continue();
  }

  stop() {
    // Go to start and pause
    this.time(0);
    return this.pause();
  }

  finish() {
    // Go to end and pause
    this.time(this.getEndTime() + 1);
    return this.pause();
  }

  speed(speed) {
    if (speed == null) return this._speed;
    this._speed = speed;
    return this;
  }

  reverse(yes) {
    var currentSpeed = this.speed();
    if (yes == null) return this.speed(-currentSpeed);
    var positive = Math.abs(currentSpeed);
    return this.speed(yes ? positive : -positive);
  }

  seek(dt) {
    return this.time(this._time + dt);
  }

  time(time) {
    if (time == null) return this._time;
    this._time = time;
    return this._continue(true);
  }

  persist(dtOrForever) {
    if (dtOrForever == null) return this._persist;
    this._persist = dtOrForever;
    return this;
  }

  source(fn) {
    if (fn == null) return this._timeSource;
    this._timeSource = fn;
    return this;
  }

  _stepFn(immediateStep = false) {
    // Get the time delta from the last time and update the time
    var time = this._timeSource();

    var dtSource = time - this._lastSourceTime;
    if (immediateStep) dtSource = 0;
    var dtTime = this._speed * dtSource + (this._time - this._lastStepTime);
    this._lastSourceTime = time; // Only update the time if we use the timeSource.
    // Otherwise use the current time

    if (!immediateStep) {
      // Update the time
      this._time += dtTime;
      this._time = this._time < 0 ? 0 : this._time;
    }

    this._lastStepTime = this._time;
    this.fire('time', this._time); // This is for the case that the timeline was seeked so that the time
    // is now before the startTime of the runner. Thats why we need to set
    // the runner to position 0
    // FIXME:
    // However, reseting in insertion order leads to bugs. Considering the case,
    // where 2 runners change the same attriute but in different times,
    // reseting both of them will lead to the case where the later defined
    // runner always wins the reset even if the other runner started earlier
    // and therefore should win the attribute battle
    // this can be solved by reseting them backwards

    for (var k = this._runners.length; k--;) {
      // Get and run the current runner and ignore it if its inactive
      let runnerInfo = this._runners[k];
      let runner = runnerInfo.runner; // Make sure that we give the actual difference
      // between runner start time and now

      let dtToStart = this._time - runnerInfo.start; // Dont run runner if not started yet
      // and try to reset it

      if (dtToStart <= 0) {
        runner.reset();
      }
    } // Run all of the runners directly


    var runnersLeft = false;

    for (var i = 0, len = this._runners.length; i < len; i++) {
      // Get and run the current runner and ignore it if its inactive
      let runnerInfo = this._runners[i];
      let runner = runnerInfo.runner;
      let dt = dtTime; // Make sure that we give the actual difference
      // between runner start time and now

      let dtToStart = this._time - runnerInfo.start; // Dont run runner if not started yet

      if (dtToStart <= 0) {
        runnersLeft = true;
        continue;
      } else if (dtToStart < dt) {
        // Adjust dt to make sure that animation is on point
        dt = dtToStart;
      }

      if (!runner.active()) continue; // If this runner is still going, signal that we need another animation
      // frame, otherwise, remove the completed runner

      var finished = runner.step(dt).done;

      if (!finished) {
        runnersLeft = true; // continue
      } else if (runnerInfo.persist !== true) {
        // runner is finished. And runner might get removed
        var endTime = runner.duration() - runner.time() + this._time;

        if (endTime + runnerInfo.persist < this._time) {
          // Delete runner and correct index
          runner.unschedule();
          --i;
          --len;
        }
      }
    } // Basically: we continue when there are runners right from us in time
    // when -->, and when runners are left from us when <--


    if (runnersLeft && !(this._speed < 0 && this._time === 0) || this._runnerIds.length && this._speed < 0 && this._time > 0) {
      this._continue();
    } else {
      this.pause();
      this.fire('finished');
    }

    return this;
  } // Checks if we are running and continues the animation


  _continue(immediateStep = false) {
    Animator.cancelFrame(this._nextFrame);
    this._nextFrame = null;
    if (immediateStep) return this._stepImmediate();
    if (this._paused) return this;
    this._nextFrame = Animator.frame(this._step);
    return this;
  }

  active() {
    return !!this._nextFrame;
  }

}
registerMethods({
  Element: {
    timeline: function (timeline) {
      if (timeline == null) {
        this._timeline = this._timeline || new Timeline();
        return this._timeline;
      } else {
        this._timeline = timeline;
        return this;
      }
    }
  }
});

class Runner extends EventTarget {
  constructor(options) {
    super(); // Store a unique id on the runner, so that we can identify it later

    this.id = Runner.id++; // Ensure a default value

    options = options == null ? timeline.duration : options; // Ensure that we get a controller

    options = typeof options === 'function' ? new Controller(options) : options; // Declare all of the variables

    this._element = null;
    this._timeline = null;
    this.done = false;
    this._queue = []; // Work out the stepper and the duration

    this._duration = typeof options === 'number' && options;
    this._isDeclarative = options instanceof Controller;
    this._stepper = this._isDeclarative ? options : new Ease(); // We copy the current values from the timeline because they can change

    this._history = {}; // Store the state of the runner

    this.enabled = true;
    this._time = 0;
    this._lastTime = 0; // At creation, the runner is in reseted state

    this._reseted = true; // Save transforms applied to this runner

    this.transforms = new Matrix();
    this.transformId = 1; // Looping variables

    this._haveReversed = false;
    this._reverse = false;
    this._loopsDone = 0;
    this._swing = false;
    this._wait = 0;
    this._times = 1;
    this._frameId = null; // Stores how long a runner is stored after beeing done

    this._persist = this._isDeclarative ? true : null;
  }
  /*
  Runner Definitions
  ==================
  These methods help us define the runtime behaviour of the Runner or they
  help us make new runners from the current runner
  */


  element(element) {
    if (element == null) return this._element;
    this._element = element;

    element._prepareRunner();

    return this;
  }

  timeline(timeline$$1) {
    // check explicitly for undefined so we can set the timeline to null
    if (typeof timeline$$1 === 'undefined') return this._timeline;
    this._timeline = timeline$$1;
    return this;
  }

  animate(duration, delay, when) {
    var o = Runner.sanitise(duration, delay, when);
    var runner = new Runner(o.duration);
    if (this._timeline) runner.timeline(this._timeline);
    if (this._element) runner.element(this._element);
    return runner.loop(o).schedule(delay, when);
  }

  schedule(timeline$$1, delay, when) {
    // The user doesn't need to pass a timeline if we already have one
    if (!(timeline$$1 instanceof Timeline)) {
      when = delay;
      delay = timeline$$1;
      timeline$$1 = this.timeline();
    } // If there is no timeline, yell at the user...


    if (!timeline$$1) {
      throw Error('Runner cannot be scheduled without timeline');
    } // Schedule the runner on the timeline provided


    timeline$$1.schedule(this, delay, when);
    return this;
  }

  unschedule() {
    var timeline$$1 = this.timeline();
    timeline$$1 && timeline$$1.unschedule(this);
    return this;
  }

  loop(times, swing, wait) {
    // Deal with the user passing in an object
    if (typeof times === 'object') {
      swing = times.swing;
      wait = times.wait;
      times = times.times;
    } // Sanitise the values and store them


    this._times = times || Infinity;
    this._swing = swing || false;
    this._wait = wait || 0; // Allow true to be passed

    if (this._times === true) {
      this._times = Infinity;
    }

    return this;
  }

  delay(delay) {
    return this.animate(0, delay);
  }
  /*
  Basic Functionality
  ===================
  These methods allow us to attach basic functions to the runner directly
  */


  queue(initFn, runFn, retargetFn, isTransform) {
    this._queue.push({
      initialiser: initFn || noop,
      runner: runFn || noop,
      retarget: retargetFn,
      isTransform: isTransform,
      initialised: false,
      finished: false
    });

    var timeline$$1 = this.timeline();
    timeline$$1 && this.timeline()._continue();
    return this;
  }

  during(fn) {
    return this.queue(null, fn);
  }

  after(fn) {
    return this.on('finished', fn);
  }
  /*
  Runner animation methods
  ========================
  Control how the animation plays
  */


  time(time) {
    if (time == null) {
      return this._time;
    }

    let dt = time - this._time;
    this.step(dt);
    return this;
  }

  duration() {
    return this._times * (this._wait + this._duration) - this._wait;
  }

  loops(p) {
    var loopDuration = this._duration + this._wait;

    if (p == null) {
      var loopsDone = Math.floor(this._time / loopDuration);
      var relativeTime = this._time - loopsDone * loopDuration;
      var position = relativeTime / this._duration;
      return Math.min(loopsDone + position, this._times);
    }

    var whole = Math.floor(p);
    var partial = p % 1;
    var time = loopDuration * whole + this._duration * partial;
    return this.time(time);
  }

  persist(dtOrForever) {
    if (dtOrForever == null) return this._persist;
    this._persist = dtOrForever;
    return this;
  }

  position(p) {
    // Get all of the variables we need
    var x$$1 = this._time;
    var d = this._duration;
    var w = this._wait;
    var t = this._times;
    var s = this._swing;
    var r = this._reverse;
    var position;

    if (p == null) {
      /*
      This function converts a time to a position in the range [0, 1]
      The full explanation can be found in this desmos demonstration
        https://www.desmos.com/calculator/u4fbavgche
      The logic is slightly simplified here because we can use booleans
      */
      // Figure out the value without thinking about the start or end time
      const f = function (x$$1) {
        var swinging = s * Math.floor(x$$1 % (2 * (w + d)) / (w + d));
        var backwards = swinging && !r || !swinging && r;
        var uncliped = Math.pow(-1, backwards) * (x$$1 % (w + d)) / d + backwards;
        var clipped = Math.max(Math.min(uncliped, 1), 0);
        return clipped;
      }; // Figure out the value by incorporating the start time


      var endTime = t * (w + d) - w;
      position = x$$1 <= 0 ? Math.round(f(1e-5)) : x$$1 < endTime ? f(x$$1) : Math.round(f(endTime - 1e-5));
      return position;
    } // Work out the loops done and add the position to the loops done


    var loopsDone = Math.floor(this.loops());
    var swingForward = s && loopsDone % 2 === 0;
    var forwards = swingForward && !r || r && swingForward;
    position = loopsDone + (forwards ? p : 1 - p);
    return this.loops(position);
  }

  progress(p) {
    if (p == null) {
      return Math.min(1, this._time / this.duration());
    }

    return this.time(p * this.duration());
  }

  step(dt) {
    // If we are inactive, this stepper just gets skipped
    if (!this.enabled) return this; // Update the time and get the new position

    dt = dt == null ? 16 : dt;
    this._time += dt;
    var position = this.position(); // Figure out if we need to run the stepper in this frame

    var running = this._lastPosition !== position && this._time >= 0;
    this._lastPosition = position; // Figure out if we just started

    var duration = this.duration();
    var justStarted = this._lastTime <= 0 && this._time > 0;
    var justFinished = this._lastTime < duration && this._time >= duration;
    this._lastTime = this._time;

    if (justStarted) {
      this.fire('start', this);
    } // Work out if the runner is finished set the done flag here so animations
    // know, that they are running in the last step (this is good for
    // transformations which can be merged)


    var declarative = this._isDeclarative;
    this.done = !declarative && !justFinished && this._time >= duration; // Runner is running. So its not in reseted state anymore

    this._reseted = false; // Call initialise and the run function

    if (running || declarative) {
      this._initialise(running); // clear the transforms on this runner so they dont get added again and again


      this.transforms = new Matrix();

      var converged = this._run(declarative ? dt : position);

      this.fire('step', this);
    } // correct the done flag here
    // declaritive animations itself know when they converged


    this.done = this.done || converged && declarative;

    if (justFinished) {
      this.fire('finished', this);
    }

    return this;
  }

  reset() {
    if (this._reseted) return this;
    this.time(0);
    this._reseted = true;
    return this;
  }

  finish() {
    return this.step(Infinity);
  }

  reverse(reverse) {
    this._reverse = reverse == null ? !this._reverse : reverse;
    return this;
  }

  ease(fn) {
    this._stepper = new Ease(fn);
    return this;
  }

  active(enabled) {
    if (enabled == null) return this.enabled;
    this.enabled = enabled;
    return this;
  }
  /*
  Private Methods
  ===============
  Methods that shouldn't be used externally
  */
  // Save a morpher to the morpher list so that we can retarget it later


  _rememberMorpher(method, morpher) {
    this._history[method] = {
      morpher: morpher,
      caller: this._queue[this._queue.length - 1] // We have to resume the timeline in case a controller
      // is already done without beeing ever run
      // This can happen when e.g. this is done:
      //    anim = el.animate(new SVG.Spring)
      // and later
      //    anim.move(...)

    };

    if (this._isDeclarative) {
      var timeline$$1 = this.timeline();
      timeline$$1 && timeline$$1.play();
    }
  } // Try to set the target for a morpher if the morpher exists, otherwise
  // do nothing and return false


  _tryRetarget(method, target, extra) {
    if (this._history[method]) {
      // if the last method wasnt even initialised, throw it away
      if (!this._history[method].caller.initialised) {
        let index = this._queue.indexOf(this._history[method].caller);

        this._queue.splice(index, 1);

        return false;
      } // for the case of transformations, we use the special retarget function
      // which has access to the outer scope


      if (this._history[method].caller.retarget) {
        this._history[method].caller.retarget(target, extra); // for everything else a simple morpher change is sufficient

      } else {
        this._history[method].morpher.to(target);
      }

      this._history[method].caller.finished = false;
      var timeline$$1 = this.timeline();
      timeline$$1 && timeline$$1.play();
      return true;
    }

    return false;
  } // Run each initialise function in the runner if required


  _initialise(running) {
    // If we aren't running, we shouldn't initialise when not declarative
    if (!running && !this._isDeclarative) return; // Loop through all of the initialisers

    for (var i = 0, len = this._queue.length; i < len; ++i) {
      // Get the current initialiser
      var current = this._queue[i]; // Determine whether we need to initialise

      var needsIt = this._isDeclarative || !current.initialised && running;
      running = !current.finished; // Call the initialiser if we need to

      if (needsIt && running) {
        current.initialiser.call(this);
        current.initialised = true;
      }
    }
  } // Run each run function for the position or dt given


  _run(positionOrDt) {
    // Run all of the _queue directly
    var allfinished = true;

    for (var i = 0, len = this._queue.length; i < len; ++i) {
      // Get the current function to run
      var current = this._queue[i]; // Run the function if its not finished, we keep track of the finished
      // flag for the sake of declarative _queue

      var converged = current.runner.call(this, positionOrDt);
      current.finished = current.finished || converged === true;
      allfinished = allfinished && current.finished;
    } // We report when all of the constructors are finished


    return allfinished;
  }

  addTransform(transform, index) {
    this.transforms.lmultiplyO(transform);
    return this;
  }

  clearTransform() {
    this.transforms = new Matrix();
    return this;
  } // TODO: Keep track of all transformations so that deletion is faster


  clearTransformsFromQueue() {
    if (!this.done || !this._timeline || !this._timeline._runnerIds.includes(this.id)) {
      this._queue = this._queue.filter(item => {
        return !item.isTransform;
      });
    }
  }

  static sanitise(duration, delay, when) {
    // Initialise the default parameters
    var times = 1;
    var swing = false;
    var wait = 0;
    duration = duration || timeline.duration;
    delay = delay || timeline.delay;
    when = when || 'last'; // If we have an object, unpack the values

    if (typeof duration === 'object' && !(duration instanceof Stepper)) {
      delay = duration.delay || delay;
      when = duration.when || when;
      swing = duration.swing || swing;
      times = duration.times || times;
      wait = duration.wait || wait;
      duration = duration.duration || timeline.duration;
    }

    return {
      duration: duration,
      delay: delay,
      swing: swing,
      times: times,
      wait: wait,
      when: when
    };
  }

}
Runner.id = 0;

class FakeRunner {
  constructor(transforms = new Matrix(), id = -1, done = true) {
    this.transforms = transforms;
    this.id = id;
    this.done = done;
  }

  clearTransformsFromQueue() {}

}

extend([Runner, FakeRunner], {
  mergeWith(runner) {
    return new FakeRunner(runner.transforms.lmultiply(this.transforms), runner.id);
  }

}); // FakeRunner.emptyRunner = new FakeRunner()

const lmultiply = (last, curr) => last.lmultiplyO(curr);

const getRunnerTransform = runner => runner.transforms;

function mergeTransforms() {
  // Find the matrix to apply to the element and apply it
  let runners = this._transformationRunners.runners;
  let netTransform = runners.map(getRunnerTransform).reduce(lmultiply, new Matrix());
  this.transform(netTransform);

  this._transformationRunners.merge();

  if (this._transformationRunners.length() === 1) {
    this._frameId = null;
  }
}

class RunnerArray {
  constructor() {
    this.runners = [];
    this.ids = [];
  }

  add(runner) {
    if (this.runners.includes(runner)) return;
    let id = runner.id + 1;
    this.runners.push(runner);
    this.ids.push(id);
    return this;
  }

  getByID(id) {
    return this.runners[this.ids.indexOf(id + 1)];
  }

  remove(id) {
    let index = this.ids.indexOf(id + 1);
    this.ids.splice(index, 1);
    this.runners.splice(index, 1);
    return this;
  }

  merge() {
    let lastRunner = null;
    this.runners.forEach((runner, i) => {
      const condition = lastRunner && runner.done && lastRunner.done // don't merge runner when persisted on timeline
      && (!runner._timeline || !runner._timeline._runnerIds.includes(runner.id)) && (!lastRunner._timeline || !lastRunner._timeline._runnerIds.includes(lastRunner.id));

      if (condition) {
        // the +1 happens in the function
        this.remove(runner.id);
        this.edit(lastRunner.id, runner.mergeWith(lastRunner));
      }

      lastRunner = runner;
    });
    return this;
  }

  edit(id, newRunner) {
    let index = this.ids.indexOf(id + 1);
    this.ids.splice(index, 1, id + 1);
    this.runners.splice(index, 1, newRunner);
    return this;
  }

  length() {
    return this.ids.length;
  }

  clearBefore(id) {
    let deleteCnt = this.ids.indexOf(id + 1) || 1;
    this.ids.splice(0, deleteCnt, 0);
    this.runners.splice(0, deleteCnt, new FakeRunner()).forEach(r => r.clearTransformsFromQueue());
    return this;
  }

}

registerMethods({
  Element: {
    animate(duration, delay, when) {
      var o = Runner.sanitise(duration, delay, when);
      var timeline$$1 = this.timeline();
      return new Runner(o.duration).loop(o).element(this).timeline(timeline$$1.play()).schedule(delay, when);
    },

    delay(by, when) {
      return this.animate(0, by, when);
    },

    // this function searches for all runners on the element and deletes the ones
    // which run before the current one. This is because absolute transformations
    // overwfrite anything anyway so there is no need to waste time computing
    // other runners
    _clearTransformRunnersBefore(currentRunner) {
      this._transformationRunners.clearBefore(currentRunner.id);
    },

    _currentTransform(current) {
      return this._transformationRunners.runners // we need the equal sign here to make sure, that also transformations
      // on the same runner which execute before the current transformation are
      // taken into account
      .filter(runner => runner.id <= current.id).map(getRunnerTransform).reduce(lmultiply, new Matrix());
    },

    _addRunner(runner) {
      this._transformationRunners.add(runner); // Make sure that the runner merge is executed at the very end of
      // all Animator functions. Thats why we use immediate here to execute
      // the merge right after all frames are run


      Animator.cancelImmediate(this._frameId);
      this._frameId = Animator.immediate(mergeTransforms.bind(this));
    },

    _prepareRunner() {
      if (this._frameId == null) {
        this._transformationRunners = new RunnerArray().add(new FakeRunner(new Matrix(this)));
      }
    }

  }
});
extend(Runner, {
  attr(a, v) {
    return this.styleAttr('attr', a, v);
  },

  // Add animatable styles
  css(s, v) {
    return this.styleAttr('css', s, v);
  },

  styleAttr(type, name, val) {
    // apply attributes individually
    if (typeof name === 'object') {
      for (var key in name) {
        this.styleAttr(type, key, name[key]);
      }

      return this;
    }

    var morpher = new Morphable(this._stepper).to(val);
    this.queue(function () {
      morpher = morpher.from(this.element()[type](name));
    }, function (pos) {
      this.element()[type](name, morpher.at(pos));
      return morpher.done();
    });
    return this;
  },

  zoom(level, point$$1) {
    if (this._tryRetarget('zoom', to, point$$1)) return this;
    var morpher = new Morphable(this._stepper).to(new SVGNumber(level));
    this.queue(function () {
      morpher = morpher.from(this.element().zoom());
    }, function (pos) {
      this.element().zoom(morpher.at(pos), point$$1);
      return morpher.done();
    }, function (newLevel, newPoint) {
      point$$1 = newPoint;
      morpher.to(newLevel);
    });

    this._rememberMorpher('zoom', morpher);

    return this;
  },

  /**
   ** absolute transformations
   **/
  //
  // M v -----|-----(D M v = F v)------|----->  T v
  //
  // 1. define the final state (T) and decompose it (once)
  //    t = [tx, ty, the, lam, sy, sx]
  // 2. on every frame: pull the current state of all previous transforms
  //    (M - m can change)
  //   and then write this as m = [tx0, ty0, the0, lam0, sy0, sx0]
  // 3. Find the interpolated matrix F(pos) = m + pos * (t - m)
  //   - Note F(0) = M
  //   - Note F(1) = T
  // 4. Now you get the delta matrix as a result: D = F * inv(M)
  transform(transforms, relative, affine) {
    // If we have a declarative function, we should retarget it if possible
    relative = transforms.relative || relative;

    if (this._isDeclarative && !relative && this._tryRetarget('transform', transforms)) {
      return this;
    } // Parse the parameters


    var isMatrix = Matrix.isMatrixLike(transforms);
    affine = transforms.affine != null ? transforms.affine : affine != null ? affine : !isMatrix; // Create a morepher and set its type

    const morpher = new Morphable(this._stepper).type(affine ? TransformBag : Matrix);
    let origin;
    let element;
    let current;
    let currentAngle;
    let startTransform;

    function setup() {
      // make sure element and origin is defined
      element = element || this.element();
      origin = origin || getOrigin(transforms, element);
      startTransform = new Matrix(relative ? undefined : element); // add the runner to the element so it can merge transformations

      element._addRunner(this); // Deactivate all transforms that have run so far if we are absolute


      if (!relative) {
        element._clearTransformRunnersBefore(this);
      }
    }

    function run(pos) {
      // clear all other transforms before this in case something is saved
      // on this runner. We are absolute. We dont need these!
      if (!relative) this.clearTransform();
      let {
        x: x$$1,
        y: y$$1
      } = new Point(origin).transform(element._currentTransform(this));
      let target = new Matrix(_objectSpread({}, transforms, {
        origin: [x$$1, y$$1]
      }));
      let start = this._isDeclarative && current ? current : startTransform;

      if (affine) {
        target = target.decompose(x$$1, y$$1);
        start = start.decompose(x$$1, y$$1); // Get the current and target angle as it was set

        const rTarget = target.rotate;
        const rCurrent = start.rotate; // Figure out the shortest path to rotate directly

        const possibilities = [rTarget - 360, rTarget, rTarget + 360];
        const distances = possibilities.map(a => Math.abs(a - rCurrent));
        const shortest = Math.min(...distances);
        const index = distances.indexOf(shortest);
        target.rotate = possibilities[index];
      }

      if (relative) {
        // we have to be careful here not to overwrite the rotation
        // with the rotate method of Matrix
        if (!isMatrix) {
          target.rotate = transforms.rotate || 0;
        }

        if (this._isDeclarative && currentAngle) {
          start.rotate = currentAngle;
        }
      }

      morpher.from(start);
      morpher.to(target);
      let affineParameters = morpher.at(pos);
      currentAngle = affineParameters.rotate;
      current = new Matrix(affineParameters);
      this.addTransform(current);

      element._addRunner(this);

      return morpher.done();
    }

    function retarget(newTransforms) {
      // only get a new origin if it changed since the last call
      if ((newTransforms.origin || 'center').toString() !== (transforms.origin || 'center').toString()) {
        origin = getOrigin(transforms, element);
      } // overwrite the old transformations with the new ones


      transforms = _objectSpread({}, newTransforms, {
        origin
      });
    }

    this.queue(setup, run, retarget, true);
    this._isDeclarative && this._rememberMorpher('transform', morpher);
    return this;
  },

  // Animatable x-axis
  x(x$$1, relative) {
    return this._queueNumber('x', x$$1);
  },

  // Animatable y-axis
  y(y$$1) {
    return this._queueNumber('y', y$$1);
  },

  dx(x$$1) {
    return this._queueNumberDelta('x', x$$1);
  },

  dy(y$$1) {
    return this._queueNumberDelta('y', y$$1);
  },

  _queueNumberDelta(method, to$$1) {
    to$$1 = new SVGNumber(to$$1); // Try to change the target if we have this method already registerd

    if (this._tryRetarget(method, to$$1)) return this; // Make a morpher and queue the animation

    var morpher = new Morphable(this._stepper).to(to$$1);
    var from$$1 = null;
    this.queue(function () {
      from$$1 = this.element()[method]();
      morpher.from(from$$1);
      morpher.to(from$$1 + to$$1);
    }, function (pos) {
      this.element()[method](morpher.at(pos));
      return morpher.done();
    }, function (newTo) {
      morpher.to(from$$1 + new SVGNumber(newTo));
    }); // Register the morpher so that if it is changed again, we can retarget it

    this._rememberMorpher(method, morpher);

    return this;
  },

  _queueObject(method, to$$1) {
    // Try to change the target if we have this method already registerd
    if (this._tryRetarget(method, to$$1)) return this; // Make a morpher and queue the animation

    var morpher = new Morphable(this._stepper).to(to$$1);
    this.queue(function () {
      morpher.from(this.element()[method]());
    }, function (pos) {
      this.element()[method](morpher.at(pos));
      return morpher.done();
    }); // Register the morpher so that if it is changed again, we can retarget it

    this._rememberMorpher(method, morpher);

    return this;
  },

  _queueNumber(method, value) {
    return this._queueObject(method, new SVGNumber(value));
  },

  // Animatable center x-axis
  cx(x$$1) {
    return this._queueNumber('cx', x$$1);
  },

  // Animatable center y-axis
  cy(y$$1) {
    return this._queueNumber('cy', y$$1);
  },

  // Add animatable move
  move(x$$1, y$$1) {
    return this.x(x$$1).y(y$$1);
  },

  // Add animatable center
  center(x$$1, y$$1) {
    return this.cx(x$$1).cy(y$$1);
  },

  // Add animatable size
  size(width$$1, height$$1) {
    // animate bbox based size for all other elements
    var box;

    if (!width$$1 || !height$$1) {
      box = this._element.bbox();
    }

    if (!width$$1) {
      width$$1 = box.width / box.height * height$$1;
    }

    if (!height$$1) {
      height$$1 = box.height / box.width * width$$1;
    }

    return this.width(width$$1).height(height$$1);
  },

  // Add animatable width
  width(width$$1) {
    return this._queueNumber('width', width$$1);
  },

  // Add animatable height
  height(height$$1) {
    return this._queueNumber('height', height$$1);
  },

  // Add animatable plot
  plot(a, b, c, d) {
    // Lines can be plotted with 4 arguments
    if (arguments.length === 4) {
      return this.plot([a, b, c, d]);
    }

    if (this._tryRetarget('plot', a)) return this;
    var morpher = new Morphable(this._stepper).type(this._element.MorphArray).to(a);
    this.queue(function () {
      morpher.from(this._element.array());
    }, function (pos) {
      this._element.plot(morpher.at(pos));

      return morpher.done();
    });

    this._rememberMorpher('plot', morpher);

    return this;
  },

  // Add leading method
  leading(value) {
    return this._queueNumber('leading', value);
  },

  // Add animatable viewbox
  viewbox(x$$1, y$$1, width$$1, height$$1) {
    return this._queueObject('viewbox', new Box(x$$1, y$$1, width$$1, height$$1));
  },

  update(o) {
    if (typeof o !== 'object') {
      return this.update({
        offset: arguments[0],
        color: arguments[1],
        opacity: arguments[2]
      });
    }

    if (o.opacity != null) this.attr('stop-opacity', o.opacity);
    if (o.color != null) this.attr('stop-color', o.color);
    if (o.offset != null) this.attr('offset', o.offset);
    return this;
  }

});
extend(Runner, {
  rx,
  ry,
  from,
  to
});
register(Runner);

class Svg$1 extends Container {
  constructor(node) {
    super(nodeOrNew('svg', node), node);
    this.namespace();
  }

  isRoot() {
    return !this.node.parentNode || !(this.node.parentNode instanceof globals.window.SVGElement) || this.node.parentNode.nodeName === '#document';
  } // Check if this is a root svg
  // If not, call docs from this element


  root() {
    if (this.isRoot()) return this;
    return super.root();
  } // Add namespaces


  namespace() {
    if (!this.isRoot()) return this.root().namespace();
    return this.attr({
      xmlns: ns,
      version: '1.1'
    }).attr('xmlns:xlink', xlink, xmlns).attr('xmlns:svgjs', svgjs, xmlns);
  } // Creates and returns defs element


  defs() {
    if (!this.isRoot()) return this.root().defs();
    return adopt(this.node.getElementsByTagName('defs')[0]) || this.put(new Defs());
  } // custom parent method


  parent(type) {
    if (this.isRoot()) {
      return this.node.parentNode.nodeName === '#document' ? null : adopt(this.node.parentNode);
    }

    return super.parent(type);
  }

  clear() {
    // remove children
    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.lastChild);
    } // remove defs reference


    delete this._defs;
    return this;
  }

}
registerMethods({
  Container: {
    // Create nested svg document
    nested: wrapWithAttrCheck(function () {
      return this.put(new Svg$1());
    })
  }
});
register(Svg$1, 'Svg', true);

class Symbol extends Container {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('symbol', node), node);
  }

}
registerMethods({
  Container: {
    symbol: wrapWithAttrCheck(function () {
      return this.put(new Symbol());
    })
  }
});
register(Symbol);

function plain(text) {
  // clear if build mode is disabled
  if (this._build === false) {
    this.clear();
  } // create text node


  this.node.appendChild(globals.document.createTextNode(text));
  return this;
} // Get length of text element

function length() {
  return this.node.getComputedTextLength();
}

var textable = ({
  plain: plain,
  length: length
});

class Text extends Shape {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('text', node), node);
    this.dom.leading = new SVGNumber(1.3); // store leading value for rebuilding

    this._rebuild = true; // enable automatic updating of dy values

    this._build = false; // disable build mode for adding multiple lines
    // set default font

    this.attr('font-family', attrs['font-family']);
  } // Move over x-axis


  x(x) {
    // act as getter
    if (x == null) {
      return this.attr('x');
    }

    return this.attr('x', x);
  } // Move over y-axis


  y(y) {
    var oy = this.attr('y');
    var o = typeof oy === 'number' ? oy - this.bbox().y : 0; // act as getter

    if (y == null) {
      return typeof oy === 'number' ? oy - o : oy;
    }

    return this.attr('y', typeof y === 'number' ? y + o : y);
  } // Move center over x-axis


  cx(x) {
    return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2);
  } // Move center over y-axis


  cy(y) {
    return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2);
  } // Set the text content


  text(text) {
    // act as getter
    if (text === undefined) {
      var children = this.node.childNodes;
      var firstLine = 0;
      text = '';

      for (var i = 0, len = children.length; i < len; ++i) {
        // skip textPaths - they are no lines
        if (children[i].nodeName === 'textPath') {
          if (i === 0) firstLine = 1;
          continue;
        } // add newline if its not the first child and newLined is set to true


        if (i !== firstLine && children[i].nodeType !== 3 && adopt(children[i]).dom.newLined === true) {
          text += '\n';
        } // add content of this node


        text += children[i].textContent;
      }

      return text;
    } // remove existing content


    this.clear().build(true);

    if (typeof text === 'function') {
      // call block
      text.call(this, this);
    } else {
      // store text and make sure text is not blank
      text = text.split('\n'); // build new lines

      for (var j = 0, jl = text.length; j < jl; j++) {
        this.tspan(text[j]).newLine();
      }
    } // disable build mode and rebuild lines


    return this.build(false).rebuild();
  } // Set / get leading


  leading(value) {
    // act as getter
    if (value == null) {
      return this.dom.leading;
    } // act as setter


    this.dom.leading = new SVGNumber(value);
    return this.rebuild();
  } // Rebuild appearance type


  rebuild(rebuild) {
    // store new rebuild flag if given
    if (typeof rebuild === 'boolean') {
      this._rebuild = rebuild;
    } // define position of all lines


    if (this._rebuild) {
      var self = this;
      var blankLineOffset = 0;
      var leading = this.dom.leading;
      this.each(function () {
        var fontSize = globals.window.getComputedStyle(this.node).getPropertyValue('font-size');
        var dy = leading * new SVGNumber(fontSize);

        if (this.dom.newLined) {
          this.attr('x', self.attr('x'));

          if (this.text() === '\n') {
            blankLineOffset += dy;
          } else {
            this.attr('dy', dy + blankLineOffset);
            blankLineOffset = 0;
          }
        }
      });
      this.fire('rebuild');
    }

    return this;
  } // Enable / disable build mode


  build(build) {
    this._build = !!build;
    return this;
  } // overwrite method from parent to set data properly


  setData(o) {
    this.dom = o;
    this.dom.leading = new SVGNumber(o.leading || 1.3);
    return this;
  }

}
extend(Text, textable);
registerMethods({
  Container: {
    // Create text element
    text: wrapWithAttrCheck(function (text) {
      return this.put(new Text()).text(text);
    }),
    // Create plain text element
    plain: wrapWithAttrCheck(function (text) {
      return this.put(new Text()).plain(text);
    })
  }
});
register(Text);

class Tspan extends Text {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('tspan', node), node);
  } // Set text content


  text(text) {
    if (text == null) return this.node.textContent + (this.dom.newLined ? '\n' : '');
    typeof text === 'function' ? text.call(this, this) : this.plain(text);
    return this;
  } // Shortcut dx


  dx(dx) {
    return this.attr('dx', dx);
  } // Shortcut dy


  dy(dy) {
    return this.attr('dy', dy);
  } // Create new line


  newLine() {
    // fetch text parent
    var t = this.parent(Text); // mark new line

    this.dom.newLined = true; // apply new position

    return this.dy(t.dom.leading * t.attr('font-size')).attr('x', t.x());
  }

}
extend(Tspan, textable);
registerMethods({
  Tspan: {
    tspan: wrapWithAttrCheck(function (text) {
      var tspan = new Tspan(); // clear if build mode is disabled

      if (!this._build) {
        this.clear();
      } // add new tspan


      this.node.appendChild(tspan.node);
      return tspan.text(text);
    })
  }
});
register(Tspan);

class ClipPath extends Container {
  constructor(node) {
    super(nodeOrNew('clipPath', node), node);
  } // Unclip all clipped elements and remove itself


  remove() {
    // unclip all targets
    this.targets().forEach(function (el) {
      el.unclip();
    }); // remove clipPath from parent

    return super.remove();
  }

  targets() {
    return baseFind('svg [clip-path*="' + this.id() + '"]');
  }

}
registerMethods({
  Container: {
    // Create clipping element
    clip: wrapWithAttrCheck(function () {
      return this.defs().put(new ClipPath());
    })
  },
  Element: {
    // Distribute clipPath to svg element
    clipWith(element) {
      // use given clip or create a new one
      let clipper = element instanceof ClipPath ? element : this.parent().clip().add(element); // apply mask

      return this.attr('clip-path', 'url("#' + clipper.id() + '")');
    },

    // Unclip element
    unclip() {
      return this.attr('clip-path', null);
    },

    clipper() {
      return this.reference('clip-path');
    }

  }
});
register(ClipPath);

class G extends Container {
  constructor(node) {
    super(nodeOrNew('g', node), node);
  }

  x(x, box = this.bbox()) {
    if (x == null) return box.x;
    this.children().dx(x - box.x);
    return this;
  }

  y(y, box = this.bbox()) {
    if (y == null) return box.y;
    this.children().dy(y - box.y);
    return this;
  }

  move(x, y) {
    const box = this.bbox();
    return this.x(x, box).y(y, box);
  }

  dx(dx) {
    return this.children().dx(dx);
  }

  dy(dy) {
    return this.children().dy(dy);
  }

  width(width, box = this.bbox()) {
    if (width == null) return box.width;
    const scale = width / box.width;
    this.each(function () {
      const _width = this.width();

      const _x = this.x();

      this.width(_width * scale);
      this.x((_x - box.x) * scale + box.x);
    });
    return this;
  }

  height(height, box = this.bbox()) {
    if (height == null) return box.height;
    const scale = height / box.height;
    this.each(function () {
      const _height = this.height();

      const _y = this.y();

      this.height(_height * scale);
      this.y((_y - box.y) * scale + box.y);
    });
    return this;
  }

  size(width, height) {
    const box = this.bbox();
    const p = proportionalSize(this, width, height, box);
    return this.width(new SVGNumber(p.width), box).height(new SVGNumber(p.height), box);
  }

}
registerMethods({
  Element: {
    // Create a group element
    group: wrapWithAttrCheck(function () {
      return this.put(new G());
    })
  }
});
register(G);

class A extends Container {
  constructor(node) {
    super(nodeOrNew('a', node), node);
  } // Link url


  to(url) {
    return this.attr('href', url, xlink);
  } // Link target attribute


  target(target) {
    return this.attr('target', target);
  }

}
registerMethods({
  Container: {
    // Create a hyperlink element
    link: wrapWithAttrCheck(function (url) {
      return this.put(new A()).to(url);
    })
  },
  Element: {
    // Create a hyperlink element
    linkTo: function (url) {
      var link = new A();

      if (typeof url === 'function') {
        url.call(link, link);
      } else {
        link.to(url);
      }

      return this.parent().put(link).put(this);
    }
  }
});
register(A);

class Mask extends Container {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('mask', node), node);
  } // Unmask all masked elements and remove itself


  remove() {
    // unmask all targets
    this.targets().forEach(function (el) {
      el.unmask();
    }); // remove mask from parent

    return super.remove();
  }

  targets() {
    return baseFind('svg [mask*="' + this.id() + '"]');
  }

}
registerMethods({
  Container: {
    mask: wrapWithAttrCheck(function () {
      return this.defs().put(new Mask());
    })
  },
  Element: {
    // Distribute mask to svg element
    maskWith(element) {
      // use given mask or create a new one
      var masker = element instanceof Mask ? element : this.parent().mask().add(element); // apply mask

      return this.attr('mask', 'url("#' + masker.id() + '")');
    },

    // Unmask element
    unmask() {
      return this.attr('mask', null);
    },

    masker() {
      return this.reference('mask');
    }

  }
});
register(Mask);

function cssRule(selector, rule) {
  if (!selector) return '';
  if (!rule) return selector;
  var ret = selector + '{';

  for (var i in rule) {
    ret += unCamelCase(i) + ':' + rule[i] + ';';
  }

  ret += '}';
  return ret;
}

class Style extends Element {
  constructor(node) {
    super(nodeOrNew('style', node), node);
  }

  addText(w = '') {
    this.node.textContent += w;
    return this;
  }

  font(name, src, params = {}) {
    return this.rule('@font-face', _objectSpread({
      fontFamily: name,
      src: src
    }, params));
  }

  rule(selector, obj) {
    return this.addText(cssRule(selector, obj));
  }

}
registerMethods('Dom', {
  style: wrapWithAttrCheck(function (selector, obj) {
    return this.put(new Style()).rule(selector, obj);
  }),
  fontface: wrapWithAttrCheck(function (name, src, params) {
    return this.put(new Style()).font(name, src, params);
  })
});
register(Style);

class TextPath extends Text {
  // Initialize node
  constructor(node) {
    super(nodeOrNew('textPath', node), node);
  } // return the array of the path track element


  array() {
    var track = this.track();
    return track ? track.array() : null;
  } // Plot path if any


  plot(d) {
    var track = this.track();
    var pathArray = null;

    if (track) {
      pathArray = track.plot(d);
    }

    return d == null ? pathArray : this;
  } // Get the path element


  track() {
    return this.reference('href');
  }

}
registerMethods({
  Container: {
    textPath: wrapWithAttrCheck(function (text, path) {
      return this.defs().path(path).text(text).addTo(this);
    })
  },
  Text: {
    // Create path for text to run on
    path: wrapWithAttrCheck(function (track) {
      var path = new TextPath(); // if track is a path, reuse it

      if (!(track instanceof Path)) {
        // create path element
        track = this.root().defs().path(track);
      } // link textPath to path and add content


      path.attr('href', '#' + track, xlink); // add textPath element as child node and return textPath

      return this.put(path);
    }),

    // Get the textPath children
    textPath() {
      return this.find('textPath')[0];
    }

  },
  Path: {
    // creates a textPath from this path
    text: wrapWithAttrCheck(function (text) {
      if (text instanceof Text) {
        var txt = text.text();
        return text.clear().path(this).text(txt);
      }

      return this.parent().put(new Text()).path(this).text(text);
    }),

    targets() {
      return baseFind('svg [href*="' + this.id() + '"]');
    }

  }
});
TextPath.prototype.MorphArray = PathArray;
register(TextPath);

class Use extends Shape {
  constructor(node) {
    super(nodeOrNew('use', node), node);
  } // Use element as a reference


  element(element, file) {
    // Set lined element
    return this.attr('href', (file || '') + '#' + element, xlink);
  }

}
registerMethods({
  Container: {
    // Create a use element
    use: wrapWithAttrCheck(function (element, file) {
      return this.put(new Use()).element(element, file);
    })
  }
});
register(Use);

/* Optional Modules */
const SVG = makeInstance;
extend([Svg$1, Symbol, Image, Pattern, Marker], getMethodsFor('viewbox'));
extend([Line, Polyline, Polygon, Path], getMethodsFor('marker'));
extend(Text, getMethodsFor('Text'));
extend(Path, getMethodsFor('Path'));
extend(Defs, getMethodsFor('Defs'));
extend([Text, Tspan], getMethodsFor('Tspan'));
extend([Rect, Ellipse, Circle, Gradient], getMethodsFor('radius'));
extend(EventTarget, getMethodsFor('EventTarget'));
extend(Dom, getMethodsFor('Dom'));
extend(Element, getMethodsFor('Element'));
extend(Shape, getMethodsFor('Shape')); // extend(Element, getConstructor('Memory'))

extend(Container, getMethodsFor('Container'));
extend(Runner, getMethodsFor('Runner'));
List.extend(getMethodNames());
registerMorphableType([SVGNumber, Color, Box, Matrix, SVGArray, PointArray, PathArray]);
makeMorphable();

exports.Morphable = Morphable;
exports.registerMorphableType = registerMorphableType;
exports.makeMorphable = makeMorphable;
exports.TransformBag = TransformBag;
exports.ObjectBag = ObjectBag;
exports.NonMorphable = NonMorphable;
exports.defaults = defaults;
exports.utils = utils;
exports.namespaces = namespaces;
exports.regex = regex;
exports.SVG = SVG;
exports.parser = parser;
exports.find = baseFind;
exports.registerWindow = registerWindow;
exports.Animator = Animator;
exports.Controller = Controller;
exports.Ease = Ease;
exports.PID = PID;
exports.Spring = Spring;
exports.easing = easing;
exports.Queue = Queue;
exports.Runner = Runner;
exports.Timeline = Timeline;
exports.Array = SVGArray;
exports.Box = Box;
exports.Color = Color;
exports.EventTarget = EventTarget;
exports.Matrix = Matrix;
exports.Number = SVGNumber;
exports.PathArray = PathArray;
exports.Point = Point;
exports.PointArray = PointArray;
exports.List = List;
exports.Circle = Circle;
exports.ClipPath = ClipPath;
exports.Container = Container;
exports.Defs = Defs;
exports.Dom = Dom;
exports.Element = Element;
exports.Ellipse = Ellipse;
exports.Gradient = Gradient;
exports.G = G;
exports.A = A;
exports.Image = Image;
exports.Line = Line;
exports.Marker = Marker;
exports.Mask = Mask;
exports.Path = Path;
exports.Pattern = Pattern;
exports.Polygon = Polygon;
exports.Polyline = Polyline;
exports.Rect = Rect;
exports.Shape = Shape;
exports.Stop = Stop;
exports.Style = Style;
exports.Svg = Svg$1;
exports.Symbol = Symbol;
exports.Text = Text;
exports.TextPath = TextPath;
exports.Tspan = Tspan;
exports.Use = Use;
exports.on = on;
exports.off = off;
exports.dispatch = dispatch;
exports.root = root;
exports.create = create;
exports.makeInstance = makeInstance;
exports.nodeOrNew = nodeOrNew;
exports.adopt = adopt;
exports.mockAdopt = mockAdopt;
exports.register = register;
exports.getClass = getClass;
exports.eid = eid;
exports.assignNewId = assignNewId;
exports.extend = extend;
exports.wrapWithAttrCheck = wrapWithAttrCheck;
//# sourceMappingURL=svg.node.js.map


/***/ }),

/***/ "./node_modules/bezier-easing/src/index.js":
/*!*************************************************!*\
  !*** ./node_modules/bezier-easing/src/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

function LinearEasing (x) {
  return x;
}

module.exports = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};


/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix.js":
/*!*************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix.js ***!
  \*************************************************/
/*! exports provided: glMatrix, mat2, mat2d, mat3, mat4, quat, quat2, vec2, vec3, vec4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _gl_matrix_common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gl-matrix/common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "glMatrix", function() { return _gl_matrix_common_js__WEBPACK_IMPORTED_MODULE_0__; });
/* harmony import */ var _gl_matrix_mat2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gl-matrix/mat2.js */ "./node_modules/gl-matrix/lib/gl-matrix/mat2.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "mat2", function() { return _gl_matrix_mat2_js__WEBPACK_IMPORTED_MODULE_1__; });
/* harmony import */ var _gl_matrix_mat2d_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./gl-matrix/mat2d.js */ "./node_modules/gl-matrix/lib/gl-matrix/mat2d.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "mat2d", function() { return _gl_matrix_mat2d_js__WEBPACK_IMPORTED_MODULE_2__; });
/* harmony import */ var _gl_matrix_mat3_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gl-matrix/mat3.js */ "./node_modules/gl-matrix/lib/gl-matrix/mat3.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "mat3", function() { return _gl_matrix_mat3_js__WEBPACK_IMPORTED_MODULE_3__; });
/* harmony import */ var _gl_matrix_mat4_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./gl-matrix/mat4.js */ "./node_modules/gl-matrix/lib/gl-matrix/mat4.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "mat4", function() { return _gl_matrix_mat4_js__WEBPACK_IMPORTED_MODULE_4__; });
/* harmony import */ var _gl_matrix_quat_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gl-matrix/quat.js */ "./node_modules/gl-matrix/lib/gl-matrix/quat.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "quat", function() { return _gl_matrix_quat_js__WEBPACK_IMPORTED_MODULE_5__; });
/* harmony import */ var _gl_matrix_quat2_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gl-matrix/quat2.js */ "./node_modules/gl-matrix/lib/gl-matrix/quat2.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "quat2", function() { return _gl_matrix_quat2_js__WEBPACK_IMPORTED_MODULE_6__; });
/* harmony import */ var _gl_matrix_vec2_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./gl-matrix/vec2.js */ "./node_modules/gl-matrix/lib/gl-matrix/vec2.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "vec2", function() { return _gl_matrix_vec2_js__WEBPACK_IMPORTED_MODULE_7__; });
/* harmony import */ var _gl_matrix_vec3_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./gl-matrix/vec3.js */ "./node_modules/gl-matrix/lib/gl-matrix/vec3.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "vec3", function() { return _gl_matrix_vec3_js__WEBPACK_IMPORTED_MODULE_8__; });
/* harmony import */ var _gl_matrix_vec4_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./gl-matrix/vec4.js */ "./node_modules/gl-matrix/lib/gl-matrix/vec4.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "vec4", function() { return _gl_matrix_vec4_js__WEBPACK_IMPORTED_MODULE_9__; });













/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/common.js":
/*!********************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/common.js ***!
  \********************************************************/
/*! exports provided: EPSILON, ARRAY_TYPE, RANDOM, setMatrixArrayType, toRadian, equals */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EPSILON", function() { return EPSILON; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ARRAY_TYPE", function() { return ARRAY_TYPE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RANDOM", function() { return RANDOM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMatrixArrayType", function() { return setMatrixArrayType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toRadian", function() { return toRadian; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/**
 * Common utilities
 * @module glMatrix
 */

// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var RANDOM = Math.random;

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}

var degree = Math.PI / 180;

/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */
function toRadian(a) {
  return a * degree;
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
function equals(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/mat2.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/mat2.js ***!
  \******************************************************/
/*! exports provided: create, clone, copy, identity, fromValues, set, transpose, invert, adjoint, determinant, multiply, rotate, scale, fromRotation, fromScaling, str, frob, LDU, add, subtract, exactEquals, equals, multiplyScalar, multiplyScalarAndAdd, mul, sub */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transpose", function() { return transpose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjoint", function() { return adjoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determinant", function() { return determinant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotate", function() { return rotate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotation", function() { return fromRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromScaling", function() { return fromScaling; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "frob", function() { return frob; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LDU", function() { return LDU; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalar", function() { return multiplyScalar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalarAndAdd", function() { return multiplyScalarAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 2x2 Matrix
 * @module mat2
 */

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[1] = 0;
    out[2] = 0;
  }
  out[0] = 1;
  out[3] = 1;
  return out;
}

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}

/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */
function fromValues(m00, m01, m10, m11) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}

/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */
function set(out, m00, m01, m10, m11) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache
  // some values
  if (out === a) {
    var a1 = a[1];
    out[1] = a[2];
    out[2] = a1;
  } else {
    out[0] = a[0];
    out[1] = a[2];
    out[2] = a[1];
    out[3] = a[3];
  }

  return out;
}

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
function invert(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];

  // Calculate the determinant
  var det = a0 * a3 - a2 * a1;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = a3 * det;
  out[1] = -a1 * det;
  out[2] = -a2 * det;
  out[3] = a0 * det;

  return out;
}

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
function adjoint(out, a) {
  // Caching this value is nessecary if out == a
  var a0 = a[0];
  out[0] = a[3];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a0;

  return out;
}

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
  return a[0] * a[3] - a[2] * a[1];
}

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
function multiply(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  return out;
}

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
function rotate(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  return out;
}

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
function scale(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
function fromRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2} out
 */
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  return out;
}

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
  return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
}

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
}

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix
 * @param {mat2} D the diagonal matrix
 * @param {mat2} U the upper triangular matrix
 * @param {mat2} a the input matrix to factorize
 */

function LDU(L, D, U, a) {
  L[2] = a[2] / a[0];
  U[0] = a[0];
  U[1] = a[1];
  U[3] = a[3] - L[2] * U[1];
  return [L, D, U];
}

/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}

/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link mat2.subtract}
 * @function
 */
var sub = subtract;

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/mat2d.js":
/*!*******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/mat2d.js ***!
  \*******************************************************/
/*! exports provided: create, clone, copy, identity, fromValues, set, invert, determinant, multiply, rotate, scale, translate, fromRotation, fromScaling, fromTranslation, str, frob, add, subtract, multiplyScalar, multiplyScalarAndAdd, exactEquals, equals, mul, sub */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determinant", function() { return determinant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotate", function() { return rotate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "translate", function() { return translate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotation", function() { return fromRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromScaling", function() { return fromScaling; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromTranslation", function() { return fromTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "frob", function() { return frob; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalar", function() { return multiplyScalar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalarAndAdd", function() { return multiplyScalarAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 2x3 Matrix
 * @module mat2d
 *
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](6);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[4] = 0;
    out[5] = 0;
  }
  out[0] = 1;
  out[3] = 1;
  return out;
}

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](6);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  return out;
}

/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */
function fromValues(a, b, c, d, tx, ty) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](6);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}

/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */
function set(out, a, b, c, d, tx, ty) {
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
function invert(out, a) {
  var aa = a[0],
      ab = a[1],
      ac = a[2],
      ad = a[3];
  var atx = a[4],
      aty = a[5];

  var det = aa * ad - ab * ac;
  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
  return a[0] * a[3] - a[1] * a[2];
}

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
function multiply(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  out[4] = a0 * b4 + a2 * b5 + a4;
  out[5] = a1 * b4 + a3 * b5 + a5;
  return out;
}

/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
function rotate(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  out[4] = a4;
  out[5] = a5;
  return out;
}

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
function scale(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  out[4] = a4;
  out[5] = a5;
  return out;
}

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
function translate(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0;
  out[1] = a1;
  out[2] = a2;
  out[3] = a3;
  out[4] = a0 * v0 + a2 * v1 + a4;
  out[5] = a1 * v0 + a3 * v1 + a5;
  return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
function fromRotation(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  out[4] = 0;
  out[5] = 0;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2d} out
 */
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  out[4] = 0;
  out[5] = 0;
  return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat2d} out
 */
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = v[0];
  out[5] = v[1];
  return out;
}

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
  return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ')';
}

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1);
}

/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  return out;
}

/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a5), Math.abs(b5));
}

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link mat2d.subtract}
 * @function
 */
var sub = subtract;

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/mat3.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/mat3.js ***!
  \******************************************************/
/*! exports provided: create, fromMat4, clone, copy, fromValues, set, identity, transpose, invert, adjoint, determinant, multiply, translate, rotate, scale, fromTranslation, fromRotation, fromScaling, fromMat2d, fromQuat, normalFromMat4, projection, str, frob, add, subtract, multiplyScalar, multiplyScalarAndAdd, exactEquals, equals, mul, sub */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromMat4", function() { return fromMat4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transpose", function() { return transpose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjoint", function() { return adjoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determinant", function() { return determinant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "translate", function() { return translate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotate", function() { return rotate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromTranslation", function() { return fromTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotation", function() { return fromRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromScaling", function() { return fromScaling; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromMat2d", function() { return fromMat2d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromQuat", function() { return fromQuat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalFromMat4", function() { return normalFromMat4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "projection", function() { return projection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "frob", function() { return frob; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalar", function() { return multiplyScalar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalarAndAdd", function() { return multiplyScalarAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](9);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}

/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */
function fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */
function set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out;
}

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];

  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20;

  // Calculate the determinant
  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];

  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];

  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];

  var b00 = b[0],
      b01 = b[1],
      b02 = b[2];
  var b10 = b[3],
      b11 = b[4],
      b12 = b[5];
  var b20 = b[6],
      b21 = b[7],
      b22 = b[8];

  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;

  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;

  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
function translate(out, a, v) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      x = v[0],
      y = v[1];

  out[0] = a00;
  out[1] = a01;
  out[2] = a02;

  out[3] = a10;
  out[4] = a11;
  out[5] = a12;

  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function rotate(out, a, rad) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      s = Math.sin(rad),
      c = Math.cos(rad);

  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;

  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;

  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
function scale(out, a, v) {
  var x = v[0],
      y = v[1];

  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];

  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];

  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function fromRotation(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);

  out[0] = c;
  out[1] = s;
  out[2] = 0;

  out[3] = -s;
  out[4] = c;
  out[5] = 0;

  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;

  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;

  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;

  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;

  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;

  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;

  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;

  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;

  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;

  return out;
}

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
function normalFromMat4(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

  return out;
}

/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */
function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
  return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ')';
}

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
}

/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}

/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7],
      a8 = a[8];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7],
      b8 = b[8];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a8), Math.abs(b8));
}

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link mat3.subtract}
 * @function
 */
var sub = subtract;

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/mat4.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/mat4.js ***!
  \******************************************************/
/*! exports provided: create, clone, copy, fromValues, set, identity, transpose, invert, adjoint, determinant, multiply, translate, scale, rotate, rotateX, rotateY, rotateZ, fromTranslation, fromScaling, fromRotation, fromXRotation, fromYRotation, fromZRotation, fromRotationTranslation, fromQuat2, getTranslation, getScaling, getRotation, fromRotationTranslationScale, fromRotationTranslationScaleOrigin, fromQuat, frustum, perspective, perspectiveFromFieldOfView, ortho, lookAt, targetTo, str, frob, add, subtract, multiplyScalar, multiplyScalarAndAdd, exactEquals, equals, mul, sub */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transpose", function() { return transpose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjoint", function() { return adjoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determinant", function() { return determinant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "translate", function() { return translate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotate", function() { return rotate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateX", function() { return rotateX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateY", function() { return rotateY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateZ", function() { return rotateZ; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromTranslation", function() { return fromTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromScaling", function() { return fromScaling; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotation", function() { return fromRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromXRotation", function() { return fromXRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromYRotation", function() { return fromYRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromZRotation", function() { return fromZRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotationTranslation", function() { return fromRotationTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromQuat2", function() { return fromQuat2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTranslation", function() { return getTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScaling", function() { return getScaling; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRotation", function() { return getRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotationTranslationScale", function() { return fromRotationTranslationScale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotationTranslationScaleOrigin", function() { return fromRotationTranslationScaleOrigin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromQuat", function() { return fromQuat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "frustum", function() { return frustum; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "perspective", function() { return perspective; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "perspectiveFromFieldOfView", function() { return perspectiveFromFieldOfView; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ortho", function() { return ortho; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lookAt", function() { return lookAt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "targetTo", function() { return targetTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "frob", function() { return frob; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalar", function() { return multiplyScalar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiplyScalarAndAdd", function() { return multiplyScalarAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](16);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */
function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];

    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}

/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  // Cache only the current line of the second matrix
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00 = void 0,
      a01 = void 0,
      a02 = void 0,
      a03 = void 0;
  var a10 = void 0,
      a11 = void 0,
      a12 = void 0,
      a13 = void 0;
  var a20 = void 0,
      a21 = void 0,
      a22 = void 0,
      a23 = void 0;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
    a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
    a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

    out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
    out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
    out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;

    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];

  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function rotate(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s = void 0,
      c = void 0,
      t = void 0;
  var a00 = void 0,
      a01 = void 0,
      a02 = void 0,
      a03 = void 0;
  var a10 = void 0,
      a11 = void 0,
      a12 = void 0,
      a13 = void 0;
  var a20 = void 0,
      a21 = void 0,
      a22 = void 0,
      a23 = void 0;
  var b00 = void 0,
      b01 = void 0,
      b02 = void 0;
  var b10 = void 0,
      b11 = void 0,
      b12 = void 0;
  var b20 = void 0,
      b21 = void 0,
      b22 = void 0;

  if (len < _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"]) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
  a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
  a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

  // Construct the elements of the rotation matrix
  b00 = x * x * t + c;b01 = y * x * t + z * s;b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;b11 = y * y * t + c;b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;b21 = y * z * t - x * s;b22 = z * z * t + c;

  // Perform rotation-specific matrix multiplication
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  // Perform axis-specific matrix multiplication
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function fromRotation(out, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.sqrt(x * x + y * y + z * z);
  var s = void 0,
      c = void 0,
      t = void 0;

  if (len < _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"]) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  // Perform rotation-specific matrix multiplication
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
function fromRotationTranslation(out, q, v) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;

  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;

  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;

  return out;
}

/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {quat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */
function fromQuat2(out, a) {
  var translation = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](3);
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];

  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  //Only scale if it makes sense
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];

  return out;
}

/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];

  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);

  return out;
}

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
function getRotation(out, mat) {
  // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  var trace = mat[0] + mat[5] + mat[10];
  var S = 0;

  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (mat[6] - mat[9]) / S;
    out[1] = (mat[8] - mat[2]) / S;
    out[2] = (mat[1] - mat[4]) / S;
  } else if (mat[0] > mat[5] && mat[0] > mat[10]) {
    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
    out[3] = (mat[6] - mat[9]) / S;
    out[0] = 0.25 * S;
    out[1] = (mat[1] + mat[4]) / S;
    out[2] = (mat[8] + mat[2]) / S;
  } else if (mat[5] > mat[10]) {
    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
    out[3] = (mat[8] - mat[2]) / S;
    out[0] = (mat[1] + mat[4]) / S;
    out[1] = 0.25 * S;
    out[2] = (mat[6] + mat[9]) / S;
  } else {
    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
    out[3] = (mat[1] - mat[4]) / S;
    out[0] = (mat[8] + mat[2]) / S;
    out[1] = (mat[6] + mat[9]) / S;
    out[2] = 0.25 * S;
  }

  return out;
}

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */
function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;

  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];

  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;

  return out;
}

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;

  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;

  var sx = s[0];
  var sy = s[1];
  var sz = s[2];

  var ox = o[0];
  var oy = o[1];
  var oz = o[2];

  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;

  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;

  return out;
}

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;

  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;

  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;

  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;

  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;

  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;

  return out;
}

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}

/**
 * Generates a perspective projection matrix with the given bounds.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf = void 0;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);

  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1.0;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = far * near / (near - far);
  out[15] = 0.0;
  return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function ortho(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function lookAt(out, eye, center, up) {
  var x0 = void 0,
      x1 = void 0,
      x2 = void 0,
      y0 = void 0,
      y1 = void 0,
      y2 = void 0,
      z0 = void 0,
      z1 = void 0,
      z2 = void 0,
      len = void 0;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (Math.abs(eyex - centerx) < _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] && Math.abs(eyey - centery) < _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] && Math.abs(eyez - centerz) < _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"]) {
    return identity(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;

  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;

  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;

  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;

  return out;
}

/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function targetTo(out, eye, target, up) {
  var eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];

  var z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];

  var len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  var x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;

  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
  return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
}

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
function frob(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
}

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}

/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var a8 = a[8],
      a9 = a[9],
      a10 = a[10],
      a11 = a[11];
  var a12 = a[12],
      a13 = a[13],
      a14 = a[14],
      a15 = a[15];

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  var b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  var b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11];
  var b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];

  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link mat4.subtract}
 * @function
 */
var sub = subtract;

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/quat.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/quat.js ***!
  \******************************************************/
/*! exports provided: create, identity, setAxisAngle, getAxisAngle, multiply, rotateX, rotateY, rotateZ, calculateW, slerp, random, invert, conjugate, fromMat3, fromEuler, str, clone, fromValues, copy, set, add, mul, scale, dot, lerp, length, len, squaredLength, sqrLen, normalize, exactEquals, equals, rotationTo, sqlerp, setAxes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAxisAngle", function() { return setAxisAngle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAxisAngle", function() { return getAxisAngle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateX", function() { return rotateX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateY", function() { return rotateY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateZ", function() { return rotateZ; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateW", function() { return calculateW; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slerp", function() { return slerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "random", function() { return random; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "conjugate", function() { return conjugate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromMat3", function() { return fromMat3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromEuler", function() { return fromEuler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dot", function() { return dot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lerp", function() { return lerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "length", function() { return length; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "len", function() { return len; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredLength", function() { return squaredLength; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrLen", function() { return sqrLen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotationTo", function() { return rotationTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqlerp", function() { return sqlerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAxes", function() { return setAxes; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");
/* harmony import */ var _mat3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3.js */ "./node_modules/gl-matrix/lib/gl-matrix/mat3.js");
/* harmony import */ var _vec3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec3.js */ "./node_modules/gl-matrix/lib/gl-matrix/vec3.js");
/* harmony import */ var _vec4_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec4.js */ "./node_modules/gl-matrix/lib/gl-matrix/vec4.js");





/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}

/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {quat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2.0;
  var s = Math.sin(rad / 2.0);
  if (s > _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"]) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    // If s is zero, return any axis (no rotation - axis does not matter)
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
function multiply(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];

  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateX(out, a, rad) {
  rad *= 0.5;

  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);

  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateY(out, a, rad) {
  rad *= 0.5;

  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);

  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateZ(out, a, rad) {
  rad *= 0.5;

  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bz = Math.sin(rad),
      bw = Math.cos(rad);

  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
function calculateW(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2];

  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */
function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];

  var omega = void 0,
      cosom = void 0,
      sinom = void 0,
      scale0 = void 0,
      scale1 = void 0;

  // calc cosine
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  // adjust signs (if necessary)
  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  // calculate coefficients
  if (1.0 - cosom > _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"]) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  }
  // calculate final values
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;

  return out;
}

/**
 * Generates a random quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function random(out) {
  // Implementation of http://planning.cs.uiuc.edu/node198.html
  // TODO: Calling random 3 times is probably not the fastest solution
  var u1 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]();
  var u2 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]();
  var u3 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]();

  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);

  out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
  return out;
}

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
function invert(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0;

  // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot = void 0;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;

    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}

/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */
function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;

  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);

  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;

  return out;
}

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function str(a) {
  return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
}

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
var clone = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["clone"];

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
var fromValues = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["fromValues"];

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
var copy = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["copy"];

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
var set = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["set"];

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
var add = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["add"];

/**
 * Alias for {@link quat.multiply}
 * @function
 */
var mul = multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
var scale = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["scale"];

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
var dot = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["dot"];

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */
var lerp = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["lerp"];

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 */
var length = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["length"];

/**
 * Alias for {@link quat.length}
 * @function
 */
var len = length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
var squaredLength = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["squaredLength"];

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
var sqrLen = squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
var normalize = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["normalize"];

/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat} a The first quaternion.
 * @param {quat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
var exactEquals = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["exactEquals"];

/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {quat} a The first vector.
 * @param {quat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
var equals = _vec4_js__WEBPACK_IMPORTED_MODULE_3__["equals"];

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
var rotationTo = function () {
  var tmpvec3 = _vec3_js__WEBPACK_IMPORTED_MODULE_2__["create"]();
  var xUnitVec3 = _vec3_js__WEBPACK_IMPORTED_MODULE_2__["fromValues"](1, 0, 0);
  var yUnitVec3 = _vec3_js__WEBPACK_IMPORTED_MODULE_2__["fromValues"](0, 1, 0);

  return function (out, a, b) {
    var dot = _vec3_js__WEBPACK_IMPORTED_MODULE_2__["dot"](a, b);
    if (dot < -0.999999) {
      _vec3_js__WEBPACK_IMPORTED_MODULE_2__["cross"](tmpvec3, xUnitVec3, a);
      if (_vec3_js__WEBPACK_IMPORTED_MODULE_2__["len"](tmpvec3) < 0.000001) _vec3_js__WEBPACK_IMPORTED_MODULE_2__["cross"](tmpvec3, yUnitVec3, a);
      _vec3_js__WEBPACK_IMPORTED_MODULE_2__["normalize"](tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      _vec3_js__WEBPACK_IMPORTED_MODULE_2__["cross"](tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize(out, out);
    }
  };
}();

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */
var sqlerp = function () {
  var temp1 = create();
  var temp2 = create();

  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));

    return out;
  };
}();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
var setAxes = function () {
  var matr = _mat3_js__WEBPACK_IMPORTED_MODULE_1__["create"]();

  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];

    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];

    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];

    return normalize(out, fromMat3(out, matr));
  };
}();

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/quat2.js":
/*!*******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/quat2.js ***!
  \*******************************************************/
/*! exports provided: create, clone, fromValues, fromRotationTranslationValues, fromRotationTranslation, fromTranslation, fromRotation, fromMat4, copy, identity, set, getReal, getDual, setReal, setDual, getTranslation, translate, rotateX, rotateY, rotateZ, rotateByQuatAppend, rotateByQuatPrepend, rotateAroundAxis, add, multiply, mul, scale, dot, lerp, invert, conjugate, length, len, squaredLength, sqrLen, normalize, str, exactEquals, equals */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotationTranslationValues", function() { return fromRotationTranslationValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotationTranslation", function() { return fromRotationTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromTranslation", function() { return fromTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRotation", function() { return fromRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromMat4", function() { return fromMat4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getReal", function() { return getReal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDual", function() { return getDual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setReal", function() { return setReal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setDual", function() { return setDual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTranslation", function() { return getTranslation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "translate", function() { return translate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateX", function() { return rotateX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateY", function() { return rotateY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateZ", function() { return rotateZ; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateByQuatAppend", function() { return rotateByQuatAppend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateByQuatPrepend", function() { return rotateByQuatPrepend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateAroundAxis", function() { return rotateAroundAxis; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dot", function() { return dot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lerp", function() { return lerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "conjugate", function() { return conjugate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "length", function() { return length; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "len", function() { return len; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredLength", function() { return squaredLength; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrLen", function() { return sqrLen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");
/* harmony import */ var _quat_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./quat.js */ "./node_modules/gl-matrix/lib/gl-matrix/quat.js");
/* harmony import */ var _mat4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat4.js */ "./node_modules/gl-matrix/lib/gl-matrix/mat4.js");




/**
 * Dual Quaternion<br>
 * Format: [real, dual]<br>
 * Quaternion format: XYZW<br>
 * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
 * @module quat2
 */

/**
 * Creates a new identity dual quat
 *
 * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
 */
function create() {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](8);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }
  dq[3] = 1;
  return dq;
}

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat2} a dual quaternion to clone
 * @returns {quat2} new dual quaternion
 * @function
 */
function clone(a) {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}

/**
 * Creates a new dual quat initialized with the given values
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} new dual quaternion
 * @function
 */
function fromValues(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}

/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component (translation)
 * @param {Number} y2 Y component (translation)
 * @param {Number} z2 Z component (translation)
 * @returns {quat2} new dual quaternion
 * @function
 */
function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5,
      ay = y2 * 0.5,
      az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}

/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param {quat2} dual quaternion receiving operation result
 * @param {quat} q quaternion
 * @param {vec3} t tranlation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */
function fromRotationTranslation(out, q, t) {
  var ax = t[0] * 0.5,
      ay = t[1] * 0.5,
      az = t[2] * 0.5,
      bx = q[0],
      by = q[1],
      bz = q[2],
      bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}

/**
 * Creates a dual quat from a translation
 *
 * @param {quat2} dual quaternion receiving operation result
 * @param {vec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */
function fromTranslation(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}

/**
 * Creates a dual quat from a quaternion
 *
 * @param {quat2} dual quaternion receiving operation result
 * @param {quat} q the quaternion
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */
function fromRotation(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}

/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param {quat2} out the dual quaternion
 * @param {mat4} a the matrix
 * @returns {quat2} dual quat receiving operation result
 * @function
 */
function fromMat4(out, a) {
  //TODO Optimize this
  var outer = _quat_js__WEBPACK_IMPORTED_MODULE_1__["create"]();
  _mat4_js__WEBPACK_IMPORTED_MODULE_2__["getRotation"](outer, a);
  var t = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](3);
  _mat4_js__WEBPACK_IMPORTED_MODULE_2__["getTranslation"](t, a);
  fromRotationTranslation(out, outer, t);
  return out;
}

/**
 * Copy the values from one dual quat to another
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the source dual quaternion
 * @returns {quat2} out
 * @function
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}

/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @returns {quat2} out
 */
function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}

/**
 * Set the components of a dual quat to the given values
 *
 * @param {quat2} out the receiving quaternion
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} out
 * @function
 */
function set(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;

  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}

/**
 * Gets the real part of a dual quat
 * @param  {quat} out real part
 * @param  {quat2} a Dual Quaternion
 * @return {quat} real part
 */
var getReal = _quat_js__WEBPACK_IMPORTED_MODULE_1__["copy"];

/**
 * Gets the dual part of a dual quat
 * @param  {quat} out dual part
 * @param  {quat2} a Dual Quaternion
 * @return {quat} dual part
 */
function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}

/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {quat} q a quaternion representing the real part
 * @returns {quat2} out
 * @function
 */
var setReal = _quat_js__WEBPACK_IMPORTED_MODULE_1__["copy"];

/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {quat} q a quaternion representing the dual part
 * @returns {quat2} out
 * @function
 */
function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}

/**
 * Gets the translation of a normalized dual quat
 * @param  {vec3} out translation
 * @param  {quat2} a Dual Quaternion to be decomposed
 * @return {vec3} translation
 */
function getTranslation(out, a) {
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}

/**
 * Translates a dual quat by the given vector
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to translate
 * @param {vec3} v vector to translate by
 * @returns {quat2} out
 */
function translate(out, a, v) {
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3],
      bx1 = v[0] * 0.5,
      by1 = v[1] * 0.5,
      bz1 = v[2] * 0.5,
      ax2 = a[4],
      ay2 = a[5],
      az2 = a[6],
      aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}

/**
 * Rotates a dual quat around the X axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */
function rotateX(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  _quat_js__WEBPACK_IMPORTED_MODULE_1__["rotateX"](out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}

/**
 * Rotates a dual quat around the Y axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */
function rotateY(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  _quat_js__WEBPACK_IMPORTED_MODULE_1__["rotateY"](out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}

/**
 * Rotates a dual quat around the Z axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */
function rotateZ(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  _quat_js__WEBPACK_IMPORTED_MODULE_1__["rotateZ"](out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}

/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {quat} q quaternion to rotate by
 * @returns {quat2} out
 */
function rotateByQuatAppend(out, a, q) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];

  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}

/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat} q quaternion to rotate by
 * @param {quat2} a the dual quaternion to rotate
 * @returns {quat2} out
 */
function rotateByQuatPrepend(out, q, a) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      bx = a[0],
      by = a[1],
      bz = a[2],
      bw = a[3];

  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}

/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the dual quaternion to rotate
 * @param {vec3} axis the axis to rotate around
 * @param {Number} rad how far the rotation should be
 * @returns {quat2} out
 */
function rotateAroundAxis(out, a, axis, rad) {
  //Special case for rad = 0
  if (Math.abs(rad) < _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"]) {
    return copy(out, a);
  }
  var axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);

  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);

  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;

  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;

  return out;
}

/**
 * Adds two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @returns {quat2} out
 * @function
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}

/**
 * Multiplies two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @returns {quat2} out
 */
function multiply(out, a, b) {
  var ax0 = a[0],
      ay0 = a[1],
      az0 = a[2],
      aw0 = a[3],
      bx1 = b[4],
      by1 = b[5],
      bz1 = b[6],
      bw1 = b[7],
      ax1 = a[4],
      ay1 = a[5],
      az1 = a[6],
      aw1 = a[7],
      bx0 = b[0],
      by0 = b[1],
      bz0 = b[2],
      bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}

/**
 * Alias for {@link quat2.multiply}
 * @function
 */
var mul = multiply;

/**
 * Scales a dual quat by a scalar number
 *
 * @param {quat2} out the receiving dual quat
 * @param {quat2} a the dual quat to scale
 * @param {Number} b amount to scale the dual quat by
 * @returns {quat2} out
 * @function
 */
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}

/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
var dot = _quat_js__WEBPACK_IMPORTED_MODULE_1__["dot"];

/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param {quat2} out the receiving dual quat
 * @param {quat2} a the first operand
 * @param {quat2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat2} out
 */
function lerp(out, a, b, t) {
  var mt = 1 - t;
  if (dot(a, b) < 0) t = -t;

  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;

  return out;
}

/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a dual quat to calculate inverse of
 * @returns {quat2} out
 */
function invert(out, a) {
  var sqlen = squaredLength(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}

/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param {quat2} out the receiving quaternion
 * @param {quat2} a quat to calculate conjugate of
 * @returns {quat2} out
 */
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}

/**
 * Calculates the length of a dual quat
 *
 * @param {quat2} a dual quat to calculate length of
 * @returns {Number} length of a
 * @function
 */
var length = _quat_js__WEBPACK_IMPORTED_MODULE_1__["length"];

/**
 * Alias for {@link quat2.length}
 * @function
 */
var len = length;

/**
 * Calculates the squared length of a dual quat
 *
 * @param {quat2} a dual quat to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
var squaredLength = _quat_js__WEBPACK_IMPORTED_MODULE_1__["squaredLength"];

/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */
var sqrLen = squaredLength;

/**
 * Normalize a dual quat
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {quat2} a dual quaternion to normalize
 * @returns {quat2} out
 * @function
 */
function normalize(out, a) {
  var magnitude = squaredLength(a);
  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);

    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;

    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];

    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;

    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;

    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }
  return out;
}

/**
 * Returns a string representation of a dual quatenion
 *
 * @param {quat2} a dual quaternion to represent as a string
 * @returns {String} string representation of the dual quat
 */
function str(a) {
  return 'quat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ')';
}

/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat2} a the first dual quaternion.
 * @param {quat2} b the second dual quaternion.
 * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}

/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param {quat2} a the first dual quat.
 * @param {quat2} b the second dual quat.
 * @returns {Boolean} true if the dual quats are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a7), Math.abs(b7));
}

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/vec2.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/vec2.js ***!
  \******************************************************/
/*! exports provided: create, clone, fromValues, copy, set, add, subtract, multiply, divide, ceil, floor, min, max, round, scale, scaleAndAdd, distance, squaredDistance, length, squaredLength, negate, inverse, normalize, dot, cross, lerp, random, transformMat2, transformMat2d, transformMat3, transformMat4, rotate, angle, str, exactEquals, equals, len, sub, mul, div, dist, sqrDist, sqrLen, forEach */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "divide", function() { return divide; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ceil", function() { return ceil; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "floor", function() { return floor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "min", function() { return min; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "max", function() { return max; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "round", function() { return round; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scaleAndAdd", function() { return scaleAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "distance", function() { return distance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredDistance", function() { return squaredDistance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "length", function() { return length; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredLength", function() { return squaredLength; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "negate", function() { return negate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inverse", function() { return inverse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dot", function() { return dot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cross", function() { return cross; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lerp", function() { return lerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "random", function() { return random; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat2", function() { return transformMat2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat2d", function() { return transformMat2d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat3", function() { return transformMat3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat4", function() { return transformMat4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotate", function() { return rotate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "angle", function() { return angle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "len", function() { return len; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "div", function() { return div; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dist", function() { return dist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrDist", function() { return sqrDist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrLen", function() { return sqrLen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return forEach; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](2);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
function fromValues(x, y) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](2);
  out[0] = x;
  out[1] = y;
  return out;
}

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}

/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to ceil
 * @returns {vec2} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}

/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to floor
 * @returns {vec2} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}

/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to round
 * @returns {vec2} out
 */
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return x * x + y * y;
}

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
  var x = a[0],
      y = a[1];
  return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
  var x = a[0],
      y = a[1];
  return x * x + y * y;
}

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
function normalize(out, a) {
  var x = a[0],
      y = a[1];
  var len = x * x + y * y;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
  }
  return out;
}

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */
function lerp(out, a, b, t) {
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
function random(out, scale) {
  scale = scale || 1.0;
  var r = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2d(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}

/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {vec2} a The vec2 point to rotate
 * @param {vec2} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec2} out
 */
function rotate(out, a, b, c) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
      p1 = a[1] - b[1],
      sinC = Math.sin(c),
      cosC = Math.cos(c);

  //perform rotation and translate to correct position
  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];

  return out;
}

/**
 * Get the angle between two 2D vectors
 * @param {vec2} a The first operand
 * @param {vec2} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
  var x1 = a[0],
      y1 = a[1],
      x2 = b[0],
      y2 = b[1];

  var len1 = x1 * x1 + y1 * y1;
  if (len1 > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len1 = 1 / Math.sqrt(len1);
  }

  var len2 = x2 * x2 + y2 * y2;
  if (len2 > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len2 = 1 / Math.sqrt(len2);
  }

  var cosine = (x1 * x2 + y1 * y2) * len1 * len2;

  if (cosine > 1.0) {
    return 0;
  } else if (cosine < -1.0) {
    return Math.PI;
  } else {
    return Math.acos(cosine);
  }
}

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function str(a) {
  return 'vec2(' + a[0] + ', ' + a[1] + ')';
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1];
  var b0 = b[0],
      b1 = b[1];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}

/**
 * Alias for {@link vec2.length}
 * @function
 */
var len = length;

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
var sub = subtract;

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link vec2.divide}
 * @function
 */
var div = divide;

/**
 * Alias for {@link vec2.distance}
 * @function
 */
var dist = distance;

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
var sqrDist = squaredDistance;

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
var sqrLen = squaredLength;

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
var forEach = function () {
  var vec = create();

  return function (a, stride, offset, count, fn, arg) {
    var i = void 0,
        l = void 0;
    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];a[i + 1] = vec[1];
    }

    return a;
  };
}();

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/vec3.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/vec3.js ***!
  \******************************************************/
/*! exports provided: create, clone, length, fromValues, copy, set, add, subtract, multiply, divide, ceil, floor, min, max, round, scale, scaleAndAdd, distance, squaredDistance, squaredLength, negate, inverse, normalize, dot, cross, lerp, hermite, bezier, random, transformMat4, transformMat3, transformQuat, rotateX, rotateY, rotateZ, angle, str, exactEquals, equals, sub, mul, div, dist, sqrDist, len, sqrLen, forEach */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "length", function() { return length; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "divide", function() { return divide; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ceil", function() { return ceil; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "floor", function() { return floor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "min", function() { return min; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "max", function() { return max; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "round", function() { return round; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scaleAndAdd", function() { return scaleAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "distance", function() { return distance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredDistance", function() { return squaredDistance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredLength", function() { return squaredLength; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "negate", function() { return negate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inverse", function() { return inverse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dot", function() { return dot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cross", function() { return cross; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lerp", function() { return lerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hermite", function() { return hermite; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bezier", function() { return bezier; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "random", function() { return random; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat4", function() { return transformMat4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat3", function() { return transformMat3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformQuat", function() { return transformQuat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateX", function() { return rotateX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateY", function() { return rotateY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateZ", function() { return rotateZ; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "angle", function() { return angle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "div", function() { return div; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dist", function() { return dist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrDist", function() { return sqrDist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "len", function() { return len; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrLen", function() { return sqrLen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return forEach; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](3);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function fromValues(x, y, z) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
}

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out;
}

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];

  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);

  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

  return out;
}

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;

  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

  return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
function random(out, scale) {
  scale = scale || 1.0;

  var r = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2.0 * Math.PI;
  var z = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2.0 - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;

  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}

/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
  // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];
  var x = a[0],
      y = a[1],
      z = a[2];
  // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);
  var uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x;
  // var uuv = vec3.cross([], qvec, uv);
  var uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx;
  // vec3.scale(uv, uv, 2 * w);
  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  // vec3.scale(uuv, uuv, 2);
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  // return vec3.add(out, a, vec3.add(out, uv, uuv));
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateX(out, a, b, c) {
  var p = [],
      r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[0];
  r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
  r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateY(out, a, b, c) {
  var p = [],
      r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateZ(out, a, b, c) {
  var p = [],
      r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
  r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
  r[2] = p[2];

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
  var tempA = fromValues(a[0], a[1], a[2]);
  var tempB = fromValues(b[0], b[1], b[2]);

  normalize(tempA, tempA);
  normalize(tempB, tempB);

  var cosine = dot(tempA, tempB);

  if (cosine > 1.0) {
    return 0;
  } else if (cosine < -1.0) {
    return Math.PI;
  } else {
    return Math.acos(cosine);
  }
}

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function str(a) {
  return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
}

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2));
}

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
var sub = subtract;

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link vec3.divide}
 * @function
 */
var div = divide;

/**
 * Alias for {@link vec3.distance}
 * @function
 */
var dist = distance;

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
var sqrDist = squaredDistance;

/**
 * Alias for {@link vec3.length}
 * @function
 */
var len = length;

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
var sqrLen = squaredLength;

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
var forEach = function () {
  var vec = create();

  return function (a, stride, offset, count, fn, arg) {
    var i = void 0,
        l = void 0;
    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];
    }

    return a;
  };
}();

/***/ }),

/***/ "./node_modules/gl-matrix/lib/gl-matrix/vec4.js":
/*!******************************************************!*\
  !*** ./node_modules/gl-matrix/lib/gl-matrix/vec4.js ***!
  \******************************************************/
/*! exports provided: create, clone, fromValues, copy, set, add, subtract, multiply, divide, ceil, floor, min, max, round, scale, scaleAndAdd, distance, squaredDistance, length, squaredLength, negate, inverse, normalize, dot, lerp, random, transformMat4, transformQuat, str, exactEquals, equals, sub, mul, div, dist, sqrDist, len, sqrLen, forEach */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return fromValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subtract", function() { return subtract; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multiply", function() { return multiply; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "divide", function() { return divide; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ceil", function() { return ceil; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "floor", function() { return floor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "min", function() { return min; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "max", function() { return max; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "round", function() { return round; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return scale; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scaleAndAdd", function() { return scaleAndAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "distance", function() { return distance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredDistance", function() { return squaredDistance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "length", function() { return length; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "squaredLength", function() { return squaredLength; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "negate", function() { return negate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inverse", function() { return inverse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dot", function() { return dot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lerp", function() { return lerp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "random", function() { return random; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformMat4", function() { return transformMat4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformQuat", function() { return transformQuat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "str", function() { return str; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exactEquals", function() { return exactEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "div", function() { return div; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dist", function() { return dist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrDist", function() { return sqrDist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "len", function() { return len; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrLen", function() { return sqrLen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return forEach; });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./node_modules/gl-matrix/lib/gl-matrix/common.js");


/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  if (_common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"] != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
function fromValues(x, y, z, w) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__["ARRAY_TYPE"](4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}

/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to ceil
 * @returns {vec4} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}

/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to floor
 * @returns {vec4} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}

/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to round
 * @returns {vec4} out
 */
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
  }
  return out;
}

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
function random(out, scale) {
  scale = scale || 1.0;

  // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;
  var v1, v2, v3, v4;
  var s1, s2;
  do {
    v1 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2 - 1;
    v2 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2 - 1;
    s1 = v1 * v1 + v2 * v2;
  } while (s1 >= 1);
  do {
    v3 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2 - 1;
    v4 = _common_js__WEBPACK_IMPORTED_MODULE_0__["RANDOM"]() * 2 - 1;
    s2 = v3 * v3 + v4 * v4;
  } while (s2 >= 1);

  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
function transformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
function transformQuat(out, a, q) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];

  // calculate quat * vec
  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;

  // calculate result * inverse quat
  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
function str(a) {
  return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
}

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__["EPSILON"] * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
var sub = subtract;

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
var mul = multiply;

/**
 * Alias for {@link vec4.divide}
 * @function
 */
var div = divide;

/**
 * Alias for {@link vec4.distance}
 * @function
 */
var dist = distance;

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
var sqrDist = squaredDistance;

/**
 * Alias for {@link vec4.length}
 * @function
 */
var len = length;

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
var sqrLen = squaredLength;

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
var forEach = function () {
  var vec = create();

  return function (a, stride, offset, count, fn, arg) {
    var i = void 0,
        l = void 0;
    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];a[i + 3] = vec[3];
    }

    return a;
  };
}();

/***/ }),

/***/ "./source/Actor.js":
/*!*************************!*\
  !*** ./source/Actor.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Actor; });
/* harmony import */ var _Dispatcher_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dispatcher.js */ "./source/Dispatcher.js");


class Actor extends _Dispatcher_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._Artboards = [];
		this._NestedActorAssets = [];
		this._Atlases = [];
	}

	getArtboard(name) {
		return this._Artboards.find(artboard => artboard._Name === name);
	}

	dispose(graphics) {
		for (const artboard of this._Artboards) {
			artboard.dispose(graphics);
		}
	}

	initialize(graphics) {
		for (let nested of this._NestedActorAssets) {
			if (nested.actor) {
				nested.actor.initialize(graphics);
			}
		}
		for (const artboard of this._Artboards) {
			artboard.initialize(graphics);
		}
	}

	makeInstance() {
		return this._Artboards.length && this._Artboards[0].makeInstance() || null;
	}

	get animations() {
		return this._Artboards.length && this._Artboards[0]._Animations || null;
	}
}

/***/ }),

/***/ "./source/ActorArtboard.js":
/*!*********************************!*\
  !*** ./source/ActorArtboard.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorArtboard; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var _ActorShape_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActorShape.js */ "./source/ActorShape.js");
/* harmony import */ var _ActorImage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActorImage.js */ "./source/ActorImage.js");
/* harmony import */ var _NestedActorNode_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./NestedActorNode.js */ "./source/NestedActorNode.js");
/* harmony import */ var _AnimationInstance_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./AnimationInstance.js */ "./source/AnimationInstance.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");







class ActorArtboard {
	constructor(actor) {
		this._Actor = actor;
		this._Components = [];
		this._Nodes = [];
		this._RootNode = new _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
		this._RootNode._Name = "Root";
		this._Components.push(this._RootNode);
		this._Drawables = [];
		this._Animations = [];
		this._IsImageSortDirty = false;
		this._Order = null;
		this._IsDirty = false;
		this._DirtDepth = 0;

		this._Name = "Artboard";
		this._Origin = gl_matrix__WEBPACK_IMPORTED_MODULE_5__["vec2"].create();
		this._Translation = gl_matrix__WEBPACK_IMPORTED_MODULE_5__["vec2"].create();
		this._Color = gl_matrix__WEBPACK_IMPORTED_MODULE_5__["vec4"].create();
		this._ClipsContents = true;
		this._Width = 0;
		this._Height = 0;
	}

	get name() {
		return this._Name;
	}

	get width() {
		return this._Width;
	}

	get height() {
		return this._Height;
	}

	get origin() {
		return this._Name;
	}

	get translation() {
		return this._Translation;
	}

	get color() {
		return this._Color;
	}

	get clipsContents() {
		return this._ClipsContents;
	}

	get root() {
		return this._RootNode;
	}

	get actor() {
		return this._Actor;
	}

	addDependency(a, b) {
		// "a" depends on "b"
		let dependents = b._Dependents;
		if (!dependents) {
			dependents = b._Dependents = [];
		}
		if (dependents.indexOf(a) !== -1) {
			return false;
		}
		dependents.push(a);
		return true;
	}

	sortDependencies() {
		let perm = new Set();
		let temp = new Set();

		let order = [];

		function visit(n) {
			if (perm.has(n)) {
				return true;
			}
			if (temp.has(n)) {
				console.warn("Dependency cycle!", n);
				return false;
			}

			temp.add(n);

			let dependents = n._Dependents;
			if (dependents) {
				for (let d of dependents) {
					if (!visit(d)) {
						return false;
					}
				}
			}
			perm.add(n);
			order.unshift(n);

			return true;
		}

		if (!visit(this._RootNode)) {
			// We have cyclic dependencies.
			return false;
		}

		for (let i = 0; i < order.length; i++) {
			let component = order[i];
			component._GraphOrder = i;
			component._DirtMask = 255;
		}
		this._Order = order;
		this._IsDirty = true;
	}

	addDirt(component, value, recurse) {
		if ((component._DirtMask & value) === value) {
			// Already marked.
			return false;
		}

		// Make sure dirt is set before calling anything that can set more dirt.
		let dirt = component._DirtMask | value;
		component._DirtMask = dirt;

		this._IsDirty = true;

		component.onDirty(dirt);

		// If the order of this component is less than the current dirt depth, update the dirt depth
		// so that the update loop can break out early and re-run (something up the tree is dirty).
		if (component._GraphOrder < this._DirtDepth) {
			this._DirtDepth = component._GraphOrder;
		}
		if (!recurse) {
			return true;
		}
		let dependents = component._Dependents;
		if (dependents) {
			for (let d of dependents) {
				this.addDirt(d, value, recurse);
			}
		}

		return true;
	}

	update() {
		if (!this._IsDirty) {
			return false;
		}

		let order = this._Order;
		let end = order.length;

		const maxSteps = 100;
		let step = 0;
		while (this._IsDirty && step < maxSteps) {
			this._IsDirty = false;
			// Track dirt depth here so that if something else marks dirty, we restart.
			for (let i = 0; i < end; i++) {
				let component = order[i];
				this._DirtDepth = i;
				let d = component._DirtMask;
				if (d === 0) {
					continue;
				}
				component._DirtMask = 0;
				component.update(d);

				if (this._DirtDepth < i) {
					break;
				}
			}
			step++;
		}

		return true;
	}

	resolveHierarchy() {
		let components = this._Components;
		for (let component of components) {
			if (component != null) {
				component._Actor = this;
				component.resolveComponentIndices(components);
				if (component.isNode) {
					this._Nodes.push(component);
				}
				switch (component.constructor) {
					case _NestedActorNode_js__WEBPACK_IMPORTED_MODULE_3__["default"]:
					case _ActorImage_js__WEBPACK_IMPORTED_MODULE_2__["default"]:
						this._Drawables.push(component);
						break;
				}
			}
		}

		for (let component of components) {
			if (component != null) {
				component.completeResolve();
			}
		}

		this.sortDependencies();

		this._Drawables.sort(function (a, b) {
			return a._DrawOrder - b._DrawOrder;
		});
	}

	dispose(graphics) {
		let drawables = this._Drawables;
		for (let drawable of drawables) {
			drawable.dispose(this, graphics);
		}
	}

	advance(seconds) {
		this.update();

		let components = this._Components;
		// Advance last (update graphics buffers and such).
		for (let component of components) {
			if (component) {
				component.advance(seconds);
			}
		}

		if (this._IsImageSortDirty) {
			this._Drawables.sort(function (a, b) {
				return a._DrawOrder - b._DrawOrder;
			});
			this._IsImageSortDirty = false;
		}
	}

	draw(graphics) {
		let drawables = this._Drawables;
		for (let drawable of drawables) {
			drawable.draw(graphics);
		}
		// let nodes = this._Nodes;
		// for(let node of nodes)
		// {
		// 	if(node._Name === "ctrl_look")
		// 	{
		// 		const ctx = graphics.ctx;
		// 		ctx.save();
		// 		ctx.beginPath();
		// 		ctx.arc(node.worldTransform[4], node.worldTransform[5], 20.0, 0, 2*Math.PI);
		// 		ctx.stroke();
		// 		ctx.restore();
		// 	}
		// }
	}

	getNode(name) {
		let nodes = this._Nodes;
		for (let node of nodes) {
			if (node._Name === name) {
				return node;
			}
		}
		return null;
	}

	get animations() {
		return this._Animations;
	}

	getAnimation(name) {
		let animations = this._Animations;
		for (let animation of animations) {
			if (animation._Name === name) {
				return animation;
			}
		}
		return null;
	}

	getAnimationInstance(name) {
		let animation = this.getAnimation(name);
		if (!animation) {
			return null;
		}
		return new _AnimationInstance_js__WEBPACK_IMPORTED_MODULE_4__["default"](this, animation);
	}

	makeInstance() {
		const actorInstance = new ActorArtboard(this._Actor);
		actorInstance.copy(this);
		return actorInstance;
	}

	artboardAABB() {
		const { _Width: width, _Height: height } = this;
		const min_x = -this._Origin[0] * width;
		const min_y = -this._Origin[1] * height;
		return new Float32Array([min_x, min_y, min_x + width, min_y + height]);
	}

	computeAABB() {
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		for (const drawable of this._Drawables) {
			if (drawable.opacity < 0.01) {
				continue;
			}
			const aabb = drawable.computeAABB();
			if (!aabb) {
				continue;
			}
			if (aabb[0] < min_x) {
				min_x = aabb[0];
			}
			if (aabb[1] < min_y) {
				min_y = aabb[1];
			}
			if (aabb[2] > max_x) {
				max_x = aabb[2];
			}
			if (aabb[3] > max_y) {
				max_y = aabb[3];
			}
		}

		return new Float32Array([min_x, min_y, max_x, max_y]);
	}

	copy(artboard) {
		this._Name = artboard._Name;
		this._Origin = gl_matrix__WEBPACK_IMPORTED_MODULE_5__["vec2"].clone(artboard._Origin);
		this._Translation = gl_matrix__WEBPACK_IMPORTED_MODULE_5__["vec2"].clone(artboard._Translation);
		this._Color = gl_matrix__WEBPACK_IMPORTED_MODULE_5__["vec4"].clone(artboard._Color);
		this._ClipsContents = artboard._ClipContents;
		this._Width = artboard._Width;
		this._Height = artboard._Height;

		let components = artboard._Components;
		this._Animations = artboard._Animations;
		this._Components.length = 0;
		this._Nodes.length = 0;
		this._Drawables.length = 0;

		for (let component of components) {
			if (!component) {
				this._Components.push(null);
				continue;
			}
			let instanceNode = component.makeInstance(this);
			switch (instanceNode.constructor) {
				case _ActorShape_js__WEBPACK_IMPORTED_MODULE_1__["default"]:
				case _NestedActorNode_js__WEBPACK_IMPORTED_MODULE_3__["default"]:
				case _ActorImage_js__WEBPACK_IMPORTED_MODULE_2__["default"]:
					this._Drawables.push(instanceNode);
					break;
			}
			if (instanceNode.isNode) {
				this._Nodes.push(instanceNode);
			}
			this._Components.push(instanceNode);
		}
		this._RootNode = this._Components[0];

		for (let i = 1; i < this._Components.length; i++) {
			let component = this._Components[i];
			if (component == null) {
				continue;
			}
			component.resolveComponentIndices(this._Components);
		}

		for (let i = 1; i < this._Components.length; i++) {
			let component = this._Components[i];
			if (component == null) {
				continue;
			}
			component.completeResolve();
		}

		this.sortDependencies();

		this._Drawables.sort(function (a, b) {
			return a._DrawOrder - b._DrawOrder;
		});
	}

	initialize(graphics) {
		let drawables = this._Drawables;
		for (let drawable of drawables) {
			drawable.initialize(this, graphics);
		}
	}
}

/***/ }),

/***/ "./source/ActorAxisConstraint.js":
/*!***************************************!*\
  !*** ./source/ActorAxisConstraint.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorAxisConstraint; });
/* harmony import */ var _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorTargetedConstraint.js */ "./source/ActorTargetedConstraint.js");
/* harmony import */ var _TransformSpace_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TransformSpace.js */ "./source/TransformSpace.js");



class ActorAxisConstraint extends _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);

		this._CopyX = false;
		this._CopyY = false;
		this._ScaleX = 1;
		this._ScaleY = 1;
		this._EnableMinX = false;
		this._MinX = 0;
		this._EnableMaxX = false;
		this._MaxX = 0;
		this._EnableMinY = false;
		this._MinY = 0;
		this._EnableMaxY = false;
		this._MaxY = 0;
		this._Offset = false;
		this._SourceSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_1__["default"].World;
		this._DestSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_1__["default"].World;
		this._MinMaxSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_1__["default"].World;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._CopyX = node._CopyX;
		this._CopyY = node._CopyY;
		this._ScaleX = node._ScaleX;
		this._ScaleY = node._ScaleY;
		this._EnableMinX = node._EnableMinX;
		this._MinX = node._MinX;
		this._EnableMaxX = node._EnableMaxX;
		this._MaxX = node._MaxX;
		this._EnableMinY = node._EnableMinY;
		this._MinY = node._MinY;
		this._EnableMaxY = node._EnableMaxY;
		this._MaxY = node._MaxY;
		this._Offset = node._Offset;
		this._SourceSpace = node._SourceSpace;
		this._DestSpace = node._DestSpace;
		this._MinMaxSpace = node._MinMaxSpace;
	}

	onDirty(dirt) {
		this.markDirty();
	}
}

/***/ }),

/***/ "./source/ActorBone.js":
/*!*****************************!*\
  !*** ./source/ActorBone.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorBone; });
/* harmony import */ var _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorBoneBase.js */ "./source/ActorBoneBase.js");


class ActorBone extends _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._FirstBone = null;
	}

	makeInstance(resetActor) {
		const node = new ActorBone();
		node.copy(this, resetActor);
		return node;
	}

	completeResolve() {
		super.completeResolve();

		let children = this._Children;
		for (let child of children) {
			if (child instanceof ActorBone) {
				this._FirstBone = child;
				return;
			}
		}
	}
}

/***/ }),

/***/ "./source/ActorBoneBase.js":
/*!*********************************!*\
  !*** ./source/ActorBoneBase.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorBoneBase; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class ActorBoneBase extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._Length = 0;
	}

	get tipWorldTranslation() {
		const transform = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();
		transform[4] = this._Length;
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transform, this._WorldTransform, transform);
		return gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), transform[4], transform[5]);
	}

	get length() {
		return this._Length;
	}

	set length(l) {
		if (this._Length === l) {
			return;
		}
		this._Length = l;
		this.markTransformDirty();
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Length = node._Length;
	}

	get firstBone() {
		let children = this._Children;
		for (let child of children) {
			if (child instanceof ActorBoneBase) {
				return child;
			}
		}

		return null;
	}
}

/***/ }),

/***/ "./source/ActorCollider.js":
/*!*********************************!*\
  !*** ./source/ActorCollider.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorCollider; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");


class ActorCollider extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._IsCollisionEnabled = true;
	}

	get isCollisionEnabled() {
		return this._IsCollisionEnabled;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._IsCollisionEnabled = node._IsCollisionEnabled;
	}
}

/***/ }),

/***/ "./source/ActorColliderCircle.js":
/*!***************************************!*\
  !*** ./source/ActorColliderCircle.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorColliderCircle; });
/* harmony import */ var _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorCollider.js */ "./source/ActorCollider.js");


class ActorColliderCircle extends _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._Radius = 0.0;
	}

	get radius() {
		return this._Radius;
	}

	makeInstance(resetActor) {
		let node = new ActorColliderCircle();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Radius = node._Radius;
	}
}

/***/ }),

/***/ "./source/ActorColliderLine.js":
/*!*************************************!*\
  !*** ./source/ActorColliderLine.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorColliderLine; });
/* harmony import */ var _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorCollider.js */ "./source/ActorCollider.js");


class ActorColliderLine extends _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._Vertices = new Float32Array();
	}

	get vertices() {
		return this._Vertices;
	}

	makeInstance(resetActor) {
		let node = new ActorColliderLine();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Vertices = node._Vertices;
	}
}

/***/ }),

/***/ "./source/ActorColliderPolygon.js":
/*!****************************************!*\
  !*** ./source/ActorColliderPolygon.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorColliderPolygon; });
/* harmony import */ var _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorCollider.js */ "./source/ActorCollider.js");


class ActorColliderPolygon extends _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._ContourVertices = new Float32Array();
	}

	get contourVertices() {
		return this._ContourVertices;
	}

	makeInstance(resetActor) {
		let node = new ActorColliderPolygon();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._ContourVertices = node._ContourVertices;
	}
}

/***/ }),

/***/ "./source/ActorColliderRectangle.js":
/*!******************************************!*\
  !*** ./source/ActorColliderRectangle.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorColliderRectangle; });
/* harmony import */ var _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorCollider.js */ "./source/ActorCollider.js");


class ActorColliderRectangle extends _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._Width = 0.0;
		this._Height = 0.0;
	}

	get width() {
		return this._Width;
	}

	get height() {
		return this._Height;
	}

	makeInstance(resetActor) {
		let node = new ActorColliderRectangle();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Width = node._Width;
		this._Height = node._Height;
	}
}

/***/ }),

/***/ "./source/ActorColliderTriangle.js":
/*!*****************************************!*\
  !*** ./source/ActorColliderTriangle.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorColliderTriangle; });
/* harmony import */ var _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorCollider.js */ "./source/ActorCollider.js");


class ActorColliderTriangle extends _ActorCollider_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._Width = 0.0;
		this._Height = 0.0;
	}

	get width() {
		return this._Width;
	}

	get height() {
		return this._Height;
	}

	makeInstance(resetActor) {
		let node = new ActorColliderTriangle();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Width = node._Width;
		this._Height = node._Height;
	}
}

/***/ }),

/***/ "./source/ActorComponent.js":
/*!**********************************!*\
  !*** ./source/ActorComponent.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorComponent; });
class ActorComponent {
	constructor() {
		this._Name = "Component";
		this._Parent = null;
		this._CustomProperties = [];
		this._DirtMask = 0;
		this._GraphOrder = -1;
		this._Dependents = null;
		this._Actor = null;
		this._ParentIdx = -1;
	}

	get parent() {
		return this._Parent;
	}

	onDirty(dirt) {}

	initialize(actor, graphics) {}

	update(dirt) {}

	advance(seconds) {}

	resolveComponentIndices(components) {
		if (this._ParentIdx !== -1) {
			let parent = components[this._ParentIdx];
			this._Parent = parent;
			if (this.isNode && parent && parent._Children) {
				parent._Children.push(this);
			}
			if (parent) {
				this._Actor.addDependency(this, parent);
			}
		}
	}

	completeResolve() {}

	copy(component, resetActor) {
		this._Name = component._Name;
		this._ParentIdx = component._ParentIdx;
		this._Idx = component._Idx;
		this._Actor = resetActor;
	}

	getCustomProperty(name) {
		let props = this._CustomProperties;
		for (let prop of props) {
			if (prop._Name === name) {
				return prop;
			}
		}
		return null;
	}
}

/***/ }),

/***/ "./source/ActorConstraint.js":
/*!***********************************!*\
  !*** ./source/ActorConstraint.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorConstraint; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");


class ActorConstraint extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._IsEnabled = true;
		this._Strength = 1.0;
	}

	makeInstance(resetActor) {
		const node = new ActorConstraint();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._IsEnabled = node._IsEnabled;
		this._Strength = node._Strength;
	}

	onDirty(dirt) {
		this.markDirty();
	}

	markDirty() {
		this.parent.markTransformDirty();
	}

	set strength(c) {
		if (this._Strength != c) {
			this._Strength = c;
			this.markDirty();
		}
	}

	get isEnabled() {
		return this._IsEnabled;
	}

	set isEnabled(isIt) {
		if (this._IsEnabled === isIt) {
			return;
		}

		this._IsEnabled = isIt;
		this.markDirty();
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			// This works because nodes are exported in hierarchy order, so we are assured constraints get added in order as we resolve indices.
			this._Parent.addConstraint(this);
		}
	}
}

/***/ }),

/***/ "./source/ActorDistanceConstraint.js":
/*!*******************************************!*\
  !*** ./source/ActorDistanceConstraint.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorDistanceConstraint; });
/* harmony import */ var _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorTargetedConstraint.js */ "./source/ActorTargetedConstraint.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



const DistanceMode = {
	Closer: 0,
	Further: 1,
	Exact: 2
};

class ActorDistanceConstraint extends _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);

		this._Distance = 100.0;
		this._Mode = DistanceMode.Closer;
	}

	makeInstance(resetActor) {
		let node = new ActorDistanceConstraint();
		node.copy(this, resetActor);
		return node;
	}

	get distance() {
		return this._Distance;
	}

	set distance(distance) {
		if (this._Distance === distance) {
			return;
		}

		this._Distance = distance;
		this.markDirty();
	}

	get mode() {
		return this._Mode;
	}

	set mode(mode) {
		if (this._Mode === mode) {
			return;
		}

		this._Mode = mode;
		this.markDirty();
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._Distance = node._Distance;
		this._Mode = node._Mode;
	}

	constrain(tip) {
		let target = this._Target;
		if (!target) {
			return;
		}

		let parent = this._Parent;

		let targetTranslation = target.worldTranslation;
		let ourTranslation = parent.worldTranslation;

		let { _Strength: t, _Mode: mode, _Distance: distance } = this;

		let toTarget = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), ourTranslation, targetTranslation);
		let currentDistance = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].length(toTarget);
		switch (mode) {
			case DistanceMode.Closer:
				if (currentDistance < distance) {
					return;
				}
				break;
			case DistanceMode.Further:
				if (currentDistance > distance) {
					return;
				}
				break;
		}
		if (currentDistance < 0.001) {
			return true;
		}

		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].scale(toTarget, toTarget, 1.0 / currentDistance);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].scale(toTarget, toTarget, distance);

		let world = parent.worldTransform;
		let position = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].lerp(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), ourTranslation, gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].add(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), targetTranslation, toTarget), t);
		world[4] = position[0];
		world[5] = position[1];
	}
}

/***/ }),

/***/ "./source/ActorEllipse.js":
/*!********************************!*\
  !*** ./source/ActorEllipse.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorEllipse; });
/* harmony import */ var _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorProceduralPath.js */ "./source/ActorProceduralPath.js");


class ActorEllipse extends _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(actor) {
        super(actor);
    }

    resolveComponentIndices(components) {
        _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.resolveComponentIndices.call(this, components);
    }

    makeInstance(resetActor) {
        const node = new ActorEllipse();
        node.copy(this, resetActor);
        return node;
    }

    getPath() {
        const path = new Path2D();
        const radiusX = this._Width / 2;
        const radiusY = this._Height / 2;
        path.moveTo(radiusX, 0.0);
        path.ellipse(0.0, 0.0, radiusX, radiusY, 0.0, 0, Math.PI * 2.0, false);
        return path;
    }
}

/***/ }),

/***/ "./source/ActorEvent.js":
/*!******************************!*\
  !*** ./source/ActorEvent.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorEvent; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");


class ActorEvent extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
	}

	makeInstance(resetActor) {
		const node = new ActorEvent();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
	}
}

/***/ }),

/***/ "./source/ActorIKConstraint.js":
/*!*************************************!*\
  !*** ./source/ActorIKConstraint.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorIKConstraint; });
/* harmony import */ var _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorTargetedConstraint.js */ "./source/ActorTargetedConstraint.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var _Decompose_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Decompose.js */ "./source/Decompose.js");






const PI2 = Math.PI * 2;

class ActorIKConstraint extends _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);

		this._InvertDirection = false;
		this._InfluencedBones = [];

		this._FKChain = null;
		this._BoneData = null;
	}

	makeInstance(resetActor) {
		let node = new ActorIKConstraint();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._InvertDirection = node._InvertDirection;
		this._InfluencedBones = [];
		if (node._InfluencedBones) {
			for (let i = 0; i < node._InfluencedBones.length; i++) {
				const ib = node._InfluencedBones[i];
				if (!ib) {
					continue;
				}
				if (ib.constructor === _ActorNode_js__WEBPACK_IMPORTED_MODULE_2__["default"]) {
					this._InfluencedBones.push(ib._Idx);
				} else {
					this._InfluencedBones.push(ib);
				}
			}
		}
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);

		const bones = this._InfluencedBones;
		if (!bones || !bones.length) {
			return;
		}

		for (let j = 0; j < bones.length; j++) {
			let componentIndex = bones[j];
			if (componentIndex.constructor !== Number) {
				componentIndex = componentIndex._Idx;
			}
			const bone = components[componentIndex];
			bones[j] = bone;

			// Mark peer constraints, N.B. that we're not adding it to the parent bone
			// as we're constraining it anyway.
			if (bone !== this.parent) {
				bone.addPeerConstraint(this);
			}
		}
	}

	markDirty() {
		for (const item of this._FKChain) {
			item.bone.markTransformDirty();
		}
	}

	completeResolve() {
		super.completeResolve();

		const bones = this._InfluencedBones;
		if (!bones || !bones.length) {
			return;
		}

		// Initialize solver.
		const start = bones[0];
		let end = bones[bones.length - 1];
		const chain = this._FKChain = [];
		const boneData = this._BoneData = [];
		while (end && end !== start._Parent) {
			chain.unshift({ bone: end, ikAngle: 0, transformComponents: new Float32Array(6), in: false });
			end = end._Parent;
		}

		const allIn = chain.length < 3;
		for (let i = 0; i < chain.length; i++) {
			let fk = chain[i];
			fk.idx = i;
			fk.in = allIn;
		}

		for (const bone of bones) {
			const fk = chain.find(fk => fk.bone === bone);
			if (!fk) {
				console.warn("Bone not in chain?", fk, bone);
				continue;
			}
			boneData.push(fk);
		}

		if (!allIn) {
			for (let i = 0; i < boneData.length - 1; i++) {
				const fk = boneData[i];
				fk.in = true;
				chain[fk.idx + 1].in = true;
			}
		}

		// Mark dependencies.
		const actor = this._Actor;
		for (const bone of bones) {
			// Don't mark dependency on parent as ActorComponent already does this.
			if (bone === this.parent) {
				continue;
			}

			actor.addDependency(this, bone);
		}
		if (this._Target) {
			actor.addDependency(this, this._Target);
		}

		// N.B. Dependency on target already set in ActorTargetedConstrain.

		// All the first level children of the influenced bones should depend on the final bone.
		if (chain.length) {
			const tip = chain[chain.length - 1];
			for (const fk of chain) {
				if (fk === tip) {
					continue;
				}
				const bone = fk.bone;
				const children = bone._Children;
				for (const child of children) {
					if (!(child instanceof _ActorNode_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
						continue;
					}
					const item = chain.find(item => item.bone === child);
					if (item) {
						// we are in the FK chain.
						continue;
					}
					actor.addDependency(child, tip.bone);
				}
			}
		}
	}

	constrain(tip) {
		const target = this._Target;
		if (target) {
			const wt = target.worldTransform;
			this.solve(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), wt[4], wt[5]), this._Strength);
		}
	}

	solve1(fk1, worldTargetTranslation) {
		const iworld = fk1.parentWorldInverse;
		const pA = fk1.bone.worldTranslation;
		const pBT = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), worldTargetTranslation);

		// To target in worldspace
		const toTarget = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pBT, pA);
		// Note this is directional, hence not transformMat2d
		const toTargetLocal = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), toTarget, iworld);
		const r = Math.atan2(toTargetLocal[1], toTargetLocal[0]);

		constrainRotation(fk1, r);
		fk1.ikAngle = r;

		return true;
	}

	solve2(fk1, fk2, worldTargetTranslation) {
		const invertDirection = this._InvertDirection;
		const b1 = fk1.bone;
		const b2 = fk2.bone;
		const chain = this._FKChain;
		const firstChild = chain[fk1.idx + 1];

		const iworld = fk1.parentWorldInverse;

		let pA = b1.worldTranslation;
		let pC = firstChild.bone.worldTranslation;
		let pB = b2.tipWorldTranslation;
		let pBT = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), worldTargetTranslation);

		pA = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(pA, pA, iworld);
		pC = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(pC, pC, iworld);
		pB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(pB, pB, iworld);
		pBT = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(pBT, pBT, iworld);

		// http://mathworld.wolfram.com/LawofCosines.html
		const av = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pB, pC);
		const a = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].length(av);

		const bv = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pC, pA);
		const b = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].length(bv);

		const cv = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pBT, pA);
		const c = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].length(cv);

		const A = Math.acos(Math.max(-1, Math.min(1, (-a * a + b * b + c * c) / (2 * b * c))));
		const C = Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b))));

		let r1, r2;
		if (b2.parent != b1) {
			const secondChild = chain[fk1.idx + 2];

			const iworld = secondChild.parentWorldInverse;

			pC = firstChild.bone.worldTranslation;
			pB = b2.tipWorldTranslation;

			const av = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pB, pC);
			const avLocal = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), av, iworld);
			const angleCorrection = -Math.atan2(avLocal[1], avLocal[0]);

			if (invertDirection) {
				r1 = Math.atan2(cv[1], cv[0]) - A;
				r2 = -C + Math.PI + angleCorrection;
			} else {
				r1 = A + Math.atan2(cv[1], cv[0]);
				r2 = C - Math.PI + angleCorrection;
			}
		} else if (invertDirection) {
			r1 = Math.atan2(cv[1], cv[0]) - A;
			r2 = -C + Math.PI;
		} else {
			r1 = A + Math.atan2(cv[1], cv[0]);
			r2 = C - Math.PI;
		}

		constrainRotation(fk1, r1);
		constrainRotation(firstChild, r2);
		if (firstChild !== fk2) {
			const bone = fk2.bone;
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(bone.worldTransform, bone.parent.worldTransform, bone.transform);
		}

		// Simple storage, need this for interpolation.
		fk1.ikAngle = r1;
		firstChild.ikAngle = r2;

		return true;
	}

	solve(worldTargetTranslation, strength) {
		const bones = this._BoneData;
		if (!bones.length) {
			return;
		}

		// Decompose the chain.
		const fkChain = this._FKChain;
		for (let i = 0; i < fkChain.length; i++) {
			const fk = fkChain[i];
			const parentWorld = fk.bone.parent.worldTransform;
			const parentWorldInverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), parentWorld);
			const local = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(fk.bone.transform, parentWorldInverse, fk.bone.worldTransform);
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Decompose"])(local, fk.transformComponents);
			fk.parentWorldInverse = parentWorldInverse;
		}

		if (bones.length === 1) {
			this.solve1(bones[0], worldTargetTranslation);
		} else if (bones.length == 2) {
			this.solve2(bones[0], bones[1], worldTargetTranslation);
		} else {
			const tip = bones[bones.length - 1];
			for (let i = 0; i < bones.length - 1; i++) {
				const fk = bones[i];
				this.solve2(fk, tip, worldTargetTranslation);
				for (let j = fk.idx + 1; j < fkChain.length - 1; j++) {
					const fk = fkChain[j];
					const parentWorld = fk.bone.parent.worldTransform;
					fk.parentWorldInverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), parentWorld);
				}
			}
		}

		// At the end, mix the FK angle with the IK angle by strength
		const m = strength;
		if (m != 1.0) {
			for (const fk of fkChain) {
				if (!fk.in) {
					const bone = fk.bone;
					gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(bone.worldTransform, bone.parent.worldTransform, bone.transform);
					continue;
				}
				const fromAngle = fk.transformComponents[4] % PI2;
				const toAngle = fk.ikAngle % PI2;
				let diff = toAngle - fromAngle;
				if (diff > Math.PI) {
					diff -= PI2;
				} else if (diff < -Math.PI) {
					diff += PI2;
				}
				const angle = fromAngle + diff * m;
				constrainRotation(fk, angle);
			}
		}
	}
}

function constrainRotation(fk, rotation) {
	const parentWorld = fk.bone.parent.worldTransform;

	const transform = fk.bone.transform;
	const c = fk.transformComponents;

	if (rotation === 0) {
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].identity(transform);
	} else {
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].fromRotation(transform, rotation);
	}
	// Translate
	transform[4] = c[0];
	transform[5] = c[1];
	// Scale
	const scaleX = c[2];
	const scaleY = c[3];
	transform[0] *= scaleX;
	transform[1] *= scaleX;
	transform[2] *= scaleY;
	transform[3] *= scaleY;
	// Skew
	const skew = c[5];
	if (skew !== 0) {
		transform[2] = transform[0] * skew + transform[2];
		transform[3] = transform[1] * skew + transform[3];
	}

	gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(fk.bone.worldTransform, parentWorld, transform);
}

/***/ }),

/***/ "./source/ActorIKTarget.js":
/*!*********************************!*\
  !*** ./source/ActorIKTarget.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorIKTarget; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var _ActorBone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActorBone.js */ "./source/ActorBone.js");
/* harmony import */ var _ActorIKConstraint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActorIKConstraint.js */ "./source/ActorIKConstraint.js");




class ActorIKTarget extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._Order = 0;
		this._Strength = 0;
		this._InvertDirection = false;
		this._InfluencedBones = null;
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);

		const constraint = new _ActorIKConstraint_js__WEBPACK_IMPORTED_MODULE_2__["default"]();
		this._Constraint = constraint;

		const bones = this._InfluencedBones;
		constraint._Actor = this._Actor;
		constraint._TargetIdx = this._Idx;
		constraint._ParentIdx = bones ? bones[bones.length - 1] : -1;
		constraint._InvertDirection = this._InvertDirection;
		constraint._InfluencedBones = bones;
		constraint._Strength = this._Strength;
		constraint._IsEnabled = true;
		constraint.resolveComponentIndices(components);
	}

	completeResolve() {
		super.completeResolve();

		this._Constraint.completeResolve();
	}

	get strength() {
		if (this._Constraint) {
			return this._Constraint.strength;
		}
		return 0;
	}

	set strength(s) {
		if (this._Constraint) {
			this._Constraint.strength = s;
		}
	}

	makeInstance(resetActor) {
		const node = new ActorIKTarget();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._Order = node._Order;
		this._Strength = node._Strength;
		this._InvertDirection = node._InvertDirection;
		this._InfluencedBones = [];
		if (node._InfluencedBones) {
			for (let i = 0; i < node._InfluencedBones.length; i++) {
				const ib = node._InfluencedBones[i];
				if (!ib) {
					continue;
				}
				if (ib.constructor === _ActorBone_js__WEBPACK_IMPORTED_MODULE_1__["default"]) {
					this._InfluencedBones.push(ib._Idx);
				} else {
					this._InfluencedBones.push(ib);
				}
			}
		}
	}
}

/***/ }),

/***/ "./source/ActorImage.js":
/*!******************************!*\
  !*** ./source/ActorImage.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorImage; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



const White = [1.0, 1.0, 1.0, 1.0];
class ActorImage extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._DrawOrder = 0;
		this._BlendMode = ActorImage.BlendModes.Normal;
		this._AtlasIndex = -1;
		this._NumVertices = 0;
		this._HasVertexDeformAnimation = false;
		this._AnimationDeformedVertices = null;
		this._Vertices = null;
		this._Triangles = null;
		this._ConnectedBones = null;
		this._BoneMatrices = null;
		this._IsInstance = false;
		this._IsHidden = false;

		this._VertexBuffer = null;
		this._IndexBuffer = null;
		this._DeformVertexBuffer = null;

		this._SequenceFrames = null;
		this._SequenceFrame = 0;
		this._SequenceUVs = null;
		this._SequenceUVBuffer = null;
	}

	get isHidden() {
		return this._IsHidden;
	}

	set isHidden(hidden) {
		this._IsHidden = hidden;
	}

	get hasVertexDeformAnimation() {
		return this._HasVertexDeformAnimation;
	}

	set hasVertexDeformAnimation(value) {
		this._HasVertexDeformAnimation = value;
		this._AnimationDeformedVertices = new Float32Array(this._NumVertices * 2);

		// Copy the deform verts from the rig verts.
		let writeIdx = 0;
		let readIdx = 0;
		const readStride = this._VertexStride;
		for (let i = 0; i < this._NumVertices; i++) {
			this._AnimationDeformedVertices[writeIdx++] = this._Vertices[readIdx];
			this._AnimationDeformedVertices[writeIdx++] = this._Vertices[readIdx + 1];
			readIdx += readStride;
		}
	}

	computeAABB() {
		const worldVertices = this.computeWorldVertices();
		const nv = worldVertices.length / 2;
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		let readIdx = 0;
		for (let i = 0; i < nv; i++) {
			let x = worldVertices[readIdx++];
			let y = worldVertices[readIdx++];
			if (x < min_x) {
				min_x = x;
			}
			if (y < min_y) {
				min_y = y;
			}
			if (x > max_x) {
				max_x = x;
			}
			if (y > max_y) {
				max_y = y;
			}
		}

		return new Float32Array([min_x, min_y, max_x, max_y]);
	}

	computeWorldVertices() {
		const vertices = this._HasVertexDeformAnimation ? this._AnimationDeformedVertices : this._Vertices;

		const stride = this._HasVertexDeformAnimation ? 2 : this._VertexStride;
		let readIdx = 0;
		let writeIdx = 0;

		const world = this._WorldTransform;

		const nv = this._NumVertices;
		const deformed = new Float32Array(nv * 2);

		if (this._ConnectedBones) {
			let weightIndex = 4;
			const weightStride = 12;
			const weightVertices = this._Vertices;

			const bones = this._BoneMatrices;

			for (let i = 0; i < nv; i++) {
				let x = vertices[readIdx];
				let y = vertices[readIdx + 1];

				readIdx += stride;

				const px = world[0] * x + world[2] * y + world[4];
				const py = world[1] * x + world[3] * y + world[5];

				const fm = new Float32Array(6);
				for (let wi = 0; wi < 4; wi++) {
					const boneIndex = weightVertices[weightIndex + wi];
					const weight = weightVertices[weightIndex + wi + 4];

					const bb = boneIndex * 6;

					for (let j = 0; j < 6; j++) {
						fm[j] += bones[bb + j] * weight;
					}
				}

				weightIndex += weightStride;

				x = fm[0] * px + fm[2] * py + fm[4];
				y = fm[1] * px + fm[3] * py + fm[5];

				deformed[writeIdx++] = x;
				deformed[writeIdx++] = y;
			}
		} else {
			for (let i = 0; i < nv; i++) {
				const x = vertices[readIdx];
				const y = vertices[readIdx + 1];

				deformed[writeIdx++] = world[0] * x + world[2] * y + world[4];
				deformed[writeIdx++] = world[1] * x + world[3] * y + world[5];
				readIdx += stride;
			}
		}

		return deformed;
	}

	dispose(actor, graphics) {
		if (this._IsInstance) {
			if (this._DeformVertexBuffer) {
				this._DeformVertexBuffer.dispose();
				this._DeformVertexBuffer = null;
			}
		} else {
			if (this._VertexBuffer) {
				this._VertexBuffer.dispose();
				this._VertexBuffer = null;
			}
			if (this._IndexBuffer) {
				this._IndexBuffer.dispose();
				this._IndexBuffer = null;
			}
			if (this._SequenceUVBuffer) {
				this._SequenceUVBuffer.dispose();
				this._SequenceUVBuffer = null;
			}
		}
	}

	initialize(actor, graphics) {
		if (!this._IsInstance) {
			if (this._VertexBuffer) {
				this._VertexBuffer.dispose();
			}
			if (this._VertexBuffer) {
				this._VertexBuffer.dispose();
			}
			if (this._SequenceUVBuffer) {
				this._SequenceUVBuffer.dispose();
			}

			this._VertexBuffer = graphics.makeVertexBuffer(this._Vertices);
			this._IndexBuffer = graphics.makeIndexBuffer(this._Triangles);

			if (this._SequenceUVs) {
				this._SequenceUVBuffer = graphics.makeVertexBuffer(this._SequenceUVs);
			}
		} else if (this._HasVertexDeformAnimation) {
			if (this._DeformVertexBuffer) {
				this._DeformVertexBuffer.dispose();
			}
			this._DeformVertexBuffer = graphics.makeVertexBuffer(this._AnimationDeformedVertices);
		}

		if (this._IsInstance && this._ConnectedBones) {
			const bt = this._BoneMatrices = new Float32Array((this._ConnectedBones.length + 1) * 6);

			// First bone transform is always identity.
			bt[0] = 1;
			bt[1] = 0;
			bt[2] = 0;
			bt[3] = 1;
			bt[4] = 0;
			bt[5] = 0;
		}
		// Keep vertices for world calculations.
		// delete this._Vertices;
		delete this._Triangles;
		delete this._SequenceUVs;
		this._Texture = actor._Atlases[this._AtlasIndex];
	}

	advance() {
		if (this._HasVertexDeformAnimation && this._VerticesDirty) {
			this._DeformVertexBuffer.update(this._AnimationDeformedVertices);
			this._VerticesDirty = false;
		}

		if (this._ConnectedBones) {
			const bt = this._BoneMatrices;
			let bidx = 6; // Start after first identity.

			const mat = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();

			for (let i = 0; i < this._ConnectedBones.length; i++) {
				const cb = this._ConnectedBones[i];
				if (!cb.node) {
					bt[bidx++] = 1;
					bt[bidx++] = 0;
					bt[bidx++] = 0;
					bt[bidx++] = 1;
					bt[bidx++] = 0;
					bt[bidx++] = 0;
					continue;
				}
				const wt = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(mat, cb.node._WorldTransform, cb.ibind);

				bt[bidx++] = wt[0];
				bt[bidx++] = wt[1];
				bt[bidx++] = wt[2];
				bt[bidx++] = wt[3];
				bt[bidx++] = wt[4];
				bt[bidx++] = wt[5];
			}
		}
	}

	draw(graphics) {
		if (this._RenderCollapsed || this._IsHidden) {
			return;
		}

		const t = this._WorldTransform;
		switch (this._BlendMode) {
			case ActorImage.BlendModes.Normal:
				graphics.enableBlending();
				break;
			case ActorImage.BlendModes.Multiply:
				graphics.enableMultiplyBlending();
				break;
			case ActorImage.BlendModes.Screen:
				graphics.enableScreenBlending();
				break;
			case ActorImage.BlendModes.Additive:
				graphics.enableAdditiveBlending();
				break;

		}

		const uvBuffer = this._SequenceUVBuffer || null;
		let uvOffset;
		if (this._SequenceUVBuffer) {
			const numFrames = this._SequenceFrames.length;
			let frame = this._SequenceFrame % numFrames;
			if (uvOffset < 0) {
				frame += numFrames;
			}
			uvOffset = this._SequenceFrames[frame].offset;
		}

		graphics.prep(this._Texture, White, this._RenderOpacity, t, this._VertexBuffer, this._ConnectedBones ? this._BoneMatrices : null, this._DeformVertexBuffer, uvBuffer, uvOffset);
		graphics.draw(this._IndexBuffer);
	}

	resolveComponentIndices(components) {
		_ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.resolveComponentIndices.call(this, components);

		if (this._ConnectedBones) {
			for (let j = 0; j < this._ConnectedBones.length; j++) {
				const cb = this._ConnectedBones[j];
				cb.node = components[cb.componentIndex];
				if (cb.node) {
					cb.node._IsConnectedToImage = true;
				}
			}
		}
	}

	makeInstance(resetActor) {
		const node = new ActorImage();
		node._IsInstance = true;
		ActorImage.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._DrawOrder = node._DrawOrder;
		this._BlendMode = node._BlendMode;
		this._AtlasIndex = node._AtlasIndex;
		this._NumVertices = node._NumVertices;
		this._VertexStride = node._VertexStride;
		this._HasVertexDeformAnimation = node._HasVertexDeformAnimation;
		this._Vertices = node._Vertices;
		this._Triangles = node._Triangles;
		// N.B. actor.initialize must've been called before instancing.
		this._VertexBuffer = node._VertexBuffer;
		this._IndexBuffer = node._IndexBuffer;
		this._SequenceUVBuffer = node._SequenceUVBuffer;
		this._SequenceFrames = node._SequenceFrames;
		if (node._HasVertexDeformAnimation) {
			const deformedVertexLength = this._NumVertices * 2;
			this._AnimationDeformedVertices = new Float32Array(deformedVertexLength);
			for (let i = 0; i < deformedVertexLength; i++) {
				this._AnimationDeformedVertices[i] = node._AnimationDeformedVertices[i];
			}
		}

		if (node._ConnectedBones) {
			this._ConnectedBones = [];
			for (const cb of node._ConnectedBones) {
				// Copy all props except for the actual node reference which will update in our resolve.
				this._ConnectedBones.push({
					componentIndex: cb.componentIndex,
					bind: cb.bind,
					ibind: cb.ibind
				});
			}
		}
	}
}

ActorImage.BlendModes = {
	"Normal": 0,
	"Multiply": 1,
	"Screen": 2,
	"Additive": 3
};

/***/ }),

/***/ "./source/ActorJellyBone.js":
/*!**********************************!*\
  !*** ./source/ActorJellyBone.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorJellyBone; });
/* harmony import */ var _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorBoneBase.js */ "./source/ActorBoneBase.js");


class ActorJellyBone extends _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	makeInstance(resetActor) {
		const node = new ActorJellyBone();
		node.copy(this, resetActor);
		return node;
	}
}

/***/ }),

/***/ "./source/ActorLoader.js":
/*!*******************************!*\
  !*** ./source/ActorLoader.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorLoader; });
/* harmony import */ var _Animation_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Animation.js */ "./source/Animation.js");
/* harmony import */ var _Readers_BinaryReader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Readers/BinaryReader.js */ "./source/Readers/BinaryReader.js");
/* harmony import */ var _Readers_JSONReader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Readers/JSONReader.js */ "./source/Readers/JSONReader.js");
/* harmony import */ var _Actor_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Actor.js */ "./source/Actor.js");
/* harmony import */ var _ActorEvent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ActorEvent.js */ "./source/ActorEvent.js");
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var _ActorNodeSolo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ActorNodeSolo.js */ "./source/ActorNodeSolo.js");
/* harmony import */ var _ActorBone_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ActorBone.js */ "./source/ActorBone.js");
/* harmony import */ var _ActorEllipse_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ActorEllipse.js */ "./source/ActorEllipse.js");
/* harmony import */ var _ActorPolygon_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ActorPolygon.js */ "./source/ActorPolygon.js");
/* harmony import */ var _ActorRectangle_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ActorRectangle.js */ "./source/ActorRectangle.js");
/* harmony import */ var _ActorStar_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ActorStar.js */ "./source/ActorStar.js");
/* harmony import */ var _ActorTriangle_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ActorTriangle.js */ "./source/ActorTriangle.js");
/* harmony import */ var _ActorJellyBone_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./ActorJellyBone.js */ "./source/ActorJellyBone.js");
/* harmony import */ var _JellyComponent_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./JellyComponent.js */ "./source/JellyComponent.js");
/* harmony import */ var _ActorRootBone_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./ActorRootBone.js */ "./source/ActorRootBone.js");
/* harmony import */ var _ActorImage_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./ActorImage.js */ "./source/ActorImage.js");
/* harmony import */ var _ActorIKTarget_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./ActorIKTarget.js */ "./source/ActorIKTarget.js");
/* harmony import */ var _ActorColliderRectangle_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./ActorColliderRectangle.js */ "./source/ActorColliderRectangle.js");
/* harmony import */ var _ActorColliderTriangle_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./ActorColliderTriangle.js */ "./source/ActorColliderTriangle.js");
/* harmony import */ var _ActorColliderCircle_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./ActorColliderCircle.js */ "./source/ActorColliderCircle.js");
/* harmony import */ var _ActorColliderPolygon_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./ActorColliderPolygon.js */ "./source/ActorColliderPolygon.js");
/* harmony import */ var _ActorColliderLine_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./ActorColliderLine.js */ "./source/ActorColliderLine.js");
/* harmony import */ var _NestedActorNode_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./NestedActorNode.js */ "./source/NestedActorNode.js");
/* harmony import */ var _CustomProperty_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./CustomProperty.js */ "./source/CustomProperty.js");
/* harmony import */ var _AnimatedComponent_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./AnimatedComponent.js */ "./source/AnimatedComponent.js");
/* harmony import */ var _AnimatedProperty_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./AnimatedProperty.js */ "./source/AnimatedProperty.js");
/* harmony import */ var _NestedActorAsset_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./NestedActorAsset.js */ "./source/NestedActorAsset.js");
/* harmony import */ var _ActorIKConstraint_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./ActorIKConstraint.js */ "./source/ActorIKConstraint.js");
/* harmony import */ var _ActorDistanceConstraint_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./ActorDistanceConstraint.js */ "./source/ActorDistanceConstraint.js");
/* harmony import */ var _ActorTransformConstraint_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./ActorTransformConstraint.js */ "./source/ActorTransformConstraint.js");
/* harmony import */ var _ActorTranslationConstraint_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./ActorTranslationConstraint.js */ "./source/ActorTranslationConstraint.js");
/* harmony import */ var _ActorScaleConstraint_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./ActorScaleConstraint.js */ "./source/ActorScaleConstraint.js");
/* harmony import */ var _ActorRotationConstraint_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./ActorRotationConstraint.js */ "./source/ActorRotationConstraint.js");
/* harmony import */ var _ActorShape_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./ActorShape.js */ "./source/ActorShape.js");
/* harmony import */ var _ActorPath_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./ActorPath.js */ "./source/ActorPath.js");
/* harmony import */ var _ActorSkin_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./ActorSkin.js */ "./source/ActorSkin.js");
/* harmony import */ var _ActorArtboard_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./ActorArtboard.js */ "./source/ActorArtboard.js");
/* harmony import */ var _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./ColorComponent.js */ "./source/ColorComponent.js");
/* harmony import */ var _PathPoint_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./PathPoint.js */ "./source/PathPoint.js");
/* harmony import */ var _KeyFrame_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./KeyFrame.js */ "./source/KeyFrame.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./Interpolation.js */ "./source/Interpolation.js");
/* harmony import */ var _Block_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./Block.js */ "./source/Block.js");












































const _BlockTypes = _Block_js__WEBPACK_IMPORTED_MODULE_43__["default"].Types;
const _AnimatedPropertyTypes = _AnimatedProperty_js__WEBPACK_IMPORTED_MODULE_26__["default"].Types;

const _Readers = {
	"bin": {
		stream: _Readers_BinaryReader_js__WEBPACK_IMPORTED_MODULE_1__["default"],
		container: Uint8Array,
		extension: ".nma"
	},
	"json": {
		stream: _Readers_JSONReader_js__WEBPACK_IMPORTED_MODULE_2__["default"],
		container: Object,
		extension: "nmj"
	}
};

let _ReadAtlasesBlock = null;

function _ReadNextBlock(reader, error, block) {
	if (reader.isEOF()) {
		return null;
	}
	let blockType = 0,
	    container = 0;
	const cType = reader.containerType; // 'bin' || 'json'
	const streamReader = _Readers[cType];
	try {
		// blockType = reader.readUint8();
		blockType = reader.readBlockType(block);
		if (blockType === undefined) {
			return null;
		}
		const length = reader.readUint32Length();

		container = new streamReader["container"](length);
		reader.readRaw(container, length);
	} catch (err) {
		console.log(err.constructor);
		if (error) {
			error(err);
		}
		return null;
	}
	return { type: blockType, reader: new streamReader.stream(container) };
}

function _ReadComponentsBlock(artboard, reader) {
	let componentCount = reader.readUint16Length();
	let actorComponents = artboard._Components;

	// Guaranteed from the exporter to be in index order.
	let block = null;
	while ((block = _ReadNextBlock(reader, function (err) {
		artboard.actor.error = err;
	}, _Block_js__WEBPACK_IMPORTED_MODULE_43__["default"])) !== null) {
		let component = null;
		switch (block.type) {
			case _BlockTypes.CustomIntProperty:
			case _BlockTypes.CustomStringProperty:
			case _BlockTypes.CustomFloatProperty:
			case _BlockTypes.CustomBooleanProperty:
				component = _ReadCustomProperty(block.reader, new _CustomProperty_js__WEBPACK_IMPORTED_MODULE_24__["default"](), block.type);
				break;
			case _BlockTypes.ColliderRectangle:
				component = _ReadRectangleCollider(block.reader, new _ActorColliderRectangle_js__WEBPACK_IMPORTED_MODULE_18__["default"]());
				break;
			case _BlockTypes.ColliderTriangle:
				component = _ReadTriangleCollider(block.reader, new _ActorColliderTriangle_js__WEBPACK_IMPORTED_MODULE_19__["default"]());
				break;
			case _BlockTypes.ColliderCircle:
				component = _ReadCircleCollider(block.reader, new _ActorColliderCircle_js__WEBPACK_IMPORTED_MODULE_20__["default"]());
				break;
			case _BlockTypes.ColliderPolygon:
				component = _ReadPolygonCollider(block.reader, new _ActorColliderPolygon_js__WEBPACK_IMPORTED_MODULE_21__["default"]());
				break;
			case _BlockTypes.ColliderLine:
				component = _ReadLineCollider(block.reader, new _ActorColliderLine_js__WEBPACK_IMPORTED_MODULE_22__["default"]());
				break;
			case _BlockTypes.ActorEvent:
				component = _ReadActorEvent(block.reader, new _ActorEvent_js__WEBPACK_IMPORTED_MODULE_4__["default"]());
				break;
			case _BlockTypes.ActorNode:
				component = _ReadActorNode(block.reader, new _ActorNode_js__WEBPACK_IMPORTED_MODULE_5__["default"]());
				break;
			case _BlockTypes.ActorBone:
				component = _ReadActorBone(block.reader, new _ActorBone_js__WEBPACK_IMPORTED_MODULE_7__["default"]());
				break;
			case _BlockTypes.ActorJellyBone:
				component = _ReadActorJellyBone(block.reader, new _ActorJellyBone_js__WEBPACK_IMPORTED_MODULE_13__["default"]());
				break;
			case _BlockTypes.JellyComponent:
				component = _ReadJellyComponent(block.reader, new _JellyComponent_js__WEBPACK_IMPORTED_MODULE_14__["default"]());
				break;
			case _BlockTypes.ActorRootBone:
				component = _ReadActorRootBone(block.reader, new _ActorRootBone_js__WEBPACK_IMPORTED_MODULE_15__["default"]());
				break;
			case _BlockTypes.ActorImage:
				component = _ReadActorImage(block.reader, new _ActorImage_js__WEBPACK_IMPORTED_MODULE_16__["default"]());
				break;
			case _BlockTypes.ActorImageSequence:
				component = _ReadActorImageSequence(block.reader, new _ActorImage_js__WEBPACK_IMPORTED_MODULE_16__["default"]());
				break;
			case _BlockTypes.ActorIKTarget:
				component = _ReadActorIKTarget(artboard.actor.dataVersion, block.reader, new _ActorIKTarget_js__WEBPACK_IMPORTED_MODULE_17__["default"]());
				break;
			case _BlockTypes.NestedActorNode:
				component = _ReadNestedActor(block.reader, new _NestedActorNode_js__WEBPACK_IMPORTED_MODULE_23__["default"](), artboard._NestedActorAssets);
				break;
			case _BlockTypes.ActorNodeSolo:
				component = _ReadActorNodeSolo(block.reader, new _ActorNodeSolo_js__WEBPACK_IMPORTED_MODULE_6__["default"]());
				break;
			case _BlockTypes.ActorIKConstraint:
				component = _ReadActorIKConstraint(block.reader, new _ActorIKConstraint_js__WEBPACK_IMPORTED_MODULE_28__["default"]());
				break;
			case _BlockTypes.ActorDistanceConstraint:
				component = _ReadActorDistanceConstraint(block.reader, new _ActorDistanceConstraint_js__WEBPACK_IMPORTED_MODULE_29__["default"]());
				break;
			case _BlockTypes.ActorTransformConstraint:
				component = _ReadActorTransformConstraint(block.reader, new _ActorTransformConstraint_js__WEBPACK_IMPORTED_MODULE_30__["default"]());
				break;
			case _BlockTypes.ActorTranslationConstraint:
				component = _ReadAxisConstraint(block.reader, new _ActorTranslationConstraint_js__WEBPACK_IMPORTED_MODULE_31__["default"]());
				break;
			case _BlockTypes.ActorScaleConstraint:
				component = _ReadAxisConstraint(block.reader, new _ActorScaleConstraint_js__WEBPACK_IMPORTED_MODULE_32__["default"]());
				break;
			case _BlockTypes.ActorRotationConstraint:
				component = _ReadRotationConstraint(block.reader, new _ActorRotationConstraint_js__WEBPACK_IMPORTED_MODULE_33__["default"]());
				break;
			case _BlockTypes.ActorShape:
				component = _ReadActorShape(block.reader, new _ActorShape_js__WEBPACK_IMPORTED_MODULE_34__["default"]());
				break;
			case _BlockTypes.ActorPath:
				component = _ReadActorPath(block.reader, new _ActorPath_js__WEBPACK_IMPORTED_MODULE_35__["default"]());
				break;
			case _BlockTypes.ColorFill:
				component = _ReadColorFill(block.reader, new _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__["ColorFill"]());
				break;
			case _BlockTypes.ColorStroke:
				component = _ReadColorStroke(block.reader, new _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__["ColorStroke"]());
				break;
			case _BlockTypes.GradientFill:
				component = _ReadGradientFill(block.reader, new _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__["GradientFill"]());
				break;
			case _BlockTypes.GradientStroke:
				component = _ReadGradientStroke(block.reader, new _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__["GradientStroke"]());
				break;
			case _BlockTypes.RadialGradientFill:
				component = _ReadRadialGradientFill(block.reader, new _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__["RadialGradientFill"]());
				break;
			case _BlockTypes.RadialGradientStroke:
				component = _ReadRadialGradientStroke(block.reader, new _ColorComponent_js__WEBPACK_IMPORTED_MODULE_38__["RadialGradientStroke"]());
				break;
			case _BlockTypes.ActorEllipse:
				component = _ReadActorEllipse(block.reader, new _ActorEllipse_js__WEBPACK_IMPORTED_MODULE_8__["default"]());
				break;
			case _BlockTypes.ActorRectangle:
				component = _ReadActorRectangle(block.reader, new _ActorRectangle_js__WEBPACK_IMPORTED_MODULE_10__["default"]());
				break;
			case _BlockTypes.ActorTriangle:
				component = _ReadActorTriangle(block.reader, new _ActorTriangle_js__WEBPACK_IMPORTED_MODULE_12__["default"]());
				break;
			case _BlockTypes.ActorStar:
				component = _ReadActorStar(block.reader, new _ActorStar_js__WEBPACK_IMPORTED_MODULE_11__["default"]());
				break;
			case _BlockTypes.ActorPolygon:
				component = _ReadActorPolygon(block.reader, new _ActorPolygon_js__WEBPACK_IMPORTED_MODULE_9__["default"]());
				break;
			case _BlockTypes.ActorSkin:
				component = _ReadActorComponent(block.reader, new _ActorSkin_js__WEBPACK_IMPORTED_MODULE_36__["default"]());
				break;
		}
		if (component) {
			component._Idx = actorComponents.length;
		}
		actorComponents.push(component);
	}
	artboard.resolveHierarchy();
}

function _ReadAnimationBlock(artboard, reader) {
	const animation = new _Animation_js__WEBPACK_IMPORTED_MODULE_0__["default"](artboard);
	artboard._Animations.push(animation);

	animation._Name = reader.readString("name");
	animation._FPS = reader.readUint8("fps");
	animation._Duration = reader.readFloat32("duration");
	animation._Loop = reader.readBool("isLooping");

	reader.openArray("keyed");
	// Read the number of keyed nodes.
	const numKeyedComponents = reader.readUint16Length();
	if (numKeyedComponents > 0) {
		for (let i = 0; i < numKeyedComponents; i++) {
			reader.openObject("component");
			const componentIndex = reader.readId("component");
			let component = artboard._Components[componentIndex];
			if (!component) {
				// Bad component was loaded, read past the animation data.
				// Note this only works after version 12 as we can read by the entire set of properties.
				// TODO: test this case with JSON.
				const props = reader.readUint16();
				for (let j = 0; j < props; j++) {
					let propertyBlock = _ReadNextBlock(reader, function (err) {
						artboard.actor.error = err;
					});
				}
			} else {
				const animatedComponent = new _AnimatedComponent_js__WEBPACK_IMPORTED_MODULE_25__["default"](componentIndex);
				if (component.constructor === _ActorEvent_js__WEBPACK_IMPORTED_MODULE_4__["default"]) {
					// N.B. ActorEvents currently only keyframe their trigger so we cn optimize them into a separate array.
					animation._TriggerComponents.push(animatedComponent);
				} else {
					animation._Components.push(animatedComponent);
				}

				const props = reader.readUint16Length();
				for (let j = 0; j < props; j++) {
					let propertyBlock = _ReadNextBlock(reader, function (err) {
						artboard.actor.error = err;
					}, _AnimatedProperty_js__WEBPACK_IMPORTED_MODULE_26__["default"]);
					const propertyReader = propertyBlock.reader;
					const propertyType = propertyBlock.type;

					let validProperty = false;
					switch (propertyType) {
						case _AnimatedPropertyTypes.PosX:
						case _AnimatedPropertyTypes.PosY:
						case _AnimatedPropertyTypes.ScaleX:
						case _AnimatedPropertyTypes.ScaleY:
						case _AnimatedPropertyTypes.Rotation:
						case _AnimatedPropertyTypes.Opacity:
						case _AnimatedPropertyTypes.DrawOrder:
						case _AnimatedPropertyTypes.Length:
						case _AnimatedPropertyTypes.VertexDeform:
						case _AnimatedPropertyTypes.ConstraintStrength:
						case _AnimatedPropertyTypes.Trigger:
						case _AnimatedPropertyTypes.IntProperty:
						case _AnimatedPropertyTypes.FloatProperty:
						case _AnimatedPropertyTypes.StringProperty:
						case _AnimatedPropertyTypes.BooleanProperty:
						case _AnimatedPropertyTypes.IsCollisionEnabled:
						case _AnimatedPropertyTypes.ActiveChildIndex:
						case _AnimatedPropertyTypes.Sequence:
						case _AnimatedPropertyTypes.PathVertices:
						case _AnimatedPropertyTypes.FillColor:
						case _AnimatedPropertyTypes.StrokeColor:
						case _AnimatedPropertyTypes.StrokeWidth:
						case _AnimatedPropertyTypes.FillGradient:
						case _AnimatedPropertyTypes.StrokeGradient:
						case _AnimatedPropertyTypes.FillRadial:
						case _AnimatedPropertyTypes.StrokeRadial:
						case _AnimatedPropertyTypes.StrokeOpacity:
						case _AnimatedPropertyTypes.FillOpacity:
						case _AnimatedPropertyTypes.ShapeWidth:
						case _AnimatedPropertyTypes.ShapeHeight:
						case _AnimatedPropertyTypes.CornerRadius:
						case _AnimatedPropertyTypes.InnerRadius:
							validProperty = true;
							break;
						default:
							break;
					}
					if (!validProperty) {
						continue;
					}
					const animatedProperty = new _AnimatedProperty_js__WEBPACK_IMPORTED_MODULE_26__["default"](propertyType);
					animatedComponent._Properties.push(animatedProperty);

					propertyReader.openArray("frames");
					const keyFrameCount = propertyReader.readUint16Length();
					let lastKeyFrame = null;
					for (let k = 0; k < keyFrameCount; k++) {
						let keyFrame = new _KeyFrame_js__WEBPACK_IMPORTED_MODULE_40__["KeyFrame"](animatedProperty);

						propertyReader.openObject("frame");

						keyFrame._Time = propertyReader.readFloat64("time");

						switch (propertyType) {
							case _AnimatedPropertyTypes.IsCollisionEnabled:
							case _AnimatedPropertyTypes.BooleanProperty:
							case _AnimatedPropertyTypes.StringProperty:
							case _AnimatedPropertyTypes.Trigger:
							case _AnimatedPropertyTypes.DrawOrder:
							case _AnimatedPropertyTypes.ActiveChildIndex:
								// These do not interpolate.
								keyFrame._Interpolator = _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__["Hold"].instance;
								break;
							default:
								{
									const type = propertyReader.readUint8("interpolatorType");
									switch (type) {
										case 0:
											keyFrame._Interpolator = _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__["Hold"].instance;
											break;
										case 1:
											keyFrame._Interpolator = _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__["Linear"].instance;
											break;
										case 2:
											keyFrame._Interpolator = new _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__["Cubic"](propertyReader.readFloat32("cubicX1"), propertyReader.readFloat32("cubicY1"), propertyReader.readFloat32("cubicX2"), propertyReader.readFloat32("cubicY2"));
											break;
									}
									break;
								}
						}
						if (propertyType === _AnimatedPropertyTypes.PathVertices) {
							const path = artboard._Components[animatedComponent._ComponentIndex];
							const pointCount = path._Points.length;
							const points = [];

							for (let j = 0; j < pointCount; j++) {
								const point = path._Points[j];

								const pos = propertyReader.readFloat32Array(new Float32Array(2), "translation");
								points.push(pos[0], pos[1]);

								if (point.constructor === _PathPoint_js__WEBPACK_IMPORTED_MODULE_39__["StraightPathPoint"]) {
									points.push(propertyReader.readFloat32("radius"));
								} else {
									let p = propertyReader.readFloat32Array(new Float32Array(2), "inValue");
									points.push(p[0], p[1]);

									p = propertyReader.readFloat32Array(new Float32Array(2), "outValue");
									points.push(p[0], p[1]);
								}
							}

							keyFrame._Value = new Float32Array(points);
						} else if (propertyType === _AnimatedPropertyTypes.FillColor || propertyType === _AnimatedPropertyTypes.StrokeColor) {
							keyFrame._Value = propertyReader.readFloat32Array(new Float32Array(4), "value");
						} else if (propertyType === _AnimatedPropertyTypes.FillGradient || propertyType === _AnimatedPropertyTypes.StrokeGradient || propertyType === _AnimatedPropertyTypes.StrokeRadial || propertyType === _AnimatedPropertyTypes.FillRadial) {
							const fillLength = propertyReader.readUint16("length");
							keyFrame._Value = propertyReader.readFloat32Array(new Float32Array(fillLength), "value");
						} else if (propertyType === _AnimatedPropertyTypes.Trigger) {
							// No value on keyframe.
						} else if (propertyType === _AnimatedPropertyTypes.IntProperty) {
							keyFrame._Value = propertyReader.readInt32("value");
						} else if (propertyType === _AnimatedPropertyTypes.StringProperty) {
							keyFrame._Value = propertyReader.readString("value");
						} else if (propertyType === _AnimatedPropertyTypes.BooleanProperty || propertyType === _AnimatedPropertyTypes.IsCollisionEnabled) {
							keyFrame._Value = propertyReader.readBool("value");
						} else if (propertyType === _AnimatedPropertyTypes.DrawOrder) {
							propertyReader.openArray("drawOrder");
							const orderedImages = propertyReader.readUint16Length();
							const orderValue = [];
							for (let l = 0; l < orderedImages; l++) {
								propertyReader.openObject("order");
								const idx = propertyReader.readId("component");
								const order = propertyReader.readUint16("order");
								propertyReader.closeObject();
								orderValue.push({
									componentIdx: idx,
									value: order
								});
							}
							propertyReader.closeArray();
							keyFrame._Value = orderValue;
						} else if (propertyType === _AnimatedPropertyTypes.VertexDeform) {
							keyFrame._Value = new Float32Array(component._NumVertices * 2);
							component.hasVertexDeformAnimation = true;
							propertyReader.readFloat32Array(keyFrame._Value, "value");
						} else {
							keyFrame._Value = propertyReader.readFloat32("value");
						}

						if (propertyType === _AnimatedPropertyTypes.DrawOrder) {
							// Always hold draw order.
							keyFrame._Interpolator = _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__["Hold"].instance;
						} else if (propertyType === _AnimatedPropertyTypes.VertexDeform) {
							keyFrame._Interpolator = _Interpolation_js__WEBPACK_IMPORTED_MODULE_42__["Linear"].instance;
						}

						if (lastKeyFrame) {
							lastKeyFrame.setNext(keyFrame);
						}
						animatedProperty._KeyFrames.push(keyFrame);
						lastKeyFrame = keyFrame;
						propertyReader.closeObject();
					}
					if (lastKeyFrame) {
						lastKeyFrame.setNext(null);
					}
				}
			}
			reader.closeObject();
		}
		reader.closeArray();

		animation._DisplayStart = reader.readFloat32("animationStart");
		animation._DisplayEnd = reader.readFloat32("animationEnd");
		//animation._DisplayStart = 0;
		//animation._DisplayEnd = 50/60;
	} else {
		reader.closeArray();
	}
}

function _ReadAnimationsBlock(artboard, reader) {
	const animationsCount = reader.readUint16Length(); // Keep the reader aligned when using BinaryReader.
	let block = null;
	// The animations block only contains a list of animations, so we don't need to track how many we've read in.
	while ((block = _ReadNextBlock(reader, function (err) {
		artboard.actor.error = err;
	}, _Block_js__WEBPACK_IMPORTED_MODULE_43__["default"])) !== null) {
		switch (block.type) {
			case _BlockTypes.Animation:
				_ReadAnimationBlock(artboard, block.reader);
				break;
		}
	}
}

function _ReadNestedActorAssetBlock(actor, reader) {
	let asset = new _NestedActorAsset_js__WEBPACK_IMPORTED_MODULE_27__["default"](reader.readString(), reader.readString());
	actor._NestedActorAssets.push(asset);
}

function _ReadNestedActorAssets(actor, reader) {
	let nestedActorCount = reader.readUint16();
	let block = null;
	while ((block = _ReadNextBlock(reader, function (err) {
		actor.error = err;
	})) !== null) {
		switch (block.type) {
			case _BlockTypes.NestedActorAsset:
				_ReadNestedActorAssetBlock(actor, block.reader);
				break;
		}
	}
}

function _BuildJpegAtlas(atlas, img, imga, callback) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height);

	if (imga) {
		const imageDataRGB = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const dataRGB = imageDataRGB.data;
		const canvasAlpha = document.createElement("canvas");

		canvasAlpha.width = img.width;
		canvasAlpha.height = img.height;
		const actx = canvasAlpha.getContext("2d");
		actx.drawImage(imga, 0, 0, imga.width, imga.height);

		const imageDataAlpha = actx.getImageData(0, 0, canvasAlpha.width, canvasAlpha.height);
		const dataAlpha = imageDataAlpha.data;

		const pixels = dataAlpha.length / 4;
		let widx = 3;

		for (let j = 0; j < pixels; j++) {
			dataRGB[widx] = dataAlpha[widx - 1];
			widx += 4;
		}
		ctx.putImageData(imageDataRGB, 0, 0);
	}

	const atlasImage = new Image();
	const enc = canvas.toDataURL();
	atlasImage.src = enc;
	atlasImage.onload = function () {
		atlas.img = this;
		callback();
	};
}

function _JpegAtlas(dataRGB, dataAlpha, callback) {
	const _This = this;
	const img = document.createElement("img");
	let imga;
	let c = 0;
	let target = 1;
	img.onload = function () {
		c++;
		if (c === target) {
			_BuildJpegAtlas(_This, img, imga, callback);
		}
	};

	if (dataAlpha) {
		imga = document.createElement("img");
		imga.onload = function () {
			c++;
			if (c == target) {
				_BuildJpegAtlas(_This, img, imga, callback);
			}
		};
		imga.src = URL.createObjectURL(dataAlpha);
	}
	img.src = URL.createObjectURL(dataRGB);
}

function _ReadAtlasesBlock14(actor, reader, callback) {
	// Read atlases.
	const numAtlases = reader.readUint16();

	let waitCount = 0;
	let loadedCount = 0;
	function loaded() {
		loadedCount++;
		if (loadedCount === waitCount) {
			callback();
		}
	}

	for (let i = 0; i < numAtlases; i++) {
		let size = reader.readUint32();
		const atlasDataRGB = new Uint8Array(size);
		reader.readRaw(atlasDataRGB, atlasDataRGB.length);

		size = reader.readUint32();
		const atlasDataAlpha = new Uint8Array(size);
		reader.readRaw(atlasDataAlpha, atlasDataAlpha.length);

		const rgbSrc = new Blob([atlasDataRGB], { type: "image/jpeg" });
		const alphaSrc = new Blob([atlasDataAlpha], { type: "image/jpeg" });

		waitCount++;
		const atlas = new _JpegAtlas(rgbSrc, alphaSrc, loaded);

		actor._Atlases.push(atlas); //new Blob([atlasDataRGB], {type: "image/jpeg"}));
	}

	// Return true if we are waiting for atlases
	return waitCount !== loadedCount;
}

function _ReadAtlasesBlock15(actor, reader, callback) {
	// Internal Callback
	function loaded() {
		loadedCount++;
		if (loadedCount === waitCount) {
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

	for (let i = 0; i < numAtlases; i++) {
		waitCount++;
		let readCallback = function (data) {
			if (data.constructor === Blob) {
				const atlas = new _JpegAtlas(data, undefined, loaded);
				actor._Atlases.push(atlas);
			} else if (data.constructor === String) {
				const imgElm = document.createElement("img");
				const atlas = {};
				imgElm.onload = function () {
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

function _LoadNestedAssets(loader, actor, callback) {
	let loadCount = actor._NestedActorAssets.length;
	let nestedLoad = loader.loadNestedActor;
	if (loadCount == 0 || !nestedLoad) {
		callback(actor);
		return;
	}

	for (let asset of actor._NestedActorAssets) {
		nestedLoad(asset, function (nestedActor) {
			asset._Actor = nestedActor;
			loadCount--;
			if (loadCount <= 0) {
				callback(actor);
			}
		});
	}
}

function _ReadArtboardsBlock(actor, reader) {
	const artboardCount = reader.readUint16Length();
	const actorArtboards = actor._Artboards;

	// Guaranteed from the exporter to be in index order.
	let block = null;
	while ((block = _ReadNextBlock(reader, function (err) {
		actor.error = err;
	}, _Block_js__WEBPACK_IMPORTED_MODULE_43__["default"])) !== null) {
		switch (block.type) {
			case _BlockTypes.ActorArtboard:
				{
					const artboard = _ReadActorArtboard(block.reader, new _ActorArtboard_js__WEBPACK_IMPORTED_MODULE_37__["default"](actor), block.type);
					if (artboard) {
						actorArtboards.push(artboard);
					}
					break;
				}
		}
	}
}

function _ReadActor(loader, data, callback) {
	let reader = new _Readers_BinaryReader_js__WEBPACK_IMPORTED_MODULE_1__["default"](new Uint8Array(data));
	// Check signature
	if (reader.readUint8() !== 70 || reader.readUint8() !== 76 || reader.readUint8() !== 65 || reader.readUint8() !== 82 || reader.readUint8() !== 69) {
		const dataView = new DataView(data);
		const stringData = new TextDecoder("utf-8").decode(dataView);
		reader = new _Readers_JSONReader_js__WEBPACK_IMPORTED_MODULE_2__["default"]({ "container": JSON.parse(stringData) });
	}

	const version = reader.readUint32("version");
	const actor = new _Actor_js__WEBPACK_IMPORTED_MODULE_3__["default"]();
	actor.dataVersion = version;
	let block = null;
	let waitForAtlas = false;
	while ((block = _ReadNextBlock(reader, function (err) {
		actor.error = err;
	}, _Block_js__WEBPACK_IMPORTED_MODULE_43__["default"])) !== null) {
		switch (block.type) {
			case _BlockTypes.Artboards:
				_ReadArtboardsBlock(actor, block.reader);
				break;
			case _BlockTypes.Atlases:

				if (_ReadAtlasesBlock(actor, block.reader, function () {
					_LoadNestedAssets(loader, actor, callback);
				})) {
					waitForAtlas = true;
				}
				break;
			case _BlockTypes.NestedActorAssets:
				_ReadNestedActorAssets(actor, block.reader);
				break;
		}
	}
	if (!waitForAtlas) {
		_LoadNestedAssets(loader, actor, callback);
	}
}

function _ReadActorArtboard(reader, artboard) {
	artboard._Name = reader.readString("name");
	reader.readFloat32Array(artboard._Translation, "translation");
	artboard._Width = reader.readFloat32("width");
	artboard._Height = reader.readFloat32("height");
	reader.readFloat32Array(artboard._Origin, "origin");
	artboard._ClipContents = reader.readBool("clipContents");
	reader.readFloat32Array(artboard._Color, "color");

	let block = null;
	while ((block = _ReadNextBlock(reader, function (err) {
		artboard.actor.error = err;
	}, _Block_js__WEBPACK_IMPORTED_MODULE_43__["default"])) !== null) {
		switch (block.type) {
			case _BlockTypes.Nodes:
				_ReadComponentsBlock(artboard, block.reader);
				break;
			case _BlockTypes.Animations:
				_ReadAnimationsBlock(artboard, block.reader);
				break;
		}
	}

	return artboard;
}

function _ReadActorComponent(reader, component) {
	component._Name = reader.readString("name");
	component._ParentIdx = reader.readId("parent");
	return component;
}

function _ReadActorPaint(reader, component) {
	_ReadActorComponent(reader, component);
	component._Opacity = reader.readFloat32("opacity");
	return component;
}

function _ReadCustomProperty(reader, component, type) {
	_ReadActorComponent(reader, component);

	switch (type) {
		case _BlockTypes.CustomIntProperty:
			component._PropertyType = _CustomProperty_js__WEBPACK_IMPORTED_MODULE_24__["default"].Type.Integer;
			component._Value = reader.readInt32("int");
			break;
		case _BlockTypes.CustomFloatProperty:
			component._PropertyType = _CustomProperty_js__WEBPACK_IMPORTED_MODULE_24__["default"].Type.Float;
			component._Value = reader.readFloat32("float");
			break;
		case _BlockTypes.CustomStringProperty:
			component._PropertyType = _CustomProperty_js__WEBPACK_IMPORTED_MODULE_24__["default"].Type.String;
			component._Value = reader.readString("string");
			break;
		case _BlockTypes.CustomBooleanProperty:
			component._PropertyType = _CustomProperty_js__WEBPACK_IMPORTED_MODULE_24__["default"].Type.Boolean;
			component._Value = reader.readBool("bool");
			break;
	}

	return component;
}

function _ReadCollider(reader, component) {
	_ReadActorNode(reader, component);
	component._IsCollisionEnabled = reader.readBool("isCollisionEnabled");
	return component;
}

function _ReadRectangleCollider(reader, component) {
	_ReadCollider(reader, component);

	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");

	return component;
}

function _ReadTriangleCollider(reader, component) {
	_ReadCollider(reader, component);

	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");

	return component;
}

function _ReadCircleCollider(reader, component) {
	_ReadCollider(reader, component);

	component._Radius = reader.readFloat32("radius");

	return component;
}

function _ReadPolygonCollider(reader, component) {
	_ReadCollider(reader, component);

	const numVertices = reader.readUint32("cc");
	component._ContourVertices = new Float32Array(numVertices * 2);
	reader.readFloat32Array(component._ContourVertices, "countour");

	return component;
}

function _ReadLineCollider(reader, component) {
	_ReadCollider(reader, component);

	const numVertices = reader.readUint32("lineDataLength");
	component._Vertices = new Float32Array(numVertices * 2);
	reader.readFloat32Array(component._Vertices, "lineData");

	return component;
}

function _ReadActorEvent(reader, component) {
	_ReadActorComponent(reader, component);
	return component;
}

function _ReadActorNode(reader, component) {
	_ReadActorComponent(reader, component);

	reader.readFloat32Array(component._Translation, "translation");
	component._Rotation = reader.readFloat32("rotation");
	reader.readFloat32Array(component._Scale, "scale");
	component._Opacity = reader.readFloat32("opacity");
	component._IsCollapsedVisibility = reader.readBool("isCollapsed");

	reader.openArray("clips");
	const clipCount = reader.readUint8Length();
	if (clipCount) {
		component._Clips = [];
		for (let i = 0; i < clipCount; i++) {
			component._Clips.push(reader.readId("clip"));
		}
	}
	reader.closeArray();
	return component;
}

function _ReadActorNodeSolo(reader, component) {
	_ReadActorNode(reader, component);
	component._ActiveChildIndex = reader.readUint32("activeChild");
	return component;
}

function _ReadActorBone(reader, component) {
	_ReadActorNode(reader, component);
	component._Length = reader.readFloat32("length");
	return component;
}

function _ReadActorJellyBone(reader, component) {
	_ReadActorComponent(reader, component);
	component._Opacity = reader.readFloat32("opacity");
	component._IsCollapsedVisibility = reader.readBool("isCollapsedVisibility");

	return component;
}

function _ReadJellyComponent(reader, component) {
	_ReadActorComponent(reader, component);
	component._EaseIn = reader.readFloat32("easeIn");
	component._EaseOut = reader.readFloat32("easeOut");
	component._ScaleIn = reader.readFloat32("scaleIn");
	component._ScaleOut = reader.readFloat32("scaleOut");
	component._InTargetIdx = reader.readId("inTarget");
	component._OutTargetIdx = reader.readId("outTarget");

	return component;
}

function _ReadActorRootBone(reader, component) {
	_ReadActorNode(reader, component);

	return component;
}

function _ReadActorIKTarget(version, reader, component) {
	_ReadActorNode(reader, component);

	component._Strength = reader.readFloat32();
	component._InvertDirection = reader.readUint8() === 1;

	let numInfluencedBones = reader.readUint8();
	if (numInfluencedBones > 0) {
		component._InfluencedBones = [];

		for (let i = 0; i < numInfluencedBones; i++) {
			component._InfluencedBones.push(reader.readUint16());
		}
	}

	return component;
}

function _ReadActorConstraint(reader, component) {
	_ReadActorComponent(reader, component);
	component._Strength = reader.readFloat32("strength");
	component._IsEnabled = reader.readBool("isEnabled");
}

function _ReadActorTargetedConstraint(reader, component) {
	_ReadActorConstraint(reader, component);

	component._TargetIdx = reader.readId("target");
}

function _ReadActorIKConstraint(reader, component) {
	_ReadActorTargetedConstraint(reader, component);

	component._InvertDirection = reader.readBool("isInverted");

	reader.openArray("bones");
	const numInfluencedBones = reader.readUint8Length();
	if (numInfluencedBones > 0) {
		component._InfluencedBones = [];

		for (let i = 0; i < numInfluencedBones; i++) {
			component._InfluencedBones.push(reader.readId("")); // No need for a label here, since we're just clearing elements from the array.
		}
	}
	reader.closeArray();
	return component;
}

function _ReadActorDistanceConstraint(reader, component) {
	_ReadActorTargetedConstraint(reader, component);

	component._Distance = reader.readFloat32("distance");
	component._Mode = reader.readUint8("modeId");

	return component;
}

function _ReadActorTransformConstraint(reader, component) {
	_ReadActorTargetedConstraint(reader, component);

	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");

	return component;
}

function _ReadRotationConstraint(reader, component) {
	_ReadActorTargetedConstraint(reader, component);

	if (component._Copy = reader.readBool("copy")) {
		component._Scale = reader.readFloat32("scale");
	}
	if (component._EnableMin = reader.readBool("enableMin")) {
		component._Min = reader.readFloat32("min");
	}
	if (component._EnableMax = reader.readBool("enableMax")) {
		component._Max = reader.readFloat32("max");
	}

	component._Offset = reader.readBool("offset");
	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");
	component._MinMaxSpace = reader.readUint8("minMaxSpaceId");

	return component;
}

function _ReadAxisConstraint(reader, component) {
	_ReadActorTargetedConstraint(reader, component);
	// X Axis
	if (component._CopyX = reader.readBool("copyX")) {
		component._ScaleX = reader.readFloat32("scaleX");
	}
	if (component._EnableMinX = reader.readBool("enableMinX")) {
		component._MinX = reader.readFloat32("minX");
	}
	if (component._EnableMaxX = reader.readBool("enableMaxX")) {
		component._MaxX = reader.readFloat32("maxX");
	}

	// Y Axis
	if (component._CopyY = reader.readBool("copyY")) {
		component._ScaleY = reader.readFloat32("scaleY");
	}
	if (component._EnableMinY = reader.readBool("enableMinY")) {
		component._MinY = reader.readFloat32("minY");
	}
	if (component._EnableMaxY = reader.readBool("enableMaxY")) {
		component._MaxY = reader.readFloat32("maxY");
	}

	component._Offset = reader.readBool("offset");
	component._SourceSpace = reader.readUint8("sourceSpaceId");
	component._DestSpace = reader.readUint8("destSpaceId");
	component._MinMaxSpace = reader.readUint8("minMaxSpaceId");

	return component;
}

function _ReadActorShape(reader, component) {
	_ReadActorNode(reader, component);
	component._IsHidden = !reader.readBool("isVisible");
	/*component._BlendMode =*/reader.readUint8("blendMode");
	component._DrawOrder = reader.readUint16("drawOrder");

	return component;
}

function _ReadProceduralPath(reader, component) {
	_ReadActorNode(reader, component);
	component._Width = reader.readFloat32("width");
	component._Height = reader.readFloat32("height");
	return component;
}

function _ReadActorStar(reader, component) {
	_ReadProceduralPath(reader, component);
	component._Points = reader.readUint32("points");
	component._InnerRadius = reader.readFloat32("innerRadius");

	return component;
}

function _ReadActorRectangle(reader, component) {
	_ReadProceduralPath(reader, component);
	component._CornerRadius = reader.readFloat32("cornerRadius");
	return component;
}

function _ReadActorPolygon(reader, component) {
	_ReadProceduralPath(reader, component);
	component._Sides = reader.readUint32("sides");
	return component;
}

function _ReadActorTriangle(reader, component) {
	_ReadProceduralPath(reader, component);

	return component;
}

function _ReadActorEllipse(reader, component) {
	_ReadProceduralPath(reader, component);
	return component;
}

function _ReadColorFill(reader, component) {
	_ReadActorPaint(reader, component);

	reader.readFloat32Array(component._Color, "color");
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadColorStroke(reader, component) {
	_ReadActorPaint(reader, component);

	reader.readFloat32Array(component._Color, "color");
	component._Width = reader.readFloat32("width");

	return component;
}

function _ReadGradient(reader, component) {
	const numStops = reader.readUint8("numColorStops");
	const stops = new Float32Array(numStops * 5);
	reader.readFloat32Array(stops, "colorStops");
	component._ColorStops = stops;

	reader.readFloat32Array(component._Start, "start");
	reader.readFloat32Array(component._End, "end");

	return component;
}

function _ReadRadialGradient(reader, component) {
	_ReadGradient(reader, component);
	component._SecondaryRadiusScale = reader.readFloat32("secondaryRadiusScale");

	return component;
}

function _ReadGradientFill(reader, component) {
	_ReadActorPaint(reader, component);

	_ReadGradient(reader, component);
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadGradientStroke(reader, component) {
	_ReadActorPaint(reader, component);

	_ReadGradient(reader, component);
	component._Width = reader.readFloat32("width");

	return component;
}

function _ReadRadialGradientFill(reader, component) {
	_ReadActorPaint(reader, component);

	_ReadRadialGradient(reader, component);
	component._FillRule = reader.readUint8("fillRule");

	return component;
}

function _ReadRadialGradientStroke(reader, component) {
	_ReadActorPaint(reader, component);

	_ReadRadialGradient(reader, component);
	component._Width = reader.readFloat32("width");

	return component;
}

function _ReadSkinnable(reader, component) {
	_ReadActorNode(reader, component);

	reader.openArray("bones");
	const numConnectedBones = reader.readUint8Length();
	if (numConnectedBones > 0) {
		component._ConnectedBones = [];
		for (let i = 0; i < numConnectedBones; i++) {
			reader.openObject("bone");
			const bind = gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].create();
			const componentIndex = reader.readId("component");
			reader.readFloat32Array(bind, "bind");
			reader.closeObject();

			component._ConnectedBones.push({
				componentIndex: componentIndex,
				bind: bind,
				ibind: gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].create(), bind)
			});
		}
		reader.closeArray();

		// Read the final override parent world.
		const overrideWorld = gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].create();
		reader.readFloat32Array(overrideWorld, "worldTransform");
		gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].copy(component._WorldTransform, overrideWorld);
		component._OverrideWorldTransform = true;
	} else {
		// Close the previously opened JSON Array.
		reader.closeArray();
	}
}

function _ReadActorPath(reader, component) {
	_ReadSkinnable(reader, component);
	component._IsHidden = !reader.readBool("isVisible");
	component._IsClosed = reader.readBool("isClosed");

	reader.openArray("points");
	const pointCount = reader.readUint16Length();
	const points = new Array(pointCount);
	const isConnectedToBones = component._ConnectedBones && component._ConnectedBones.length > 0;
	for (let i = 0; i < pointCount; i++) {
		reader.openObject("point");
		const type = reader.readUint8("pointType");
		let point = null;
		switch (type) {
			case _PathPoint_js__WEBPACK_IMPORTED_MODULE_39__["PointType"].Straight:
				{
					point = new _PathPoint_js__WEBPACK_IMPORTED_MODULE_39__["StraightPathPoint"]();
					reader.readFloat32Array(point._Translation, "translation");
					point._Radius = reader.readFloat32("radius");
					if (isConnectedToBones) {
						point._Weights = new Float32Array(8);
					}
					break;
				}
			default:
				{
					point = new _PathPoint_js__WEBPACK_IMPORTED_MODULE_39__["CubicPathPoint"]();
					reader.readFloat32Array(point._Translation, "translation");
					reader.readFloat32Array(point._In, "in");
					reader.readFloat32Array(point._Out, "out");
					if (isConnectedToBones) {
						point._Weights = new Float32Array(24);
					}
					break;
				}
		}
		if (point._Weights) {
			reader.readFloat32Array(point._Weights, "weights");
		}
		reader.closeObject();
		if (!point) {
			throw new Error("Invalid point type " + type);
		}
		point._PointType = type;
		points[i] = point;
	}
	reader.closeArray();
	component._Points = points;

	return component;
}

function _ReadActorImage(reader, component) {
	_ReadActorNode(reader, component);
	const isVisible = reader.readBool("isVisible");
	if (isVisible) {
		component._BlendMode = reader.readUint8("blendMode");
		component._DrawOrder = reader.readUint16("drawOrder");
		component._AtlasIndex = reader.readUint8("atlas");

		reader.openArray("bones");
		const numConnectedBones = reader.readUint8Length();
		if (numConnectedBones > 0) {
			component._ConnectedBones = [];
			for (let i = 0; i < numConnectedBones; i++) {
				reader.openObject("bone");
				const bind = gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].create();
				const componentIndex = reader.readId("component");
				reader.readFloat32Array(bind, "bind");
				reader.closeObject();

				component._ConnectedBones.push({
					componentIndex: componentIndex,
					bind: bind,
					ibind: gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].create(), bind)
				});
			}
			reader.closeArray();

			// Read the final override parent world.
			const overrideWorld = gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].create();
			reader.readFloat32Array(overrideWorld, "worldTransform");
			gl_matrix__WEBPACK_IMPORTED_MODULE_41__["mat2d"].copy(component._WorldTransform, overrideWorld);
			component._OverrideWorldTransform = true;
		} else {
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

function _ReadActorImageSequence(reader, component) {
	_ReadActorImage(reader, component);

	// See if it was visible to begin with.
	if (component._AtlasIndex != -1) {
		reader.openArray("frames");
		const frameCount = reader.readUint16Length();
		component._SequenceFrames = [];
		const uvs = new Float32Array(component._NumVertices * 2 * frameCount);
		const uvStride = component._NumVertices * 2;
		component._SequenceUVs = uvs;
		const firstFrame = {
			atlas: component._AtlasIndex,
			offset: 0
		};

		component._SequenceFrames.push(firstFrame);

		let readIdx = 2;
		let writeIdx = 0;
		for (let i = 0; i < component._NumVertices; i++) {
			uvs[writeIdx++] = component._Vertices[readIdx];
			uvs[writeIdx++] = component._Vertices[readIdx + 1];
			readIdx += component._VertexStride;
		}

		let offset = uvStride;
		for (let i = 1; i < frameCount; i++) {
			reader.openObject("frame");
			let frame = {
				atlas: reader.readUint8("atlas"),
				offset: offset * 4
			};

			component._SequenceFrames.push(frame);
			reader.readFloat32ArrayOffset(uvs, uvStride, offset, "uv");
			reader.closeObject();

			offset += uvStride;
		}
		reader.closeArray();
	}

	return component;
}

function _ReadNestedActor(reader, component, nestedActorAssets) {
	_ReadActorNode(reader, component);
	let isVisible = reader.readUint8();
	if (isVisible) {
		// Draw order
		component._DrawOrder = reader.readUint16();
		let assetIndex = reader.readUint16();
		if (assetIndex < nestedActorAssets.length) {
			component._Asset = nestedActorAssets[assetIndex];
		}
	}
	return component;
}

class ActorLoader {
	load(url, callback) {
		let loader = this;
		if (url.constructor === String) {
			let req = new XMLHttpRequest();
			req.open("GET", url, true);
			req.responseType = "blob";
			req.onload = function () {
				let fileReader = new FileReader();
				fileReader.onload = function () {
					_ReadActor(loader, this.result, callback);
				};
				fileReader.readAsArrayBuffer(this.response);
			};
			req.send();
		} else {
			let fileReader = new FileReader();
			fileReader.onload = function () {
				_ReadActor(loader, this.result, callback);
			};
			fileReader.readAsArrayBuffer(url);
		}
	}
}

/***/ }),

/***/ "./source/ActorNode.js":
/*!*****************************!*\
  !*** ./source/ActorNode.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorNode; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



const TransformDirty = 1 << 0;
const WorldTransformDirty = 1 << 1;

function _UpdateTransform(node) {
	let r = node._Rotation;
	let t = node._Translation;

	//t[0] += 0.01;
	let s = node._Scale;
	let transform = node._Transform;

	gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].fromRotation(transform, r);

	transform[4] = t[0];
	transform[5] = t[1];

	gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].scale(transform, transform, s);

	return transform;
}

class ActorNode extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._Children = [];
		this._Transform = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();
		this._WorldTransform = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();
		this._OverrideWorldTransform = false;
		this._Constraints = null;
		this._PeerConstraints = null;

		this._Translation = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create();
		this._Rotation = 0;
		this._Scale = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), 1, 1);
		this._Opacity = 1;
		this._RenderOpacity = 1;

		this._IsCollapsedVisibility = false;
		this._RenderCollapsed = false;
		this._Clips = null;
	}

	eachChildRecursive(cb) {
		const children = this._Children;
		for (let child of children) {
			if (cb(child) === false) {
				continue;
			}

			if (child.eachChildRecursive) {
				child.eachChildRecursive(cb);
			}
		}
	}

	all(cb) {
		if (cb(this) === false) {
			return false;
		}
		const children = this._Children;
		for (let child of children) {
			if (cb(child) === false) {
				continue;
			}

			if (child.eachChildRecursive) {
				child.eachChildRecursive(cb);
			}
		}

		return true;
	}

	get constraints() {
		return this._Constraints;
	}

	get allConstraints() {
		return new Set((this._Constraints || []).concat(this._PeerConstraints || []));
	}

	addConstraint(constraint) {
		let constraints = this._Constraints;
		if (!constraints) {
			this._Constraints = constraints = [];
		}
		if (constraints.indexOf(constraint) !== -1) {
			return false;
		}

		constraints.push(constraint);

		return true;
	}

	addPeerConstraint(constraint) {
		if (!this._PeerConstraints) {
			this._PeerConstraints = [];
		}
		this._PeerConstraints.push(constraint);
	}

	markTransformDirty() {
		let actor = this._Actor;
		if (!actor) {
			// Still loading?
			return;
		}
		if (!actor.addDirt(this, TransformDirty)) {
			return;
		}
		actor.addDirt(this, WorldTransformDirty, true);
	}

	updateWorldTransform() {
		const parent = this._Parent;

		this._RenderOpacity = this._Opacity;

		if (parent) {
			this._RenderCollapsed = this._IsCollapsedVisibility || parent._RenderCollapsed;
			this._RenderOpacity *= parent._RenderOpacity;
			if (!this._OverrideWorldTransform) {
				gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(this._WorldTransform, parent._WorldTransform, this._Transform);
			}
		} else {
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(this._WorldTransform, this._Transform);
		}
	}

	get isNode() {
		return true;
	}

	get translation() {
		return this._Translation;
	}

	set translation(t) {
		if (gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].exactEquals(this._Translation, t)) {
			return;
		}

		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._Translation, t);
		this.markTransformDirty();
	}

	get scale() {
		return this._Scale;
	}

	set scale(t) {
		if (gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].exactEquals(this._Scale, t)) {
			return;
		}

		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._Scale, t);
		this.markTransformDirty();
	}

	get x() {
		return this._Translation[0];
	}

	set x(value) {
		if (this._Translation[0] != value) {
			this._Translation[0] = value;
			this.markTransformDirty();
		}
	}

	get y() {
		return this._Translation[1];
	}

	set y(value) {
		if (this._Translation[1] != value) {
			this._Translation[1] = value;
			this.markTransformDirty();
		}
	}

	get scaleX() {
		return this._Scale[0];
	}

	set scaleX(value) {
		if (this._Scale[0] != value) {
			this._Scale[0] = value;
			this.markTransformDirty();
		}
	}

	get scaleY() {
		return this._Scale[1];
	}

	set scaleY(value) {
		if (this._Scale[1] != value) {
			this._Scale[1] = value;
			this.markTransformDirty();
		}
	}

	get rotation() {
		return this._Rotation;
	}

	set rotation(value) {
		if (this._Rotation != value) {
			this._Rotation = value;
			this.markTransformDirty();
		}
	}

	get opacity() {
		return this._Opacity;
	}

	set opacity(value) {
		if (this._Opacity != value) {
			this._Opacity = value;
			this.markTransformDirty();
		}
	}

	update(dirt) {
		if ((dirt & TransformDirty) === TransformDirty) {
			_UpdateTransform(this);
		}
		if ((dirt & WorldTransformDirty) === WorldTransformDirty) {
			this.updateWorldTransform();
			let constraints = this._Constraints;
			if (constraints) {
				for (let constraint of constraints) {
					if (constraint.isEnabled) {
						constraint.constrain(this);
					}
				}
			}
		}
	}

	getWorldTransform() {
		if ((this._DirtMask & WorldTransformDirty) !== WorldTransformDirty) {
			return this._WorldTransform;
		}

		let parent = this.parent;
		let chain = [this];
		while (parent) {
			chain.unshift(parent);
			parent = parent.parent;
		}
		for (let item of chain) {
			if (item instanceof ActorNode) {
				if ((this._DirtMask & TransformDirty) !== TransformDirty) {
					_UpdateTransform(this);
				}
				if ((this._DirtMask & WorldTransformDirty) !== WorldTransformDirty) {
					item.updateWorldTransform();
				}
			}
		}
		return this._WorldTransform;
	}

	get transform() {
		return this._Transform;
	}

	get worldTransform() {
		return this._WorldTransform;
	}

	get worldTranslation() {
		const transform = this._WorldTransform;
		return gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), transform[4], transform[5]);
	}

	setCollapsedVisibility(v) {
		if (this._IsCollapsedVisibility === v) {
			return;
		}

		this._IsCollapsedVisibility = v;
		this.markTransformDirty();
	}

	makeInstance(resetActor) {
		const node = new ActorNode();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(this._Transform, node._Transform);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(this._WorldTransform, node._WorldTransform);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._Translation, node._Translation);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._Scale, node._Scale);
		this._Rotation = node._Rotation;
		this._Opacity = node._Opacity;
		this._RenderOpacity = node._RenderOpacity;
		this._OverrideWorldTransform = node._OverrideWorldTransform;
		if (node._Clips) {
			this._Clips = [];
			for (let clip of node._Clips) {
				this._Clips.push(clip._Idx);
			}
		} else {
			this._Clips = null;
		}
	}

	overrideWorldTransform(transform) {
		this._OverrideWorldTransform = transform ? true : false;
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(this._WorldTransform, transform);
		this.markTransformDirty();
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		let clips = this._Clips;
		if (!clips) {
			return;
		}

		for (let i = 0; i < clips.length; i++) {
			let idx = clips[i];
			clips[i] = components[idx];
		}
	}
}

/***/ }),

/***/ "./source/ActorNodeSolo.js":
/*!*********************************!*\
  !*** ./source/ActorNodeSolo.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorNodeSolo; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");


class ActorNodeSolo extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._ActiveChildIndex = 0;
	}

	setActiveChildIndex(idx) {
		this._ActiveChildIndex = Math.min(this._Children.length, Math.max(0, idx));

		for (let i = 0; i < this._Children.length; ++i) {
			const an = this._Children[i];
			const cv = i !== this._ActiveChildIndex - 1;
			an.setCollapsedVisibility(cv);
		}
	}

	set activeChildIndex(index) {
		if (index === this._ActiveChildIndex) {
			return;
		}
		this.setActiveChildIndex(index);
	}

	get activeChildIndex() {
		return this._ActiveChildIndex;
	}

	makeInstance(resetActor) {
		let node = new ActorNodeSolo();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._ActiveChildIndex = node._ActiveChildIndex;
	}

	completeResolve() {
		super.completeResolve();
		// Hierarchy is resolved.
		this.setActiveChildIndex(this._ActiveChildIndex);
	}
}

/***/ }),

/***/ "./source/ActorPath.js":
/*!*****************************!*\
  !*** ./source/ActorPath.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorPath; });
/* harmony import */ var _ActorSkinnableNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorSkinnableNode.js */ "./source/ActorSkinnableNode.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PathPoint.js */ "./source/PathPoint.js");
/* harmony import */ var _PathMatrix_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PathMatrix.js */ "./source/PathMatrix.js");





const CircleConstant = 0.552284749831;
const InverseCircleConstant = 1.0 - CircleConstant;

class ActorPath extends _ActorSkinnableNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._IsClosed = false;
		this._IsHidden = false;
		this._Points = [];
		this._RenderPath = null;
		this._Skin = null;
	}

	setSkin(skin) {
		this._Skin = skin;
	}

	get isHidden() {
		return this._IsHidden;
	}

	set isHidden(hidden) {
		this._IsHidden = hidden;
	}

	get isClosed() {
		return this._IsClosed;
	}

	set isClosed(closed) {
		this._IsClosed = closed;
	}

	initialize(actor, graphics) {}

	get numPoints() {
		return this._Points.length;
	}

	getPathOBB() {
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		const renderPoints = this.makeRenderPoints();
		for (let point of renderPoints) {
			let t = point.translation;

			let x = t[0];
			let y = t[1];

			if (x < min_x) {
				min_x = x;
			}
			if (y < min_y) {
				min_y = y;
			}
			if (x > max_x) {
				max_x = x;
			}
			if (y > max_y) {
				max_y = y;
			}

			if (point.pointType !== _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Straight) {
				let t = point.in;
				x = t[0];
				y = t[1];
				if (x < min_x) {
					min_x = x;
				}
				if (y < min_y) {
					min_y = y;
				}
				if (x > max_x) {
					max_x = x;
				}
				if (y > max_y) {
					max_y = y;
				}

				t = point.out;
				x = t[0];
				y = t[1];
				if (x < min_x) {
					min_x = x;
				}
				if (y < min_y) {
					min_y = y;
				}
				if (x > max_x) {
					max_x = x;
				}
				if (y > max_y) {
					max_y = y;
				}
			}
		}

		return [min_x, min_y, max_x, max_y];
	}

	getPathAABB() {
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		const obb = this.getPathOBB();

		const points = [gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(obb[0], obb[1]), gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(obb[2], obb[1]), gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(obb[2], obb[3]), gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(obb[0], obb[3])];
		let { _Transform: transform, isConnectedToBones } = this;

		if (isConnectedToBones) {
			// If we're connected to bones, convert the path coordinates into local parent space.
			transform = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), this.parent._WorldTransform);
		}

		for (let i = 0; i < points.length; i++) {
			const pt = points[i];
			const wp = transform ? gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(pt, pt, transform) : pt;
			if (wp[0] < min_x) {
				min_x = wp[0];
			}
			if (wp[1] < min_y) {
				min_y = wp[1];
			}

			if (wp[0] > max_x) {
				max_x = wp[0];
			}
			if (wp[1] > max_y) {
				max_y = wp[1];
			}
		}

		return [min_x, min_y, max_x, max_y];
	}

	makeInstance(resetActor) {
		const node = new ActorPath();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._IsClosed = node._IsClosed;
		this._IsHidden = node._IsHidden;

		const pointCount = node._Points.length;
		this._Points = new Array(pointCount);
		for (let i = 0; i < pointCount; i++) {
			let p = node._Points[i];
			this._Points[i] = p.makeInstance();
		}
	}

	get deformedPoints() {
		let boneTransforms = null;
		if (this._Skin) {
			boneTransforms = this._Skin.boneMatrices;
		}
		const { _Points: points, worldTransform } = this;
		if (!boneTransforms) {
			return points;
		}

		const deformedPoints = [];
		for (const point of points) {
			deformedPoints.push(point.skin(worldTransform, boneTransforms));
		}
		return deformedPoints;
	}

	makeRenderPoints() {
		let points = this.deformedPoints;

		let renderPoints = [];

		if (points.length) {
			let pl = points.length;
			const isClosed = this.isClosed;
			let previous = isClosed ? points[points.length - 1] : null;
			for (let i = 0; i < points.length; i++) {
				let point = points[i];

				switch (point.pointType) {
					case _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Straight:
						{
							const radius = point.radius;
							if (radius > 0) {
								if (!isClosed && (i === 0 || i === pl - 1)) {
									renderPoints.push(point);
									previous = point;
								} else {
									let next = points[(i + 1) % pl];
									previous = previous.pointType === _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Straight ? previous.translation : previous.out;
									next = next.pointType === _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Straight ? next.translation : next.in;

									const pos = point.translation;

									const toPrev = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), previous, pos);
									const toPrevLength = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].length(toPrev);
									toPrev[0] /= toPrevLength;
									toPrev[1] /= toPrevLength;

									const toNext = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), next, pos);
									const toNextLength = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].length(toNext);
									toNext[0] /= toNextLength;
									toNext[1] /= toNextLength;

									const renderRadius = Math.min(toPrevLength, Math.min(toNextLength, radius));

									let translation = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].scaleAndAdd(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pos, toPrev, renderRadius);
									const current = {
										pointType: _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Disconnected,
										translation: translation,
										out: gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].scaleAndAdd(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pos, toPrev, InverseCircleConstant * renderRadius),
										in: translation
									};
									renderPoints.push(current);

									translation = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].scaleAndAdd(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pos, toNext, renderRadius);

									previous = {
										pointType: _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Disconnected,
										translation: translation,
										in: gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].scaleAndAdd(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pos, toNext, InverseCircleConstant * renderRadius),
										out: translation
									};
									renderPoints.push(previous);
								}
							} else {
								renderPoints.push(point);
								previous = point;
							}
							break;
						}
					case _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Mirror:
					case _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Disconnected:
					case _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Asymmetric:
						renderPoints.push(point);
						previous = point;
						break;
				}
			}
		}
		return renderPoints;
	}

	getPathRenderTransform() {
		if (!this.isConnectedToBones) {
			return this.worldTransform;
		} else {
			return undefined;
		}
	}

	getPathTransform() {
		if (!this.isConnectedToBones) {
			return Object(_PathMatrix_js__WEBPACK_IMPORTED_MODULE_3__["default"])(this.worldTransform);
		} else {
			return undefined;
		}
	}

	invalidatePath() {
		this._RenderPath = null;
	}

	getPath() {
		const renderPath = this._RenderPath;
		if (renderPath) {
			return renderPath;
		}

		const path = new Path2D();

		const renderPoints = this.makeRenderPoints();
		const isClosed = this.isClosed;

		if (renderPoints.length) {
			let firstPoint = renderPoints[0];
			path.moveTo(firstPoint.translation[0], firstPoint.translation[1]);
			for (let i = 0, l = isClosed ? renderPoints.length : renderPoints.length - 1, pl = renderPoints.length; i < l; i++) {
				let point = renderPoints[i];
				let nextPoint = renderPoints[(i + 1) % pl];
				let cin = nextPoint.pointType === _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Straight ? null : nextPoint.in,
				    cout = point.pointType === _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["PointType"].Straight ? null : point.out;
				if (cin === null && cout === null) {
					path.lineTo(nextPoint.translation[0], nextPoint.translation[1]);
				} else {
					if (cout === null) {
						cout = point.translation;
					}
					if (cin === null) {
						cin = nextPoint.translation;
					}
					path.bezierCurveTo(cout[0], cout[1], cin[0], cin[1], nextPoint.translation[0], nextPoint.translation[1]);
				}
			}
			if (isClosed) {
				path.closePath();
			}
		}

		this._RenderPath = path;
		return path;
	}
}

/***/ }),

/***/ "./source/ActorPolygon.js":
/*!********************************!*\
  !*** ./source/ActorPolygon.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorPolygon; });
/* harmony import */ var _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorProceduralPath.js */ "./source/ActorProceduralPath.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class ActorPolygon extends _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(actor) {
    super(actor);
    this._Sides = 5;
  }

  resolveComponentIndices(components) {
    _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.resolveComponentIndices.call(this, components);
  }

  makeInstance(resetActor) {
    const node = new ActorPolygon();
    node.copy(this, resetActor);
    return node;
  }

  copy(node, resetActor) {
    super.copy(node, resetActor);
    this._Sides = node._Sides;
  }

  draw(ctx) {
    const transform = this._WorldTransform;
    ctx.save();
    ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

    const radiusX = this._Width / 2;
    const radiusY = this._Height / 2;
    const sides = this._Sides;

    ctx.moveTo(0.0, -radiusY);
    let angle = -Math.PI / 2.0;
    const inc = Math.PI * 2.0 / sides;
    for (let i = 0; i < sides; i++) {
      ctx.lineTo(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY);
      angle += inc;
    }
    ctx.closePath();
    ctx.restore();
  }

  getPathAABB() {
    let min_x = Number.MAX_VALUE;
    let min_y = Number.MAX_VALUE;
    let max_x = -Number.MAX_VALUE;
    let max_y = -Number.MAX_VALUE;

    const transform = this._WorldTransform;

    function addPoint(pt) {
      if (transform) {
        pt = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pt, transform);
      }
      if (pt[0] < min_x) {
        min_x = pt[0];
      }
      if (pt[1] < min_y) {
        min_y = pt[1];
      }
      if (pt[0] > max_x) {
        max_x = pt[0];
      }
      if (pt[1] > max_y) {
        max_y = pt[1];
      }
    }

    const sides = this._Sides;
    const radiusX = this.width / 2;
    const radiusY = this.height / 2;
    let angle = -Math.PI / 2.0;
    let inc = Math.PI * 2.0 / sides;
    addPoint([0.0, -radiusY]);
    for (let i = 0; i < sides; i++) {
      addPoint([Math.cos(angle) * radiusX, Math.sin(angle) * radiusY]);
      angle += inc;
    }

    return [gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(min_x, min_y), gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(max_x, max_y)];
  }
}

/***/ }),

/***/ "./source/ActorProceduralPath.js":
/*!***************************************!*\
  !*** ./source/ActorProceduralPath.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorProceduralPath; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _PathMatrix_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PathMatrix.js */ "./source/PathMatrix.js");




class ActorProceduralPath extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(actor) {
        super(actor);
        this._Width = 0;
        this._Height = 0;
    }

    get width() {
        return this._Width;
    }

    get height() {
        return this._Height;
    }

    resolveComponentIndices(components) {
        _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.resolveComponentIndices.call(this, components);
    }

    makeInstance(resetActor) {
        const node = ActorProceduralPath();
        ActorProceduralPath.prototype.copy.call(node, this, resetActor);
        return node;
    }

    getPathTransform() {
        return Object(_PathMatrix_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this._WorldTransform);
    }

    getPathRenderTransform() {
        return this.worldTransform;
    }

    getPathAABB() {
        let min_x = Number.MAX_VALUE;
        let min_y = Number.MAX_VALUE;
        let max_x = Number.MIN_VALUE;
        let max_y = Number.MIN_VALUE;

        const transform = this._Transform;
        function addPoint(point) {
            if (transform) {
                point = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), point, transform);
            }

            if (point[0] < min_x) {
                min_x = point[0];
            }
            if (point[1] < min_y) {
                min_y = point[1];
            }
            if (point[0] > max_x) {
                max_x = point[0];
            }
            if (point[1] > max_y) {
                max_y = point[1];
            }
        }

        const radiusX = this._Width / 2;
        const radiusY = this._Height / 2;
        addPoint([-radiusX, -radiusY]);
        addPoint([radiusX, -radiusY]);
        addPoint([-radiusX, radiusY]);
        addPoint([radiusX, radiusY]);

        return [min_x, min_y, max_x, max_y];
    }

    copy(node, resetActor) {
        super.copy(node, resetActor);

        this._Width = node._Width;
        this._Height = node._Height;
    }
}

/***/ }),

/***/ "./source/ActorRectangle.js":
/*!**********************************!*\
  !*** ./source/ActorRectangle.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorRectangle; });
/* harmony import */ var _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorProceduralPath.js */ "./source/ActorProceduralPath.js");


class ActorRectangle extends _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(actor) {
        super(actor);
        this._CornerRadius = 0.0;
    }

    resolveComponentIndices(components) {
        _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.resolveComponentIndices.call(this, components);
    }

    makeInstance(resetActor) {
        const node = new ActorRectangle();
        node.copy(this, resetActor);
        return node;
    }

    copy(node, resetActor) {
        super.copy(node, resetActor);
        this._CornerRadius = node._CornerRadius;
    }

    draw(ctx) {
        const transform = this._WorldTransform;
        ctx.save();
        ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);

        const halfWidth = Math.max(0, this._Width / 2);
        const halfHeight = Math.max(0, this._Height / 2);
        ctx.moveTo(-halfWidth, -halfHeight);
        let r = this._CornerRadius;
        if (r > 0) {
            this._DrawRoundedRect(ctx, -halfWidth, -halfHeight, this._Width, this._Height, r);
        } else {
            ctx.rect(-halfWidth, -halfHeight, this._Width, this._Height);
        }
        ctx.restore();
    }

    _DrawRoundedRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    getPath() {
        let { width, height, _CornerRadius: radius } = this;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const x = -halfWidth;
        const y = -halfHeight;
        const path = new Path2D();
        if (radius > 0.0) {
            if (width < 2 * radius) radius = width / 2;
            if (height < 2 * radius) radius = height / 2;
            path.moveTo(x + radius, y);
            path.arcTo(x + width, y, x + width, y + height, radius);
            path.arcTo(x + width, y + height, x, y + height, radius);
            path.arcTo(x, y + height, x, y, radius);
            path.arcTo(x, y, x + width, y, radius);
            path.closePath();
        } else {
            path.rect(-halfWidth, -halfHeight, width, height);
        }
        return path;
    }
}

/***/ }),

/***/ "./source/ActorRootBone.js":
/*!*********************************!*\
  !*** ./source/ActorRootBone.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorRootBone; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");


class ActorRootBone extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
	}

	makeInstance(resetActor) {
		const node = new ActorRootBone();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
	}
}

/***/ }),

/***/ "./source/ActorRotationConstraint.js":
/*!*******************************************!*\
  !*** ./source/ActorRotationConstraint.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorRotationConstraint; });
/* harmony import */ var _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorTargetedConstraint.js */ "./source/ActorTargetedConstraint.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _Decompose_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Decompose.js */ "./source/Decompose.js");
/* harmony import */ var _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TransformSpace.js */ "./source/TransformSpace.js");





const PI2 = Math.PI * 2;

class ActorRotationConstraint extends _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);

		this._Copy = false;
		this._EnableMin = false;
		this._EnableMax = false;
		this._Offset = false;

		this._Min = -PI2;
		this._Max = PI2;
		this._Scale = 1.0;

		this._SourceSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].World;
		this._DestSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].World;
		this._MinMaxSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].World;

		this._ComponentsA = new Float32Array(6);
		this._ComponentsB = new Float32Array(6);
	}

	onDirty(dirt) {
		this.markDirty();
	}

	makeInstance(resetActor) {
		let node = new ActorRotationConstraint();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._Copy = node._Copy;
		this._EnableMin = node._EnableMin;
		this._EnableMax = node._EnableMax;
		this._Offset = node._Offset;

		this._Min = node._Min;
		this._Max = node._Max;
		this._Scale = node._Scale;

		this._SourceSpace = node._SourceSpace;
		this._DestSpace = node._DestSpace;
		this._MinMaxSpace = node._MinMaxSpace;
	}

	constrain(tip) {
		let target = this._Target;

		let parent = this._Parent;
		let grandParent = parent._Parent;

		let { _ComponentsA: componentsA, _ComponentsB: componentsB, _Strength: t, _SourceSpace: sourceSpace, _DestSpace: destSpace, _MinMaxSpace: minMaxSpace } = this;

		let transformA = parent.worldTransform;
		let transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();
		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformA, componentsA);
		if (!target) {
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(transformB, transformA);
			componentsB[0] = componentsA[0];
			componentsB[1] = componentsA[1];
			componentsB[2] = componentsA[2];
			componentsB[3] = componentsA[3];
			componentsB[4] = componentsA[4];
			componentsB[5] = componentsA[5];
		} else {
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(transformB, target.worldTransform);
			if (sourceSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].Local) {
				let sourceGrandParent = target.parent;
				if (sourceGrandParent) {
					let inverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), sourceGrandParent.worldTransform);
					transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(inverse, inverse, transformB);
				}
			}
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformB, componentsB);

			if (!this._Copy) {
				componentsB[4] = destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].Local ? 0.0 : componentsA[4];
			} else {
				componentsB[4] *= this._Scale;
				if (this._Offset) {
					componentsB[4] += parent._Rotation;
				}
			}

			if (destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].Local) {
				// Destination space is in parent transform coordinates.
				// Recompose the parent local transform and get it in world, then decompose the world for interpolation.
				if (grandParent) {
					Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Compose"])(transformB, componentsB);
					gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, grandParent.worldTransform, transformB);
					Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformB, componentsB);
				}
			}
		}

		let clampLocal = minMaxSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].Local && grandParent ? true : false;
		if (clampLocal) {
			// Apply min max in local space, so transform to local coordinates first.
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Compose"])(transformB, componentsB);
			let inverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), grandParent.worldTransform);
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, inverse, transformB);
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformB, componentsB);
		}
		if (this._EnableMax && componentsB[4] > this._Max) {
			componentsB[4] = this._Max;
		}
		if (this._EnableMin && componentsB[4] < this._Min) {
			componentsB[4] = this._Min;
		}
		if (clampLocal) {
			// Transform back to world.
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Compose"])(transformB, componentsB);
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, grandParent.worldTransform, transformB);
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformB, componentsB);
		}

		let angleA = componentsA[4] % PI2;
		let angleB = componentsB[4] % PI2;
		let diff = angleB - angleA;
		if (diff > Math.PI) {
			diff -= PI2;
		} else if (diff < -Math.PI) {
			diff += PI2;
		}

		componentsB[4] = angleA + diff * t;
		componentsB[0] = componentsA[0];
		componentsB[1] = componentsA[1];
		componentsB[2] = componentsA[2];
		componentsB[3] = componentsA[3];
		componentsB[5] = componentsA[5];

		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Compose"])(parent.worldTransform, componentsB);
	}
}

/***/ }),

/***/ "./source/ActorScaleConstraint.js":
/*!****************************************!*\
  !*** ./source/ActorScaleConstraint.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorScaleConstraint; });
/* harmony import */ var _ActorAxisConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorAxisConstraint.js */ "./source/ActorAxisConstraint.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TransformSpace.js */ "./source/TransformSpace.js");
/* harmony import */ var _Decompose_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Decompose.js */ "./source/Decompose.js");





class ActorScaleConstraint extends _ActorAxisConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);

		this._ComponentsA = new Float32Array(6);
		this._ComponentsB = new Float32Array(6);
	}

	makeInstance(resetActor) {
		let node = new ActorScaleConstraint();
		node.copy(this, resetActor);
		return node;
	}

	constrain(tip) {
		let target = this._Target;

		let parent = this._Parent;
		let grandParent = parent._Parent;

		let { _ComponentsA: componentsA, _ComponentsB: componentsB, _Strength: t, _SourceSpace: sourceSpace, _DestSpace: destSpace, _MinMaxSpace: minMaxSpace } = this;

		let transformA = parent.worldTransform;
		let transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();
		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Decompose"])(transformA, componentsA);
		if (!target) {
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(transformB, transformA);
			componentsB[0] = componentsA[0];
			componentsB[1] = componentsA[1];
			componentsB[2] = componentsA[2];
			componentsB[3] = componentsA[3];
			componentsB[4] = componentsA[4];
			componentsB[5] = componentsA[5];
		} else {
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].copy(transformB, target.worldTransform);
			if (sourceSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local) {
				let sourceGrandParent = target.parent;
				if (sourceGrandParent) {
					let inverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), sourceGrandParent.worldTransform);
					transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(inverse, inverse, transformB);
				}
			}
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Decompose"])(transformB, componentsB);

			if (!this._CopyX) {
				componentsB[2] = destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local ? 1.0 : componentsA[2];
			} else {
				componentsB[2] *= this._ScaleX;
				if (this._Offset) {
					componentsB[2] *= parent._Scale[0];
				}
			}

			if (!this._CopyY) {
				componentsB[3] = destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local ? 0.0 : componentsA[3];
			} else {
				componentsB[3] *= this._ScaleY;

				if (this._Offset) {
					componentsB[3] *= parent._Scale[1];
				}
			}

			if (destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local) {
				// Destination space is in parent transform coordinates.
				// Recompose the parent local transform and get it in world, then decompose the world for interpolation.
				if (grandParent) {
					Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Compose"])(transformB, componentsB);
					gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, grandParent.worldTransform, transformB);
					Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Decompose"])(transformB, componentsB);
				}
			}
		}

		let clampLocal = minMaxSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local && grandParent ? true : false;
		if (clampLocal) {
			// Apply min max in local space, so transform to local coordinates first.
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Compose"])(transformB, componentsB);
			let inverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), grandParent.worldTransform);
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, inverse, transformB);
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Decompose"])(transformB, componentsB);
		}
		if (this._EnableMaxX && componentsB[2] > this._MaxX) {
			componentsB[2] = this._MaxX;
		}
		if (this._EnableMinX && componentsB[2] < this._MinX) {
			componentsB[2] = this._MinX;
		}
		if (this._EnableMaxY && componentsB[3] > this._MaxY) {
			componentsB[3] = this._MaxY;
		}
		if (this._EnableMinY && componentsB[3] < this._MinY) {
			componentsB[3] = this._MinY;
		}
		if (clampLocal) {
			// Transform back to world.
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Compose"])(transformB, componentsB);
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, grandParent.worldTransform, transformB);
			Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Decompose"])(transformB, componentsB);
		}

		let ti = 1.0 - t;

		componentsB[4] = componentsA[4];
		componentsB[0] = componentsA[0];
		componentsB[1] = componentsA[1];
		componentsB[2] = componentsA[2] * ti + componentsB[2] * t;
		componentsB[3] = componentsA[3] * ti + componentsB[3] * t;
		componentsB[5] = componentsA[5];

		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_3__["Compose"])(parent.worldTransform, componentsB);
	}
}

/***/ }),

/***/ "./source/ActorShape.js":
/*!******************************!*\
  !*** ./source/ActorShape.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorShape; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var _ActorPath_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActorPath.js */ "./source/ActorPath.js");
/* harmony import */ var _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActorProceduralPath.js */ "./source/ActorProceduralPath.js");
/* harmony import */ var _ColorComponent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ColorComponent.js */ "./source/ColorComponent.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");







class ActorShape extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._DrawOrder = 0;
		this._IsHidden = false;

		this._Paths = null;
		this._Fills = null;
		this._Strokes = null;
	}

	get paths() {
		return this._Paths;
	}

	addFill(fill) {
		if (!this._Fills) {
			this._Fills = [];
		}
		this._Fills.push(fill);
	}

	addStroke(stroke) {
		if (!this._Strokes) {
			this._Strokes = [];
		}
		this._Strokes.push(stroke);
	}

	get isHidden() {
		return this._IsHidden;
	}

	set isHidden(hidden) {
		this._IsHidden = hidden;
	}

	initialize(actor, graphics) {}

	computeAABB() {
		const clips = this.getClips();
		if (clips) {
			let aabb = null;
			for (const clip of clips) {
				clip.all(function (node) {
					if (node.constructor === ActorShape) {
						let bounds = node.computeAABB();
						if (!aabb) {
							aabb = bounds;
						} else {
							if (bounds[0] < aabb[0]) {
								aabb[0] = bounds[0];
							}
							if (bounds[1] < aabb[1]) {
								aabb[1] = bounds[1];
							}
							if (bounds[2] > aabb[2]) {
								aabb[2] = bounds[2];
							}
							if (bounds[3] > aabb[3]) {
								aabb[3] = bounds[3];
							}
						}
					}
				});
			}
			return aabb;
		}

		let aabb = null;
		let maxStroke = 0.0;
		if (this._Strokes) {
			for (const stroke of this._Strokes) {
				if (stroke.width > maxStroke) {
					maxStroke = stroke.width;
				}
			}
		}
		for (const path of this._Children) {
			if (path.constructor !== _ActorPath_js__WEBPACK_IMPORTED_MODULE_1__["default"] && !(path instanceof _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_2__["default"])) {
				continue;
			}

			if (path.numPoints < 2) {
				continue;
			}

			// This is the axis aligned bounding box in the space of the parent (this case our shape).
			const pathAABB = path.getPathAABB();

			if (!aabb) {
				aabb = pathAABB;
			} else {
				// Combine.
				aabb[0] = Math.min(aabb[0], pathAABB[0]);
				aabb[1] = Math.min(aabb[1], pathAABB[1]);

				aabb[2] = Math.max(aabb[2], pathAABB[2]);
				aabb[3] = Math.max(aabb[3], pathAABB[3]);
			}
		}

		const padStroke = maxStroke / 2.0;
		aabb[0] -= padStroke;
		aabb[1] -= padStroke;
		aabb[2] += padStroke;
		aabb[3] += padStroke;

		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		if (!aabb) {
			return null;
		}
		let world = this._WorldTransform;

		const points = [gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].create(), aabb[0], aabb[1]), gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].create(), aabb[2], aabb[1]), gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].create(), aabb[2], aabb[3]), gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].create(), aabb[0], aabb[3])];
		for (let i = 0; i < points.length; i++) {
			const pt = points[i];
			const wp = gl_matrix__WEBPACK_IMPORTED_MODULE_4__["vec2"].transformMat2d(pt, pt, world);
			if (wp[0] < min_x) {
				min_x = wp[0];
			}
			if (wp[1] < min_y) {
				min_y = wp[1];
			}

			if (wp[0] > max_x) {
				max_x = wp[0];
			}
			if (wp[1] > max_y) {
				max_y = wp[1];
			}
		}

		return new Float32Array([min_x, min_y, max_x, max_y]);
	}

	dispose(actor, graphics) {}

	draw(graphics) {
		if (this._RenderCollapsed || this._IsHidden) {
			return;
		}

		const ctx = graphics.ctx;
		ctx.save();
		ctx.globalAlpha = this._RenderOpacity;
		this.clip(ctx);
		const shapePath = this.getShapePath();

		const { _Fills: fills, _Strokes: strokes } = this;

		if (fills) {
			for (const fill of fills) {
				fill.fill(ctx, shapePath);
			}
		}
		if (strokes) {
			for (const stroke of strokes) {
				if (stroke._Width > 0) {
					stroke.stroke(ctx, shapePath);
				}
			}
		}

		// const aabb = this.computeAABB();
		// if(aabb)
		// {
		// 	ctx.fillStyle = "rgba(255,0,0,0.25)";
		// 	ctx.beginPath();
		// 	ctx.moveTo(aabb[0], aabb[1]);
		// 	ctx.lineTo(aabb[2], aabb[1]);
		// 	ctx.lineTo(aabb[2], aabb[3]);
		// 	ctx.lineTo(aabb[0], aabb[3]);
		// 	ctx.closePath();
		// 	ctx.fill();
		// }
		ctx.restore();
	}

	getShapePath() {
		const paths = this._Paths;
		const shapePath = new Path2D();
		for (const path of paths) {
			if (path.isHidden) {
				continue;
			}
			shapePath.addPath(path.getPath(), path.getPathTransform());
		}

		return shapePath;
	}

	getClips() {
		// Find clips.
		let clipSearch = this;
		let clips = null;
		while (clipSearch) {
			if (clipSearch._Clips) {
				clips = clipSearch._Clips;
				break;
			}
			clipSearch = clipSearch.parent;
		}

		return clips;
	}

	clip(ctx) {
		// Find clips.
		const clips = this.getClips();

		if (clips) {
			const clipPath = new Path2D();
			for (let clip of clips) {
				let shapes = new Set();
				clip.all(function (node) {
					if (node.constructor === ActorShape) {
						shapes.add(node);
					}
				});
				for (let shape of shapes) {
					const paths = shape.paths;
					for (const path of paths) {
						clipPath.addPath(path.getPath(), path.getPathTransform());
					}
				}
			}
			ctx.clip(clipPath);
		}
	}

	completeResolve() {
		super.completeResolve();
		this._Paths = this._Children.filter(child => child.constructor === _ActorPath_js__WEBPACK_IMPORTED_MODULE_1__["default"] || child instanceof _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_2__["default"]);
	}

	makeInstance(resetActor) {
		const node = new ActorShape();
		node._IsInstance = true;
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._DrawOrder = node._DrawOrder;
		this._IsHidden = node._IsHidden;
	}
}

/***/ }),

/***/ "./source/ActorSkin.js":
/*!*****************************!*\
  !*** ./source/ActorSkin.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorSkin; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class ActorSkin extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._BoneMatrices = null;
	}

	get boneMatrices() {
		return this._BoneMatrices;
	}

	update(dirt) {
		const parent = this._Parent;

		if (parent && parent._ConnectedBones) {
			const connectedBones = parent._ConnectedBones;
			const length = (connectedBones.length + 1) * 6;
			let bt = this._BoneMatrices;
			if (!bt || bt.length !== length) {
				this._BoneMatrices = bt = new Float32Array(length);
				// First bone transform is always identity.
				bt[0] = 1;
				bt[1] = 0;
				bt[2] = 0;
				bt[3] = 1;
				bt[4] = 0;
				bt[5] = 0;
			}

			let bidx = 6; // Start after first identity.

			const mat = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create();

			for (const cb of connectedBones) {
				if (!cb.node) {
					bt[bidx++] = 1;
					bt[bidx++] = 0;
					bt[bidx++] = 0;
					bt[bidx++] = 1;
					bt[bidx++] = 0;
					bt[bidx++] = 0;
					continue;
				}

				const wt = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(mat, cb.node._WorldTransform, cb.ibind);

				bt[bidx++] = wt[0];
				bt[bidx++] = wt[1];
				bt[bidx++] = wt[2];
				bt[bidx++] = wt[3];
				bt[bidx++] = wt[4];
				bt[bidx++] = wt[5];
			}
		}

		parent.invalidatePath();
	}

	makeInstance(resetActor) {
		const node = new ActorSkin();
		node.copy(this, resetActor);
		return node;
	}

	completeResolve() {
		super.completeResolve();
		const graph = this._Actor;
		let path = this._Parent;
		if (path) {
			path.setSkin(this);
			graph.addDependency(this, path);
			const connectedBones = path.connectedBones;
			if (connectedBones && connectedBones.length) {
				for (const { node } of connectedBones) {
					graph.addDependency(this, node);
					const constraints = node.allConstraints;

					if (constraints) {
						for (const constraint of constraints) {
							graph.addDependency(this, constraint);
						}
					}
				}
			}
		}
	}
}

/***/ }),

/***/ "./source/ActorSkinnableNode.js":
/*!**************************************!*\
  !*** ./source/ActorSkinnableNode.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorSkinnableNode; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");


class ActorSkinnableNode extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._ConnectedBones = null;
	}

	get connectedBones() {
		return this._ConnectedBones;
	}

	get isConnectedToBones() {
		return this._ConnectedBones && this._ConnectedBones.length > 0;
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._ConnectedBones) {
			for (let j = 0; j < this._ConnectedBones.length; j++) {
				const cb = this._ConnectedBones[j];
				cb.node = components[cb.componentIndex];
			}
		}
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		if (node._ConnectedBones) {
			this._ConnectedBones = [];
			for (const cb of node._ConnectedBones) {
				// Copy all props except for the actual node reference which will update in our resolve.
				this._ConnectedBones.push({
					componentIndex: cb.componentIndex,
					bind: cb.bind,
					ibind: cb.ibind
				});
			}
		}
	}
}

/***/ }),

/***/ "./source/ActorStar.js":
/*!*****************************!*\
  !*** ./source/ActorStar.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorStar; });
/* harmony import */ var _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorProceduralPath.js */ "./source/ActorProceduralPath.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class ActorStar extends _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(actor) {
        super(actor);
        this._Points = 5;
        this._InnerRadius = 0.0;
    }

    makeInstance(resetActor) {
        const node = new ActorStar();
        node.copy(this, resetActor);
        return node;
    }

    copy(node, resetActor) {
        super.copy(node, resetActor);
        this._Points = node._Points;
        this._InnerRadius = node._InnerRadius;
    }

    getOBB(transform) {
        let min_x = Number.MAX_VALUE;
        let min_y = Number.MAX_VALUE;
        let max_x = -Number.MAX_VALUE;
        let max_y = -Number.MAX_VALUE;

        function addPoint(pt) {
            if (transform) {
                pt = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pt, transform);
            }
            if (pt[0] < min_x) {
                min_x = pt[0];
            }
            if (pt[1] < min_y) {
                min_y = pt[1];
            }
            if (pt[0] > max_x) {
                max_x = pt[0];
            }
            if (pt[1] > max_y) {
                max_y = pt[1];
            }
        }

        const radiusX = this.width / 2;
        const radiusY = this.height / 2;

        let angle = -Math.PI / 2.0;

        const inc = Math.PI * 2.0 / this.sides;

        const sx = [radiusX, radiusX * this._InnerRadius];
        const sy = [radiusY, radiusY * this._InnerRadius];
        addPoint([0.0, -radiusY]);
        for (let i = 0; i < this.sides; i++) {
            addPoint([Math.cos(angle) * sx[i % 2], Math.sin(angle) * sy[i % 2]]);
            angle += inc;
        }

        return [gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(min_x, min_y), gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(max_x, max_y)];
    }

    getPath() {
        //const transform = this._WorldTransform;
        const radius = this._InnerRadius;

        const path = new Path2D();

        //ctx.save();
        //ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
        const radiusX = this._Width / 2;
        const radiusY = this._Height / 2;

        path.moveTo(0.0, -radiusY);

        const inc = Math.PI * 2.0 / this.sides;
        const sx = [radiusX, radiusX * radius];
        const sy = [radiusY, radiusY * radius];

        let angle = -Math.PI / 2.0;
        for (let i = 0; i < this.sides; i++) {
            path.lineTo(Math.cos(angle) * sx[i % 2], Math.sin(angle) * sy[i % 2]);
            angle += inc;
        }
        path.closePath();
        //ctx.restore();
        return path;
    }

    get sides() {
        return this._Points * 2;
    }
}

/***/ }),

/***/ "./source/ActorTargetedConstraint.js":
/*!*******************************************!*\
  !*** ./source/ActorTargetedConstraint.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorTargetedConstraint; });
/* harmony import */ var _ActorConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorConstraint.js */ "./source/ActorConstraint.js");


class ActorTargetedConstraint extends _ActorConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._TargetIdx = 0;
		this._Target = null;
	}

	makeInstance(resetActor) {
		const node = new ActorTargetedConstraint();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._TargetIdx = node._TargetIdx;
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);

		if (this._TargetIdx !== 0) {
			const target = components[this._TargetIdx];
			if (target) {
				this._Target = target;
				// Add dependency on target.
				this._Actor.addDependency(this._Parent, target);
			}
		}
	}
}

/***/ }),

/***/ "./source/ActorTransformConstraint.js":
/*!********************************************!*\
  !*** ./source/ActorTransformConstraint.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorTransformConstraint; });
/* harmony import */ var _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorTargetedConstraint.js */ "./source/ActorTargetedConstraint.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _Decompose_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Decompose.js */ "./source/Decompose.js");
/* harmony import */ var _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TransformSpace.js */ "./source/TransformSpace.js");





const PI2 = Math.PI * 2;

class ActorTransformConstraint extends _ActorTargetedConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);

		this._SourceSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].World;
		this._DestSpace = _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].World;

		this._ComponentsA = new Float32Array(6);
		this._ComponentsB = new Float32Array(6);
	}

	makeInstance(resetActor) {
		let node = new ActorTransformConstraint();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._SourceSpace = node._SourceSpace;
		this._DestSpace = node._DestSpace;
	}

	constrain(tip) {
		let target = this._Target;
		if (!target) {
			return;
		}

		let parent = this._Parent;

		let { _ComponentsA: componentsA, _ComponentsB: componentsB, _Strength: t, _SourceSpace: sourceSpace, _DestSpace: destSpace } = this;

		let transformA = parent.worldTransform;
		let transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].clone(target.worldTransform);
		if (sourceSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].Local) {
			let grandParent = target.parent;
			if (grandParent) {
				let inverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), grandParent.worldTransform);
				transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(inverse, inverse, transformB);
			}
		}
		if (destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_3__["default"].Local) {
			let grandParent = parent.parent;
			if (grandParent) {
				gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(transformB, grandParent.worldTransform, transformB);
			}
		}
		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformA, componentsA);
		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Decompose"])(transformB, componentsB);

		let angleA = componentsA[4] % PI2;
		let angleB = componentsB[4] % PI2;
		let diff = angleB - angleA;
		if (diff > Math.PI) {
			diff -= PI2;
		} else if (diff < -Math.PI) {
			diff += PI2;
		}

		let ti = 1.0 - t;

		componentsB[4] = angleA + diff * t;
		componentsB[0] = componentsA[0] * ti + componentsB[0] * t;
		componentsB[1] = componentsA[1] * ti + componentsB[1] * t;
		componentsB[2] = componentsA[2] * ti + componentsB[2] * t;
		componentsB[3] = componentsA[3] * ti + componentsB[3] * t;
		componentsB[5] = componentsA[5] * ti + componentsB[5] * t;

		Object(_Decompose_js__WEBPACK_IMPORTED_MODULE_2__["Compose"])(parent.worldTransform, componentsB);
	}
}

/***/ }),

/***/ "./source/ActorTranslationConstraint.js":
/*!**********************************************!*\
  !*** ./source/ActorTranslationConstraint.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorTranslationConstraint; });
/* harmony import */ var _ActorAxisConstraint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorAxisConstraint.js */ "./source/ActorAxisConstraint.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");
/* harmony import */ var _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TransformSpace.js */ "./source/TransformSpace.js");




class ActorTranslationConstraint extends _ActorAxisConstraint_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);
	}

	makeInstance(resetActor) {
		let node = new ActorTranslationConstraint();
		node.copy(this, resetActor);
		return node;
	}

	constrain(tip) {
		let target = this._Target;

		let parent = this._Parent;
		let grandParent = parent._Parent;

		let { _Strength: t, _SourceSpace: sourceSpace, _DestSpace: destSpace, _MinMaxSpace: minMaxSpace } = this;

		let transformA = parent.worldTransform;
		let translationA = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), transformA[4], transformA[5]);
		let translationB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create();
		if (!target) {
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(translationB, translationA);
		} else {
			let transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].clone(target.worldTransform);
			if (sourceSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local) {
				let sourceGrandParent = target.parent;
				if (sourceGrandParent) {
					let inverse = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), sourceGrandParent.worldTransform);
					transformB = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].mul(inverse, inverse, transformB);
				}
			}
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].set(translationB, transformB[4], transformB[5]);

			if (!this._CopyX) {
				translationB[0] = destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local ? 0.0 : translationA[0];
			} else {
				translationB[0] *= this._ScaleX;
				if (this._Offset) {
					translationB[0] += parent._Translation[0];
				}
			}

			if (!this._CopyY) {
				translationB[1] = destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local ? 0.0 : translationA[1];
			} else {
				translationB[1] *= this._ScaleY;

				if (this._Offset) {
					translationB[1] += parent._Translation[1];
				}
			}

			if (destSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local) {
				// Destination space is in parent transform coordinates.
				if (grandParent) {
					gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(translationB, translationB, grandParent.worldTransform);
				}
			}
		}

		let clampLocal = minMaxSpace === _TransformSpace_js__WEBPACK_IMPORTED_MODULE_2__["default"].Local && grandParent ? true : false;
		if (clampLocal) {
			// Apply min max in local space, so transform to local coordinates first.
			let temp = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["mat2d"].create(), grandParent.worldTransform);
			// Get our target world coordinates in parent local.
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(translationB, translationB, temp);
		}
		if (this._EnableMaxX && translationB[0] > this._MaxX) {
			translationB[0] = this._MaxX;
		}
		if (this._EnableMinX && translationB[0] < this._MinX) {
			translationB[0] = this._MinX;
		}
		if (this._EnableMaxY && translationB[1] > this._MaxY) {
			translationB[1] = this._MaxY;
		}
		if (this._EnableMinY && translationB[1] < this._MinY) {
			translationB[1] = this._MinY;
		}
		if (clampLocal) {
			// Transform back to world.
			gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(translationB, translationB, grandParent.worldTransform);
		}

		let ti = 1.0 - t;

		// Just interpolate world translation
		transformA[4] = translationA[0] * ti + translationB[0] * t;
		transformA[5] = translationA[1] * ti + translationB[1] * t;
	}
}

/***/ }),

/***/ "./source/ActorTriangle.js":
/*!*********************************!*\
  !*** ./source/ActorTriangle.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ActorTriangle; });
/* harmony import */ var _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorProceduralPath.js */ "./source/ActorProceduralPath.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class ActorTriangle extends _ActorProceduralPath_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor) {
		super(actor);
	}

	makeInstance(resetActor) {
		const node = new ActorTriangle();
		node.copy(this, resetActor);
		return node;
	}

	getOBB(transform) {
		let min_x = Number.MAX_VALUE;
		let min_y = Number.MAX_VALUE;
		let max_x = -Number.MAX_VALUE;
		let max_y = -Number.MAX_VALUE;

		function addPoint(pt) {
			if (transform) {
				pt = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create(), pt, transform);
			}
			if (pt[0] < min_x) {
				min_x = pt[0];
			}
			if (pt[1] < min_y) {
				min_y = pt[1];
			}
			if (pt[0] > max_x) {
				max_x = pt[0];
			}
			if (pt[1] > max_y) {
				max_y = pt[1];
			}
		}

		const radiusX = this.width / 2;
		const radiusY = this.height / 2;
		addPoint([0.0, -radiusY - 10]);
		addPoint([radiusX, radiusY]);
		addPoint([-radiusX, radiusY]);

		return [gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(min_x, min_y), gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].fromValues(max_x, max_y)];
	}

	draw(ctx) {
		const transform = this._WorldTransform;
		ctx.save();
		ctx.transform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
		const radiusX = Math.max(0, this._Width / 2);
		const radiusY = Math.max(0, this._Height / 2);

		ctx.moveTo(0.0, -radiusY);
		ctx.lineTo(radiusX, radiusY);
		ctx.lineTo(-radiusX, radiusY);
		ctx.closePath();
		ctx.restore();
	}
}

/***/ }),

/***/ "./source/AnimatedComponent.js":
/*!*************************************!*\
  !*** ./source/AnimatedComponent.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AnimatedComponent; });
class AnimatedComponent {
	constructor(componentIndex) {
		this._ComponentIndex = componentIndex;
		this._Properties = [];
	}
}

/***/ }),

/***/ "./source/AnimatedProperty.js":
/*!************************************!*\
  !*** ./source/AnimatedProperty.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AnimatedProperty; });
function block(id, key) {
	return { id, key };
}

const Blocks = {
	Unknown: block(0, "unknown"),
	PosX: block(1, "posX"),
	PosY: block(2, "posY"),
	ScaleX: block(3, "scaleX"),
	ScaleY: block(4, "scaleY"),
	Rotation: block(5, "rotation"),
	Opacity: block(6, "opacity"),
	DrawOrder: block(7, "drawOrder"),
	Length: block(8, "length"),
	VertexDeform: block(9, "vertices"),
	ConstraintStrength: block(10, "strength"),
	Trigger: block(11, "trigger"),
	IntProperty: block(12, "intValue"),
	FloatProperty: block(13, "floatValue"),
	StringProperty: block(14, "stringValue"),
	BooleanProperty: block(15, "boolValue"),
	IsCollisionEnabled: block(16, "isCollisionEnabled"),
	Sequence: block(17, "sequence"),
	ActiveChildIndex: block(18, "activeChild"),
	PathVertices: block(19, "pathVertices"),
	FillColor: block(20, "fillColor"),
	FillGradient: block(21, "fillGradient"),
	FillRadial: block(22, "fillRadial"),
	StrokeColor: block(23, "strokeColor"),
	StrokeGradient: block(24, "strokeGradient"),
	StrokeRadial: block(25, "strokeRadial"),
	StrokeWidth: block(26, "strokeWidth"),
	StrokeOpacity: block(27, "strokeOpacity"),
	FillOpacity: block(28, "fillOpacity"),
	ShapeWidth: block(29, "width"),
	ShapeHeight: block(30, "height"),
	CornerRadius: block(31, "cornerRadius"),
	InnerRadius: block(32, "innerRadius")
};

const _Types = {};
const _Map = new Map();
for (const key in Blocks) {
	const value = Blocks[key];
	_Types[key] = value.id;
	_Map.set(value.key, value.id);
}

class AnimatedProperty {
	constructor(type) {
		this._Type = type;
		this._KeyFrames = [];
	}

	static get Types() {
		return _Types;
	}

	static fromString(label) {
		return _Map.get(label) || 0;
	}
}

AnimatedProperty.Properties = {};

/***/ }),

/***/ "./source/Animation.js":
/*!*****************************!*\
  !*** ./source/Animation.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Animation; });
/* harmony import */ var _AnimatedProperty_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnimatedProperty.js */ "./source/AnimatedProperty.js");
/* harmony import */ var _ActorBone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActorBone.js */ "./source/ActorBone.js");
/* harmony import */ var _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PathPoint.js */ "./source/PathPoint.js");



const AnimatedPropertyTypes = _AnimatedProperty_js__WEBPACK_IMPORTED_MODULE_0__["default"].Types;

function keyFrameLocation(seconds, list, start, end) {
	let mid;
	let element;
	while (start <= end) {
		mid = start + end >> 1;
		element = list[mid]._Time;
		if (element < seconds) {
			start = mid + 1;
		} else if (element > seconds) {
			end = mid - 1;
		} else {
			return mid;
		}
	}
	return start;
}

class Animation {
	constructor(artboard) {
		this._Artboard = artboard;
		this._Components = [];
		this._TriggerComponents = [];
		this._DisplayStart = 0;
		this._DisplayEnd = 0;

		this._Name = null;
		this._FPS = 60;
		this._Duration = 0;
		this._Loop = false;
	}

	get duration() {
		return this._Duration;
	}

	triggerEvents(artboardComponents, fromTime, toTime, triggered) {
		const keyedTriggerComponents = this._TriggerComponents;
		for (let i = 0; i < keyedTriggerComponents.length; i++) {
			const keyedComponent = keyedTriggerComponents[i];
			const properties = keyedComponent._Properties;
			for (let j = 0; j < properties.length; j++) {
				const property = properties[j];
				switch (property._Type) {
					case AnimatedPropertyTypes.Trigger:
						{
							const keyFrames = property._KeyFrames;

							const kfl = keyFrames.length;
							if (kfl === 0) {
								continue;
							}

							const idx = keyFrameLocation(toTime, keyFrames, 0, keyFrames.length - 1);
							if (idx === 0) {
								if (keyFrames.length > 0 && keyFrames[0]._Time === toTime) {
									const component = artboardComponents[keyedComponent._ComponentIndex];
									triggered.push({
										name: component._Name,
										component: component,
										propertyType: property._Type,
										keyFrameTime: toTime,
										elapsed: 0
									});
								}
							} else {
								for (let k = idx - 1; k >= 0; k--) {
									const frame = keyFrames[k];
									if (frame._Time > fromTime) {
										const component = artboardComponents[keyedComponent._ComponentIndex];
										triggered.push({
											name: component._Name,
											component: component,
											propertyType: property._Type,
											keyFrameTime: frame._Time,
											elapsed: toTime - frame._Time
										});
									} else {
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

	apply(time, artboard, mix) {
		const components = this._Components;
		const imix = 1.0 - mix;
		const artboardComponents = artboard._Components;
		for (let i = 0; i < components.length; i++) {
			const animatedComponent = components[i];
			const component = artboardComponents[animatedComponent._ComponentIndex];
			if (!component) {
				continue;
			}

			const properties = animatedComponent._Properties;
			for (let j = 0; j < properties.length; j++) {
				const property = properties[j];
				const keyFrames = property._KeyFrames;

				const kfl = keyFrames.length;
				if (kfl === 0) {
					continue;
				}

				const idx = keyFrameLocation(time, keyFrames, 0, keyFrames.length - 1);
				let value = 0.0;

				if (idx === 0) {
					value = keyFrames[0]._Value;
				} else {
					if (idx < keyFrames.length) {
						const fromFrame = keyFrames[idx - 1];
						const toFrame = keyFrames[idx];
						if (time == toFrame._Time) {
							value = toFrame._Value;
						} else {
							let mix = (time - fromFrame._Time) / (toFrame._Time - fromFrame._Time);
							const interpolator = fromFrame._Interpolator;

							if (interpolator) {
								mix = interpolator.getEasedMix(mix);
							}
							value = fromFrame.interpolate(mix, toFrame);
						}
					} else {
						const kf = keyFrames[idx - 1];
						value = kf._Value;
					}
				}

				let markDirty = false;
				switch (property._Type) {
					case AnimatedPropertyTypes.PosX:
						if (mix === 1.0) {
							component._Translation[0] = value;
						} else {
							component._Translation[0] = component._Translation[0] * imix + value * mix;
						}

						markDirty = true;
						break;
					case AnimatedPropertyTypes.PosY:
						if (mix === 1.0) {
							component._Translation[1] = value;
						} else {
							component._Translation[1] = component._Translation[1] * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.ScaleX:
						if (mix === 1.0) {
							component._Scale[0] = value;
						} else {
							component._Scale[0] = value * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.ScaleY:
						if (mix === 1.0) {
							component._Scale[1] = value;
						} else {
							component._Scale[1] = value * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.Rotation:
						if (mix === 1.0) {
							component._Rotation = value;
						} else {
							component._Rotation = component._Rotation * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.Opacity:
						if (mix === 1.0) {
							component._Opacity = value;
						} else {
							component._Opacity = component._Opacity * imix + value * mix;
						}
						markDirty = true;
						break;
					case AnimatedPropertyTypes.ConstraintStrength:
						if (mix === 1.0) {
							component.strength = value;
						} else {
							component.strength = component._Strength * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.DrawOrder:
						if (artboard._LastSetDrawOrder != value) {
							artboard._LastSetDrawOrder = value;
							for (let i = 0; i < value.length; i++) {
								const v = value[i];
								artboardComponents[v.componentIdx]._DrawOrder = v.value;
							}
							artboard._IsImageSortDirty = true;
						}
						break;
					case AnimatedPropertyTypes.Length:
						markDirty = true;
						if (mix === 1.0) {
							component._Length = value;
						} else {
							component._Length = component._Length * imix + value * mix;
						}

						for (let l = 0; l < component._Children.length; l++) {
							const chd = component._Children[l];
							if (chd.constructor === _ActorBone_js__WEBPACK_IMPORTED_MODULE_1__["default"]) {
								chd._Translation[0] = component._Length;
								chd._IsDirty = true;
							}
						}
						break;
					case AnimatedPropertyTypes.VertexDeform:
						{
							component._VerticesDirty = true;
							const nv = component._NumVertices;
							const to = component._AnimationDeformedVertices;
							let tidx = 0;
							let fidx = 0;
							if (mix === 1.0) {
								for (let l = 0; l < nv; l++) {
									to[tidx] = value[fidx++];
									to[tidx + 1] = value[fidx++];
									tidx += 2;
								}
							} else {
								for (let l = 0; l < nv; l++) {
									to[tidx] = to[tidx] * imix + value[fidx++] * mix;
									to[tidx + 1] = to[tidx + 1] * imix + value[fidx++] * mix;
									tidx += 2;
								}
							}
							break;
						}
					case AnimatedPropertyTypes.StringProperty:
						component._Value = value;
						break;
					case AnimatedPropertyTypes.IntProperty:
						if (mix === 1.0) {
							component._Value = value;
						} else {
							component._Value = Math.round(component._Value * imix + value * mix);
						}
						break;
					case AnimatedPropertyTypes.FloatProperty:
						if (mix === 1.0) {
							component._Value = value;
						} else {
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
						if (component._SequenceFrames) {
							let frameIndex = Math.floor(value) % component._SequenceFrames.length;
							if (frameIndex < 0) {
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
							let readIdx = 0;
							if (mix !== 1.0) {
								for (const point of component._Points) {
									point._Translation[0] = point._Translation[0] * imix + value[readIdx++] * mix;
									point._Translation[1] = point._Translation[1] * imix + value[readIdx++] * mix;
									if (point.constructor === _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["StraightPathPoint"]) {
										point._Radius = point._Radius * imix + value[readIdx++] * mix;
									} else {
										point._In[0] = point._In[0] * imix + value[readIdx++] * mix;
										point._In[1] = point._In[1] * imix + value[readIdx++] * mix;
										point._Out[0] = point._Out[0] * imix + value[readIdx++] * mix;
										point._Out[1] = point._Out[1] * imix + value[readIdx++] * mix;
									}
								}
							} else {
								for (const point of component._Points) {
									point._Translation[0] = value[readIdx++];
									point._Translation[1] = value[readIdx++];
									if (point.constructor === _PathPoint_js__WEBPACK_IMPORTED_MODULE_2__["StraightPathPoint"]) {
										point._Radius = value[readIdx++];
									} else {
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
						if (mix === 1.0) {
							component._Width = value;
						} else {
							component._Width = component._Width * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.FillOpacity:
					case AnimatedPropertyTypes.StrokeOpacity:
						if (mix === 1.0) {
							component._Opacity = value;
						} else {
							component._Opacity = component._Opacity * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.FillColor:
					case AnimatedPropertyTypes.StrokeColor:
						{
							const color = component._Color;
							if (mix === 1.0) {
								color[0] = value[0];
								color[1] = value[1];
								color[2] = value[2];
								color[3] = value[3];
							} else {
								color[0] = color[0] * imix + value[0] * mix;
								color[1] = color[1] * imix + value[1] * mix;
								color[2] = color[2] * imix + value[2] * mix;
								color[3] = color[3] * imix + value[3] * mix;
							}
							break;
						}
					case AnimatedPropertyTypes.FillGradient:
					case AnimatedPropertyTypes.StrokeGradient:
						{
							if (mix === 1.0) {
								let ridx = 0;
								component._Start[0] = value[ridx++];
								component._Start[1] = value[ridx++];
								component._End[0] = value[ridx++];
								component._End[1] = value[ridx++];

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length) {
									cs[wi++] = value[ridx++];
								}
							} else {
								let ridx = 0;
								component._Start[0] = component._Start[0] * imix + value[ridx++] * mix;
								component._Start[1] = component._Start[1] * imix + value[ridx++] * mix;
								component._End[0] = component._End[0] * imix + value[ridx++] * mix;
								component._End[1] = component._End[1] * imix + value[ridx++] * mix;

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length) {
									cs[wi] = cs[wi] * imix + value[ridx++];
									wi++;
								}
							}
							break;
						}
					case AnimatedPropertyTypes.FillRadial:
					case AnimatedPropertyTypes.StrokeRadial:
						{
							if (mix === 1.0) {
								let ridx = 0;
								component._SecondaryRadiusScale = value[ridx++];
								component._Start[0] = value[ridx++];
								component._Start[1] = value[ridx++];
								component._End[0] = value[ridx++];
								component._End[1] = value[ridx++];

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length) {
									cs[wi++] = value[ridx++];
								}
							} else {
								let ridx = 0;
								component._SecondaryRadiusScale = component._SecondaryRadiusScale * imix + value[ridx++] * mix;
								component._Start[0] = component._Start[0] * imix + value[ridx++] * mix;
								component._Start[1] = component._Start[1] * imix + value[ridx++] * mix;
								component._End[0] = component._End[0] * imix + value[ridx++] * mix;
								component._End[1] = component._End[1] * imix + value[ridx++] * mix;

								const cs = component._ColorStops;
								let wi = 0;
								while (ridx < value.length && wi < cs.length) {
									cs[wi] = cs[wi] * imix + value[ridx++];
									wi++;
								}
							}
							break;
						}
					case AnimatedPropertyTypes.ShapeHeight:
						if (mix === 1.0) {
							component._Height = value;
						} else {
							component._Height = component._Height * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.CornerRadius:
						if (mix === 1.0) {
							component._CornerRadius = value;
						} else {
							component._CornerRadius = component._CornerRadius * imix + value * mix;
						}
						break;
					case AnimatedPropertyTypes.InnerRadius:
						if (mix === 1.0) {
							component._InnerRadius = value;
						} else {
							component._InnerRadius = component._InnerRadius * imix + value * mix;
						}
						break;

				}

				if (markDirty) {
					component.markTransformDirty();
				}
			}
		}
	}
}

/***/ }),

/***/ "./source/AnimationInstance.js":
/*!*************************************!*\
  !*** ./source/AnimationInstance.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AnimationInstance; });
/* harmony import */ var _Dispatcher_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dispatcher.js */ "./source/Dispatcher.js");


class AnimationInstance extends _Dispatcher_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(actor, animation) {
		super();
		this._Actor = actor;
		this._Animation = animation;
		this._Time = 0;

		this._Min = animation._DisplayStart || 0;
		this._Max = animation._DisplayEnd || animation._Duration;
		this._Loop = animation._Loop;
		this._Range = this._Max - this._Min;
	}

	get loop() {
		return this._Loop;
	}

	set loop(value) {
		this._Loop = value;
	}

	get time() {
		return this._Time;
	}

	get isOver() {
		return this._Time >= this._Max;
	}

	set time(newTime) {
		const delta = newTime - this._Time;
		let time = this._Time + delta % this._Range;

		if (time < this._Min) {
			if (this._Loop) {
				time = this._Max - (this._Min - time);
			} else {
				time = this._Min;
			}
		} else if (time > this._Max) {
			if (this._Loop) {
				time = this._Min + (time - this._Max);
			} else {
				time = this._Max;
			}
		}
		this._Time = time;
	}

	reset() {
		this._Time = 0.0;
	}

	advance(seconds) {
		const triggeredEvents = [];
		const actorComponents = this._Actor._Components;
		let time = this._Time;
		time += seconds % this._Range;
		if (time < this._Min) {
			if (this._Loop) {
				this._Animation.triggerEvents(actorComponents, time, this._Time, triggeredEvents);
				time = this._Max - (this._Min - time);
				this._Animation.triggerEvents(actorComponents, time, this._Max, triggeredEvents);
			} else {
				time = this._Min;
				if (this._Time != time) {
					this._Animation.triggerEvents(actorComponents, this._Min, this._Time, triggeredEvents);
				}
			}
		} else if (time > this._Max) {
			if (this._Loop) {
				this._Animation.triggerEvents(actorComponents, time, this._Time, triggeredEvents);
				time = this._Min + (time - this._Max);
				this._Animation.triggerEvents(actorComponents, this._Min - 0.001, time, triggeredEvents);
			} else {
				time = this._Max;
				if (this._Time != time) {
					this._Animation.triggerEvents(actorComponents, this._Time, this._Max, triggeredEvents);
				}
			}
		} else if (time > this._Time) {
			this._Animation.triggerEvents(actorComponents, this._Time, time, triggeredEvents);
		} else {
			this._Animation.triggerEvents(actorComponents, time, this._Time, triggeredEvents);
		}

		for (let i = 0; i < triggeredEvents.length; i++) {
			const event = triggeredEvents[i];
			this.dispatch("animationEvent", event);
			this._Actor.dispatch("animationEvent", event);
		}
		this._Time = time;

		return triggeredEvents;
	}

	apply(actor, mix) {
		this._Animation.apply(this._Time, actor, mix);
	}
}

/***/ }),

/***/ "./source/BezierAnimationCurve.js":
/*!****************************************!*\
  !*** ./source/BezierAnimationCurve.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BezierAnimationCurve; });
function cuberoot(x) {
	const y = Math.pow(Math.abs(x), 1 / 3);
	return x < 0 ? -y : y;
}

function yFromT(t, E, F, G, H) {
	const y = E * (t * t * t) + F * (t * t) + G * t + H;
	return y;
}

// http://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
function solveCubic(a, b, c, d) {
	if (Math.abs(a) < Number.EPSILON) {
		// Quadratic case, ax^2+bx+c=0
		a = b;
		b = c;
		c = d;
		if (Math.abs(a) < Number.EPSILON) {
			// Linear case, ax+b=0
			a = b;
			b = c;
			if (Math.abs(a) < Number.EPSILON) // Degenerate case
				{
					return [];
				}
			return [-b / a];
		}

		const D = b * b - 4 * a * c;
		if (Math.abs(D) < Number.EPSILON) return [-b / (2 * a)];else if (D > 0) return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
		return [];
	}

	// Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
	const p = (3 * a * c - b * b) / (3 * a * a);
	const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
	let roots;

	if (Math.abs(p) < Number.EPSILON) {
		// p = 0 -> t^3 = -q -> t = -q^1/3
		roots = [cuberoot(-q)];
	} else if (Math.abs(q) < Number.EPSILON) {
		// q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
		roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
	} else {
		const D = q * q / 4 + p * p * p / 27;
		if (Math.abs(D) < Number.EPSILON) {
			// D = 0 -> two roots
			roots = [-1.5 * q / p, 3 * q / p];
		} else if (D > 0) {
			// Only one real root
			const u = cuberoot(-q / 2 - Math.sqrt(D));
			roots = [u - p / (3 * u)];
		} else {
			// D < 0, three roots, but needs to use complex numbers/trigonometric solution
			const u = 2 * Math.sqrt(-p / 3);
			const t = Math.acos(3 * q / p / u) / 3; // D < 0 implies p < 0 and acos argument in [-1..1]
			const k = 2 * Math.PI / 3;
			roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)];
		}
	}

	// Convert back from depressed cubic
	for (let i = 0; i < roots.length; i++) {
		roots[i] -= b / (3 * a);
	}
	return roots;
}

class BezierAnimationCurve {
	constructor(pos1, control1, control2, pos2) {
		const y0a = pos1[1]; // initial y
		const x0a = pos1[0]; // initial x 
		const y1a = control1[1]; // 1st influence y   
		const x1a = control1[0]; // 1st influence x 
		const y2a = control2[1]; // 2nd influence y
		const x2a = control2[0]; // 2nd influence x
		const y3a = pos2[1]; // final y 
		const x3a = pos2[0]; // final x 

		this._E = y3a - 3 * y2a + 3 * y1a - y0a;
		this._F = 3 * y2a - 6 * y1a + 3 * y0a;
		this._G = 3 * y1a - 3 * y0a;
		this._H = y0a;

		this._Y0a = y0a;
		this._X0a = x0a;
		this._Y1a = y1a;
		this._X1a = x1a;
		this._Y2a = y2a;
		this._X2a = x2a;
		this._Y3a = y3a;
		this._X3a = x3a;
	}

	get(x) {
		const p0 = this._X0a - x;
		const p1 = this._X1a - x;
		const p2 = this._X2a - x;
		const p3 = this._X3a - x;

		const a = p3 - 3 * p2 + 3 * p1 - p0;
		const b = 3 * p2 - 6 * p1 + 3 * p0;
		const c = 3 * p1 - 3 * p0;
		const d = p0;

		const roots = solveCubic(a, b, c, d);
		let t = 0;
		for (let i = 0; i < roots.length; i++) {
			const r = roots[i];
			if (r >= 0.0 && r <= 1.0) {
				t = r;
				break;
			}
		}
		return yFromT(t, this._E, this._F, this._G, this._H);
	}
}

/***/ }),

/***/ "./source/Block.js":
/*!*************************!*\
  !*** ./source/Block.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Block; });
function block(id, key) {
				return { id, key };
}

const Blocks = {
				Nodes: block(1, "nodes"),
				ActorNode: block(2, "node"),
				ActorBone: block(3, "bone"),
				ActorRootBone: block(4, "rootBone"),
				ActorImage: block(5, "image"),
				View: block(6, "view"),
				Animation: block(7, "animation"),
				Animations: block(8, "animations"),
				Atlases: block(9, "atlases"),
				Atlas: block(10, "atlas"),
				ActorEvent: block(12, "event"),
				CustomIntProperty: block(13, "customInt"),
				CustomFloatProperty: block(14, "customFloat"),
				CustomStringProperty: block(15, "customString"),
				CustomBooleanProperty: block(16, "customBool"),
				ActorImageSequence: block(22, "imageSequence"),
				ActorNodeSolo: block(23, "solo"),
				JellyComponent: block(28, "jelly"),
				ActorJellyBone: block(29, "jellyBone"),
				ActorIKConstraint: block(30, "ikConstraint"),
				ActorDistanceConstraint: block(31, "distanceConstraint"),
				ActorTranslationConstraint: block(32, "translationConstraint"),
				ActorRotationConstraint: block(33, "rotationConstraint"),
				ActorScaleConstraint: block(34, "scaleConstraint"),
				ActorTransformConstraint: block(35, "transformConstraint"),

				ActorShape: block(100, "shape"),
				ActorPath: block(101, "path"),
				ColorFill: block(102, "colorFill"),
				ColorStroke: block(103, "colorStroke"),
				GradientFill: block(104, "gradientFill"),
				GradientStroke: block(105, "gradientStroke"),
				RadialGradientFill: block(106, "radialGradientFill"),
				RadialGradientStroke: block(107, "radialGradientStroke"),
				ActorEllipse: block(108, "ellipse"),
				ActorRectangle: block(109, "rectangle"),
				ActorTriangle: block(110, "triangle"),
				ActorStar: block(111, "star"),
				ActorPolygon: block(112, "polygon"),
				ActorSkin: block(113, "skin"),
				ActorArtboard: block(114, "artboard"),
				Artboards: block(115, "artboards")
};

const _Types = {};
const _Map = new Map();
for (const key in Blocks) {
				const value = Blocks[key];
				_Types[key] = value.id;
				_Map.set(value.key, value.id);
}

class Block {
				static get Types() {
								return _Types;
				}

				static fromString(label) {
								return _Map.get(label) || 0;
				}
}

/***/ }),

/***/ "./source/ColorComponent.js":
/*!**********************************!*\
  !*** ./source/ColorComponent.js ***!
  \**********************************/
/*! exports provided: FillRule, ActorColor, ColorFill, ColorStroke, GradientColor, GradientFill, GradientStroke, RadialGradientColor, RadialGradientFill, RadialGradientStroke */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FillRule", function() { return FillRule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ActorColor", function() { return ActorColor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorFill", function() { return ColorFill; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorStroke", function() { return ColorStroke; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GradientColor", function() { return GradientColor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GradientFill", function() { return GradientFill; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GradientStroke", function() { return GradientStroke; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RadialGradientColor", function() { return RadialGradientColor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RadialGradientFill", function() { return RadialGradientFill; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RadialGradientStroke", function() { return RadialGradientStroke; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class FillRule {
	static get EvenOdd() {
		return 0;
	}

	static get NonZero() {
		return 1;
	}
}

class ActorPaint extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._Opacity = 1.0;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Opacity = node._Opacity;
	}

	get opacity() {
		return this._Opacity;
	}
}

class ActorColor extends ActorPaint {
	constructor() {
		super();
		this._Color = new Float32Array(4);
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec4"].copy(this._Color, node._Color);
	}

	get cssColor() {
		const c = this._Color;
		return "rgba(" + Math.round(c[0] * 255) + ", " + Math.round(c[1] * 255) + ", " + Math.round(c[2] * 255) + ", " + c[3] * this._Opacity + ")";
	}
}

class ColorFill extends ActorColor {
	constructor() {
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor) {
		const node = new ColorFill();
		ColorFill.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(ctx, path) {
		ctx.fillStyle = this.cssColor;

		switch (this._FillRule) {
			case FillRule.EvenOdd:
				ctx.fill(path, "evenodd");
				break;
			case FillRule.NonZero:
				ctx.fill(path, "nonzero");
				break;
		}
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			this._Parent.addFill(this);
		}
	}
}

class ColorStroke extends ActorColor {
	constructor() {
		super();
		this._Width = 0.0;
	}

	get width() {
		return this._Width;
	}

	makeInstance(resetActor) {
		const node = new ColorStroke();
		ColorStroke.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx, path) {
		ctx.strokeStyle = this.cssColor;
		ctx.lineWidth = this._Width;
		ctx.stroke(path);
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			this._Parent.addStroke(this);
		}
	}
}

class GradientColor extends ActorPaint {
	constructor() {
		super();
		this._ColorStops = new Float32Array(10);
		this._Start = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create();
		this._End = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create();
		this._RenderStart = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create();
		this._RenderEnd = gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].create();
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._ColorStops = new Float32Array(node._ColorStops);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._Start, node._Start);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._End, node._End);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._RenderStart, node._RenderStart);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].copy(this._RenderEnd, node._RenderEnd);
	}

	completeResolve() {
		super.completeResolve();
		const graph = this._Actor;
		const shape = this._Parent;
		graph.addDependency(this, shape);
	}

	update(dirt) {
		const shape = this._Parent;
		const world = shape.worldTransform;
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(this._RenderStart, this._Start, world);
		gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].transformMat2d(this._RenderEnd, this._End, world);
	}
}

class GradientFill extends GradientColor {
	constructor() {
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor) {
		const node = new GradientFill();
		GradientFill.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(ctx, path) {
		const { _RenderStart: start, _RenderEnd: end, _ColorStops: stops } = this;
		const gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);

		const opacity = this._Opacity;
		const numStops = stops.length / 5;
		let idx = 0;
		for (let i = 0; i < numStops; i++) {
			const style = "rgba(" + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + stops[idx++] * opacity + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}

		ctx.fillStyle = gradient;
		switch (this._FillRule) {
			case FillRule.EvenOdd:
				ctx.fill(path, "evenodd");
				break;
			case FillRule.NonZero:
				ctx.fill(path, "nonzero");
				break;
		}
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			this._Parent.addFill(this);
		}
	}
}

class GradientStroke extends GradientColor {
	constructor() {
		super();
		this._Width = 0.0;
	}

	get width() {
		return this._Width;
	}

	makeInstance(resetActor) {
		const node = new GradientStroke();
		GradientStroke.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx, path) {
		const { _RenderStart: start, _RenderEnd: end, _ColorStops: stops } = this;
		const gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);

		const opacity = this._Opacity;
		const numStops = stops.length / 5;
		let idx = 0;
		for (let i = 0; i < numStops; i++) {
			const style = "rgba(" + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + stops[idx++] * opacity + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}

		ctx.lineWidth = this._Width;
		ctx.strokeStyle = gradient;
		ctx.stroke(path);
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			this._Parent.addStroke(this);
		}
	}
}

class RadialGradientColor extends GradientColor {
	constructor() {
		super();
		this._SecondaryRadiusScale = 1.0;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._SecondaryRadiusScale = node._SecondaryRadiusScale;
	}
}

class RadialGradientFill extends RadialGradientColor {
	constructor() {
		super();
		this._FillRule = FillRule.EvenOdd;
	}

	makeInstance(resetActor) {
		const node = new RadialGradientFill();
		RadialGradientFill.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._FillRule = node._FillRule;
	}

	fill(ctx, path) {
		let { _RenderStart: start, _RenderEnd: end, _ColorStops: stops, _SecondaryRadiusScale: secondaryRadiusScale } = this;
		const gradient = ctx.createRadialGradient(0.0, 0.0, 0.0, 0.0, 0.0, gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].distance(start, end));

		const opacity = this._Opacity;
		const numStops = stops.length / 5;
		let idx = 0;
		for (let i = 0; i < numStops; i++) {
			const style = "rgba(" + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + stops[idx++] * opacity + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}

		ctx.fillStyle = gradient;

		// const squash = Math.max(0.00001, secondaryRadiusScale);
		// const diff = vec2.subtract(vec2.create(), end, start);
		// const angle = Math.atan2(diff[1], diff[0]);
		// ctx.save();
		// ctx.translate(start[0], start[1]);
		// ctx.rotate(angle);
		// ctx.scale(1.0, squash);

		switch (this._FillRule) {
			case FillRule.EvenOdd:
				ctx.fill(path, "evenodd");
				break;
			case FillRule.NonZero:
				ctx.fill(path, "nonzero");
				break;
		}
		//ctx.restore();
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			this._Parent.addFill(this);
		}
	}
}

class RadialGradientStroke extends RadialGradientColor {
	constructor() {
		super();
		this._Width = 0.0;
	}

	get width() {
		return this._Width;
	}

	makeInstance(resetActor) {
		const node = new RadialGradientStroke();
		RadialGradientStroke.prototype.copy.call(node, this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);

		this._Width = node._Width;
	}

	stroke(ctx, path) {

		const { _RenderStart: start, _RenderEnd: end, _ColorStops: stops, _SecondaryRadiusScale: secondaryRadiusScale } = this;
		const gradient = ctx.createRadialGradient(0.0, 0.0, 0.0, 0.0, 0.0, gl_matrix__WEBPACK_IMPORTED_MODULE_1__["vec2"].distance(start, end));

		const opacity = this._Opacity;
		const numStops = stops.length / 5;
		let idx = 0;
		for (let i = 0; i < numStops; i++) {
			const style = "rgba(" + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + Math.round(stops[idx++] * 255) + ", " + stops[idx++] * opacity + ")";
			const value = stops[idx++];
			gradient.addColorStop(value, style);
		}

		ctx.lineWidth = this._Width;
		ctx.strokeStyle = gradient;

		// const squash = Math.max(0.00001, secondaryRadiusScale);
		// const angleVector = vec2.subtract(vec2.create(), end, start);
		// const angle = Math.atan2(angleVector[1], angleVector[0]);

		// ctx.save();
		// ctx.translate(start[0], start[1]);
		// ctx.rotate(angle);
		// ctx.scale(1.0, squash);
		ctx.stroke(path);
		// ctx.restore();
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._Parent) {
			this._Parent.addStroke(this);
		}
	}
}

/***/ }),

/***/ "./source/CustomProperty.js":
/*!**********************************!*\
  !*** ./source/CustomProperty.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CustomProperty; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");


class CustomProperty extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();
		this._PropertyType = CustomProperty.Integer;
		this._Value = 0;
	}

	get propertyType() {
		return this._PropertyType;
	}

	get value() {
		return this._Value;
	}

	makeInstance(resetActor) {
		const node = new CustomProperty();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._PropertyType = node._PropertyType;
		this._Value = node._Value;
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);
		if (this._ParentIdx !== undefined) {
			this._Parent = components[this._ParentIdx];
			if (this._Parent) {
				this._Parent._CustomProperties.push(this);
			}
		}
	}
}

CustomProperty.Type = {
	Integer: 0,
	Float: 1,
	String: 2,
	Boolean: 3
};

/***/ }),

/***/ "./source/Decompose.js":
/*!*****************************!*\
  !*** ./source/Decompose.js ***!
  \*****************************/
/*! exports provided: Decompose, Compose */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Decompose", function() { return Decompose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Compose", function() { return Compose; });
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");


function Decompose(m, result) {
	let m0 = m[0],
	    m1 = m[1],
	    m2 = m[2],
	    m3 = m[3];

	let rotation = Math.atan2(m1, m0);
	let denom = m0 * m0 + m1 * m1;
	let scaleX = Math.sqrt(denom);
	let scaleY = (m0 * m3 - m2 * m1) / scaleX;
	let skewX = Math.atan2(m0 * m2 + m1 * m3, denom);

	result[0] = m[4];
	result[1] = m[5];
	result[2] = scaleX;
	result[3] = scaleY;
	result[4] = rotation;
	result[5] = skewX;
}

function Compose(m, result) {
	let r = result[4];

	if (r !== 0) {
		gl_matrix__WEBPACK_IMPORTED_MODULE_0__["mat2d"].fromRotation(m, r);
	} else {
		gl_matrix__WEBPACK_IMPORTED_MODULE_0__["mat2d"].identity(m);
	}
	m[4] = result[0];
	m[5] = result[1];
	gl_matrix__WEBPACK_IMPORTED_MODULE_0__["mat2d"].scale(m, m, [result[2], result[3]]);

	let sk = result[5];
	if (sk !== 0.0) {
		m[2] = m[0] * sk + m[2];
		m[3] = m[1] * sk + m[3];
	}
}

/***/ }),

/***/ "./source/Dispatcher.js":
/*!******************************!*\
  !*** ./source/Dispatcher.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Dispatcher; });
class Dispatcher {
	constructor() {
		this.events = {};
	}

	addEventListener(event, callback) {
		let evt = this.events[event];
		if (!evt) {
			this.events[event] = evt = [];
		}
		if (evt.indexOf(callback) !== -1) {
			return;
		}
		evt.push(callback);
	}

	removeEventListener(event, callback) {
		let evt = this.events[event];
		if (!evt) {
			return true;
		}
		for (let i = 0; i < evt.length; i++) {
			if (evt[i] === callback) {
				evt.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	dispatch(event, data, extraContext) {
		let evt = this.events[event];
		if (evt) {
			for (let i = 0; i < evt.length; i++) {
				evt[i].call(this, data, extraContext);
			}
		}
	}
}

/***/ }),

/***/ "./source/Flare.js":
/*!*************************!*\
  !*** ./source/Flare.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports.Graphics = __webpack_require__(/*! ./Graphics.js */ "./source/Graphics.js").default;
exports.ActorLoader = __webpack_require__(/*! ./ActorLoader.js */ "./source/ActorLoader.js").default;
exports.AnimationInstance = __webpack_require__(/*! ./AnimationInstance.js */ "./source/AnimationInstance.js").default;
exports.ActorCollider = __webpack_require__(/*! ./ActorCollider.js */ "./source/ActorCollider.js").default;
exports.ActorColliderPolygon = __webpack_require__(/*! ./ActorColliderPolygon.js */ "./source/ActorColliderPolygon.js").default;
exports.ActorColliderLine = __webpack_require__(/*! ./ActorColliderLine.js */ "./source/ActorColliderLine.js").default;
exports.ActorColliderCircle = __webpack_require__(/*! ./ActorColliderCircle.js */ "./source/ActorColliderCircle.js").default;
exports.ActorColliderRectangle = __webpack_require__(/*! ./ActorColliderRectangle.js */ "./source/ActorColliderRectangle.js").default;
exports.ActorColliderTriangle = __webpack_require__(/*! ./ActorColliderTriangle.js */ "./source/ActorColliderTriangle.js").default;

/***/ }),

/***/ "./source/Graphics.js":
/*!****************************!*\
  !*** ./source/Graphics.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Graphics; });
class Graphics {
	constructor(canvas) {
		if (!canvas) {
			canvas = document.createElement("canvas");
		}
		this._Canvas = canvas;
		this._Context = canvas.getContext("2d");
	}

	get canvas() {
		return this._Canvas;
	}

	get ctx() {
		return this._Context;
	}

	dispose() {}

	get width() {
		return this._Canvas.width;
	}

	get height() {
		return this._Canvas.height;
	}

	clear(color) {
		let ctx = this._Context;
		let cvs = this._Canvas;

		ctx.clearRect(0, 0, cvs.width, cvs.height);
		ctx.save();
		if (color && color[3]) {
			ctx.fillStyle = "rgba(" + Math.round(color[0] * 255) + "," + Math.round(color[1] * 255) + "," + Math.round(color[2] * 255) + "," + color[3] + ")";
			ctx.rect(0, 0, cvs.width, cvs.height);
			ctx.fill();
		}
	}

	setView(transform) {
		this.ctx.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
	}

	flush() {
		let ctx = this._Context;
		ctx.restore();
	}

	get viewportWidth() {
		return this._Canvas.width;
	}

	get viewportHeight() {
		return this._Canvas.height;
	}

	setSize(width, height) {
		if (this.width !== width || this.height !== height) {
			this._Canvas.width = width;
			this._Canvas.height = height;
			return true;
		}
		return false;
	}
}

/***/ }),

/***/ "./source/Interpolation.js":
/*!*********************************!*\
  !*** ./source/Interpolation.js ***!
  \*********************************/
/*! exports provided: Hold, Linear, Cubic */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Hold", function() { return Hold; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Linear", function() { return Linear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Cubic", function() { return Cubic; });
/* harmony import */ var bezier_easing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bezier-easing */ "./node_modules/bezier-easing/src/index.js");
/* harmony import */ var bezier_easing__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(bezier_easing__WEBPACK_IMPORTED_MODULE_0__);


class Hold {
	getEasedMix(mix) {
		return 0;
	}
}

Hold.instance = new Hold();

class Linear {
	getEasedMix(mix) {
		return mix;
	}
}

Linear.instance = new Linear();

class Cubic {
	constructor(x1, y1, x2, y2) {
		this._Bezier = bezier_easing__WEBPACK_IMPORTED_MODULE_0___default()(x1, y1, x2, y2);
	}

	getEasedMix(mix) {
		return this._Bezier(mix);
	}
}

/***/ }),

/***/ "./source/JellyComponent.js":
/*!**********************************!*\
  !*** ./source/JellyComponent.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return JellyComponent; });
/* harmony import */ var _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorComponent.js */ "./source/ActorComponent.js");
/* harmony import */ var _ActorJellyBone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActorJellyBone.js */ "./source/ActorJellyBone.js");
/* harmony import */ var _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActorBoneBase.js */ "./source/ActorBoneBase.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");





// https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
const JellyMax = 16;
const OptimalDistance = 4 * (Math.sqrt(2) - 1) / 3;
const CurveConstant = OptimalDistance * Math.sqrt(2) * 0.5;

function ForwardDiffBezier(c0, c1, c2, c3, points, count, offset) {
	let f = count;

	const p0 = c0;

	const p1 = 3.0 * (c1 - c0) / f;

	f *= count;
	const p2 = 3.0 * (c0 - 2.0 * c1 + c2) / f;

	f *= count;
	const p3 = (c3 - c0 + 3.0 * (c1 - c2)) / f;

	c0 = p0;
	c1 = p1 + p2 + p3;
	c2 = 2 * p2 + 6 * p3;
	c3 = 6 * p3;

	for (let a = 0; a <= count; a++) {
		points[a][offset] = c0;
		c0 += c1;
		c1 += c2;
		c2 += c3;
	}
}

function NormalizeCurve(curve, numSegments) {
	const points = [];
	const curvePointCount = curve.length;
	const distances = new Float32Array(curvePointCount);
	distances[0] = 0;
	for (let i = 0; i < curvePointCount - 1; i++) {
		const p1 = curve[i];
		const p2 = curve[i + 1];
		distances[i + 1] = distances[i] + gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].distance(p1, p2);
	}
	const totalDistance = distances[curvePointCount - 1];

	const segmentLength = totalDistance / numSegments;
	let pointIndex = 1;
	for (let i = 1; i <= numSegments; i++) {
		const distance = segmentLength * i;

		while (pointIndex < curvePointCount - 1 && distances[pointIndex] < distance) {
			pointIndex++;
		}

		const d = distances[pointIndex];
		const lastCurveSegmentLength = d - distances[pointIndex - 1];
		const remainderOfDesired = d - distance;
		const ratio = remainderOfDesired / lastCurveSegmentLength;
		const iratio = 1.0 - ratio;

		const p1 = curve[pointIndex - 1];
		const p2 = curve[pointIndex];
		points.push([p1[0] * ratio + p2[0] * iratio, p1[1] * ratio + p2[1] * iratio]);
	}

	return points;
}

const EPSILON = 0.001; // Intentionally aggressive.

function FuzzyEquals(a, b) {
	const a0 = a[0],
	      a1 = a[1];
	const b0 = b[0],
	      b1 = b[1];
	return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}

class JellyComponent extends _ActorComponent_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._EaseIn = 0.0;
		this._EaseOut = 0.0;
		this._ScaleIn = 0.0;
		this._ScaleOut = 0.0;
		this._InTargetIdx = 0;
		this._OutTargetIdx = 0;
		this._InTarget = null;
		this._OutTarget = null;

		this._Bones = [];
		this._InPoint = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create();
		this._InDirection = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create();
		this._OutPoint = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create();
		this._OutDirection = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create();
	}

	makeInstance(resetActor) {
		const node = new JellyComponent();
		node.copy(this, resetActor);
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._EaseIn = node._EaseIn;
		this._EaseOut = node._EaseOut;
		this._ScaleIn = node._ScaleIn;
		this._ScaleOut = node._ScaleOut;
		this._InTargetIdx = node._InTargetIdx;
		this._OutTargetIdx = node._OutTargetIdx;
	}

	resolveComponentIndices(components) {
		super.resolveComponentIndices(components);

		if (this._InTargetIdx !== 0) {
			this._InTarget = components[this._InTargetIdx];
		}
		if (this._OutTargetIdx !== 0) {
			this._OutTarget = components[this._OutTargetIdx];
		}

		// Add dependencies.
		const { _Actor: actor, _Parent: bone } = this;
		let dependencyConstraints = [];
		if (bone) {
			actor.addDependency(this, bone);
			dependencyConstraints = dependencyConstraints.concat(Array.from(bone.allConstraints));
			let firstBone = bone.firstBone;
			if (firstBone) {
				actor.addDependency(this, firstBone);
				dependencyConstraints = dependencyConstraints.concat(Array.from(firstBone.allConstraints));

				// If we don't have an out target and the child jelly does have an in target
				// we are dependent on that target's position.
				if (!this.outTarget && firstBone.jelly && firstBone.jelly.inTarget) {
					actor.addDependency(this, firstBone.jelly.inTarget);
					dependencyConstraints = dependencyConstraints.concat(Array.from(firstBone.jelly.inTarget.allConstraints));
				}
			}
			let parentBone = bone.parent instanceof _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_2__["default"] && bone.parent;
			let parentBoneJelly = parentBone && parentBone.jelly;
			if (parentBoneJelly && parentBoneJelly.outTarget) {
				actor.addDependency(this, parentBoneJelly.outTarget);
				dependencyConstraints = dependencyConstraints.concat(Array.from(parentBoneJelly.outTarget.allConstraints));
			}
		}

		if (this._InTarget) {
			actor.addDependency(this, this._InTarget);
			dependencyConstraints = dependencyConstraints.concat(Array.from(this._InTarget.allConstraints));
		}
		if (this._OutTarget) {
			actor.addDependency(this, this._OutTarget);
			dependencyConstraints = dependencyConstraints.concat(Array.from(this._OutTarget.allConstraints));
		}

		dependencyConstraints = new Set(dependencyConstraints);

		for (const constraint of dependencyConstraints) {
			actor.addDependency(this, constraint);
		}
	}

	completeResolve() {
		super.completeResolve();

		const { _Actor: actor, _Parent: bone } = this;
		bone._Jelly = this;

		// Get jellies.
		const children = bone._Children;
		if (!children) {
			return;
		}
		for (const child of children) {
			if (child.constructor === _ActorJellyBone_js__WEBPACK_IMPORTED_MODULE_1__["default"]) {
				this._Bones.push(child);
				actor.addDependency(child, this);
			}
		}
	}

	updateJellies() {
		const bone = this._Parent;
		// We are in local bone space.
		const tipPosition = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), bone._Length, 0.0);
		const jc = this._Cache;

		const jellies = this._Bones;
		if (!jellies) {
			return;
		}

		if (jc && FuzzyEquals(jc.tip, tipPosition) && FuzzyEquals(jc.out, this._OutPoint) && FuzzyEquals(jc.in, this._InPoint) && jc.sin === this._ScaleIn && jc.sout === this._ScaleOut) {
			return;
		}

		this._Cache = {
			tip: tipPosition,
			out: gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].clone(this._OutPoint),
			in: gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].clone(this._InPoint),
			sin: this._ScaleIn,
			sout: this._ScaleOut
		};

		const q0 = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create();
		const q1 = this._InPoint;
		const q2 = this._OutPoint;
		const q3 = tipPosition;

		const subdivisions = JellyMax;
		const points = [];
		for (let i = 0; i <= subdivisions; i++) {
			points.push(new Float32Array(2));
		}

		ForwardDiffBezier(q0[0], q1[0], q2[0], q3[0], points, subdivisions, 0);
		ForwardDiffBezier(q0[1], q1[1], q2[1], q3[1], points, subdivisions, 1);

		const normalizedPoints = NormalizeCurve(points, jellies.length);

		let lastPoint = points[0];

		let scale = this._ScaleIn;
		const scaleInc = (this._ScaleOut - this._ScaleIn) / (jellies.length - 1);
		for (let i = 0; i < normalizedPoints.length; i++) {
			const jelly = jellies[i];
			const p = normalizedPoints[i];

			// We could set these by component and allow the mark to happen only if things have changed
			// but it's really likely that we have to mark dirty here, so might as well optimize the general case.
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].copy(jelly._Translation, lastPoint);
			jelly._Length = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].distance(p, lastPoint);
			jelly._Scale[1] = scale;
			scale += scaleInc;

			const diff = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), p, lastPoint);
			jelly._Rotation = Math.atan2(diff[1], diff[0]);
			jelly.markTransformDirty();
			lastPoint = p;
		}
	}

	get tipPosition() {
		const bone = this._Parent;
		return gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), bone._Length, 0.0);
	}

	update(dirt) {
		const bone = this._Parent;

		const parentBone = bone.parent instanceof _ActorBoneBase_js__WEBPACK_IMPORTED_MODULE_2__["default"] && bone.parent;
		const parentBoneJelly = parentBone && parentBone.jelly;
		const inverseWorld = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["mat2d"].invert(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["mat2d"].create(), bone.worldTransform);
		if (!inverseWorld) {
			console.warn("Failed to invert transform space", bone.worldTransform);
			return;
		}

		if (this._InTarget) {
			const translation = this._InTarget.worldTranslation;
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2d(this._InPoint, translation, inverseWorld);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].normalize(this._InDirection, this._InPoint);
		} else if (parentBone) {
			if (parentBone._FirstBone === bone && parentBoneJelly && parentBoneJelly._OutTarget) {
				const translation = parentBoneJelly._OutTarget.worldTranslation;
				const localParentOut = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2d(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), translation, inverseWorld);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].normalize(localParentOut, localParentOut);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].negate(this._InDirection, localParentOut);
			} else {
				const d1 = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), 1, 0);
				const d2 = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), 1, 0);

				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(d1, d1, parentBone.worldTransform);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(d2, d2, bone.worldTransform);

				const sum = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].add(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), d1, d2);
				const localIn = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(this._InDirection, sum, inverseWorld);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].normalize(localIn, localIn);
			}
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].scale(this._InPoint, this._InDirection, this._EaseIn * bone._Length * CurveConstant);
		} else {
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(this._InDirection, 1, 0);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(this._InPoint, this._EaseIn * bone._Length * CurveConstant, 0);
		}

		if (this._OutTarget) {
			const translation = this._OutTarget.worldTranslation;
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2d(this._OutPoint, translation, inverseWorld);
			const tip = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), bone._Length, 0.0);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].subtract(this._OutDirection, this._OutPoint, tip);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].normalize(this._OutDirection, this._OutDirection);
		} else if (bone._FirstBone) {
			const firstBone = bone._FirstBone;
			const firstBoneJelly = firstBone.jelly;
			if (firstBoneJelly && firstBoneJelly._InTarget) {
				const translation = firstBoneJelly._InTarget.worldTranslation;
				const worldChildInDir = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].subtract(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), firstBone.worldTranslation, translation);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(this._OutDirection, worldChildInDir, inverseWorld);
			} else {
				const d1 = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), 1, 0);
				const d2 = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), 1, 0);

				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(d1, d1, firstBone.worldTransform);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(d2, d2, bone.worldTransform);

				const sum = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].add(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), d1, d2);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].negate(sum, sum);
				gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].transformMat2(this._OutDirection, sum, inverseWorld);
			}
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].normalize(this._OutDirection, this._OutDirection);
			const scaledOut = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].scale(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), this._OutDirection, this._EaseOut * bone._Length * CurveConstant);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(this._OutPoint, bone._Length, 0.0);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].add(this._OutPoint, this._OutPoint, scaledOut);
		} else {
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(this._OutDirection, -1, 0);

			const scaledOut = gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].scale(gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].create(), this._OutDirection, this._EaseOut * bone._Length * CurveConstant);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].set(this._OutPoint, bone._Length, 0.0);
			gl_matrix__WEBPACK_IMPORTED_MODULE_3__["vec2"].add(this._OutPoint, this._OutPoint, scaledOut);
		}

		this.updateJellies();
	}
}

/***/ }),

/***/ "./source/KeyFrame.js":
/*!****************************!*\
  !*** ./source/KeyFrame.js ***!
  \****************************/
/*! exports provided: KeyFrame */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KeyFrame", function() { return KeyFrame; });
/* harmony import */ var _BezierAnimationCurve_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BezierAnimationCurve.js */ "./source/BezierAnimationCurve.js");


const MAX_FACTOR = 0.99999;
const MIN_FACTOR = 1.0 - MAX_FACTOR;

let TempBuffer = new Float32Array(32);

function InterpolateVertexBuffer(buffer, from, to, mix) {
	if (buffer.length < to.length) {
		buffer = new Float32Array(to.length);
	}

	const mixi = 1.0 - mix;
	const l = to.length;

	for (let i = 0; i < l; i++) {
		buffer[i] = from[i] * mixi + to[i] * mix;
	}

	return buffer;
}

class KeyFrame {
	constructor() {
		this._Value = 0.0;
		this._Time = 0.0;
		this._Type = 0;
		this._Interpolator = null;
	}

	setNext(nxt) {
		if (this._Value.constructor === Float32Array) {
			this.interpolate = KeyFrame.prototype.interpolateVertexBuffer;
		} else {
			this.interpolate = KeyFrame.prototype.interpolateFloat;
		}
	}

	interpolateVertexBuffer(mix, nxt) {
		return TempBuffer = InterpolateVertexBuffer(TempBuffer, this._Value, nxt._Value, mix);
	}

	interpolateFloat(mix, nxt) {
		return this._Value * (1.0 - mix) + nxt._Value * mix;
	}
}

KeyFrame.Type = {
	Hold: 0,
	Linear: 1,
	Mirrored: 2,
	Asymmetric: 3,
	Disconnected: 4,
	Progression: 5
};

/***/ }),

/***/ "./source/NestedActorAsset.js":
/*!************************************!*\
  !*** ./source/NestedActorAsset.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return NestedActorAsset; });
class NestedActorAsset {
	constructor(name, id) {
		this._Id = id;
		this._Name = name;
		this._Actor = null;
	}

	get id() {
		return this._Id;
	}

	get name() {
		return this._Name;
	}

	get actor() {
		return this._Actor;
	}
}

/***/ }),

/***/ "./source/NestedActorNode.js":
/*!***********************************!*\
  !*** ./source/NestedActorNode.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return NestedActorNode; });
/* harmony import */ var _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActorNode.js */ "./source/ActorNode.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");



class NestedActorNode extends _ActorNode_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor() {
		super();

		this._DrawOrder = 0;
		this._Asset = null;
		this._Instance = null;
		this._Actor = null;
	}

	makeInstance(resetActor) {
		const node = new NestedActorNode();
		node.copy(this, resetActor);

		if (this._Asset.actor) {
			node._Actor = this._Asset.actor.makeInstance();
		}
		return node;
	}

	copy(node, resetActor) {
		super.copy(node, resetActor);
		this._Asset = node._Asset;
		this._DrawOrder = node._DrawOrder;
	}

	initialize(actor, graphics) {
		if (this._Actor) {
			this._Actor.initialize(graphics);
		}
	}

	updateWorldTransform() {
		super.updateWorldTransform();
		if (this._Actor) {
			this._Actor.root.overrideWorldTransform(this._WorldTransform);
		}
	}

	computeAABB() {
		if (this._Actor) {
			return this._Actor.computeAABB();
		}
		return null;
	}

	draw(graphics) {
		if (this._Actor) {
			this._Actor.draw(graphics);
		}
	}

	advance(seconds) {
		super.advance(seconds);
		if (this._Actor) {
			this._Actor.advance(seconds);
		}
	}
}

/***/ }),

/***/ "./source/PathMatrix.js":
/*!******************************!*\
  !*** ./source/PathMatrix.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return make; });
/* harmony import */ var _svgdotjs_svg_js_dist_svg_node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @svgdotjs/svg.js/dist/svg.node.js */ "./node_modules/@svgdotjs/svg.js/dist/svg.node.js");
/* harmony import */ var _svgdotjs_svg_js_dist_svg_node_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_svgdotjs_svg_js_dist_svg_node_js__WEBPACK_IMPORTED_MODULE_0__);


function make(transform) {
    const matrix = new _svgdotjs_svg_js_dist_svg_node_js__WEBPACK_IMPORTED_MODULE_0__["Matrix"]();
    matrix.a = transform[0];
    matrix.b = transform[1];
    matrix.c = transform[2];
    matrix.d = transform[3];
    matrix.e = transform[4];
    matrix.f = transform[5];

    return matrix;
}

/***/ }),

/***/ "./source/PathPoint.js":
/*!*****************************!*\
  !*** ./source/PathPoint.js ***!
  \*****************************/
/*! exports provided: PointType, PathPoint, StraightPathPoint, CubicPathPoint */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointType", function() { return PointType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PathPoint", function() { return PathPoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StraightPathPoint", function() { return StraightPathPoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CubicPathPoint", function() { return CubicPathPoint; });
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/lib/gl-matrix.js");


const TempMatrix = new Float32Array(6);

class PointType {
	static get Straight() {
		return 0;
	}

	static get Mirror() {
		return 1;
	}

	static get Disconnected() {
		return 2;
	}

	static get Asymmetric() {
		return 3;
	}
}

class PathPoint {
	constructor() {
		this._PointType = PointType.Straight;
		this._Translation = gl_matrix__WEBPACK_IMPORTED_MODULE_0__["vec2"].create();
		this._Weights = null;
	}

	get pointType() {
		return this._PointType;
	}

	get translation() {
		return this._Translation;
	}

	makeInstance() {
		return null;
	}

	copy(from) {
		this._PointType = from._PointType;
		this._Weights = from._Weights;
		gl_matrix__WEBPACK_IMPORTED_MODULE_0__["vec2"].copy(this._Translation, from._Translation);
	}
}

class StraightPathPoint extends PathPoint {
	constructor() {
		super();
		this._Radius = 0;
	}

	get radius() {
		return this._Radius;
	}

	makeInstance() {
		const node = new StraightPathPoint();
		StraightPathPoint.prototype.copy.call(node, this);
		return node;
	}

	copy(from) {
		super.copy(from);
		this._Radius = from._Radius;
	}

	skin(world, bones) {
		let { _Weights: weights, translation, pointType, radius } = this;

		let px = world[0] * translation[0] + world[2] * translation[1] + world[4];
		let py = world[1] * translation[0] + world[3] * translation[1] + world[5];
		const point = { pointType, o: this, radius };

		const fm = TempMatrix;
		fm.fill(0);

		for (let i = 0; i < 4; i++) {
			const boneIndex = weights[i];
			const weight = weights[i + 4];
			if (weight > 0) {
				let bb = boneIndex * 6;
				for (let j = 0; j < 6; j++) {
					fm[j] += bones[bb + j] * weight;
				}
			}
		}

		point.translation = new Float32Array([fm[0] * px + fm[2] * py + fm[4], fm[1] * px + fm[3] * py + fm[5]]);

		return point;
	}
}

class CubicPathPoint extends PathPoint {
	constructor() {
		super();
		this._In = gl_matrix__WEBPACK_IMPORTED_MODULE_0__["vec2"].create();
		this._Out = gl_matrix__WEBPACK_IMPORTED_MODULE_0__["vec2"].create();
	}

	get in() {
		return this._In;
	}

	get out() {
		return this._Out;
	}

	makeInstance() {
		const node = new CubicPathPoint();
		CubicPathPoint.prototype.copy.call(node, this);
		return node;
	}

	copy(from) {
		super.copy(from);
		gl_matrix__WEBPACK_IMPORTED_MODULE_0__["vec2"].copy(this._In, from._In);
		gl_matrix__WEBPACK_IMPORTED_MODULE_0__["vec2"].copy(this._Out, from._Out);
	}

	skin(world, bones) {
		let { _Weights: weights, translation, pointType, out: op, in: ip } = this;

		let px = world[0] * translation[0] + world[2] * translation[1] + world[4];
		let py = world[1] * translation[0] + world[3] * translation[1] + world[5];
		const point = { pointType, o: this };

		const fm = TempMatrix;
		fm.fill(0);

		for (let i = 0; i < 4; i++) {
			const boneIndex = weights[i];
			const weight = weights[i + 4];
			if (weight > 0) {
				let bb = boneIndex * 6;
				for (let j = 0; j < 6; j++) {
					fm[j] += bones[bb + j] * weight;
				}
			}
		}

		point.translation = new Float32Array([fm[0] * px + fm[2] * py + fm[4], fm[1] * px + fm[3] * py + fm[5]]);

		px = world[0] * ip[0] + world[2] * ip[1] + world[4];
		py = world[1] * ip[0] + world[3] * ip[1] + world[5];
		fm.fill(0);
		for (let i = 8; i < 12; i++) {
			const boneIndex = weights[i];
			const weight = weights[i + 4];
			if (weight > 0) {
				let bb = boneIndex * 6;
				for (let j = 0; j < 6; j++) {
					fm[j] += bones[bb + j] * weight;
				}
			}
		}

		point.in = new Float32Array([fm[0] * px + fm[2] * py + fm[4], fm[1] * px + fm[3] * py + fm[5]]);

		px = world[0] * op[0] + world[2] * op[1] + world[4];
		py = world[1] * op[0] + world[3] * op[1] + world[5];
		fm.fill(0);
		for (let i = 16; i < 20; i++) {
			const boneIndex = weights[i];
			const weight = weights[i + 4];
			if (weight > 0) {
				let bb = boneIndex * 6;
				for (let j = 0; j < 6; j++) {
					fm[j] += bones[bb + j] * weight;
				}
			}
		}

		point.out = new Float32Array([fm[0] * px + fm[2] * py + fm[4], fm[1] * px + fm[3] * py + fm[5]]);

		return point;
	}
}

/***/ }),

/***/ "./source/Readers/BinaryReader.js":
/*!****************************************!*\
  !*** ./source/Readers/BinaryReader.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BinaryReader; });
/* harmony import */ var _StreamReader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./StreamReader.js */ "./source/Readers/StreamReader.js");


class BinaryReader extends _StreamReader_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(uint8Array) {
		super();
		this.isBigEndian = function () {
			const b = new ArrayBuffer(4);
			const a = new Uint32Array(b);
			const c = new Uint8Array(b);
			a[0] = 0xdeadbeef;
			return c[0] == 0xde;
		}();

		this.raw = uint8Array;
		this.dataView = new DataView(uint8Array.buffer);
		this.readIndex = 0;
	}

	readFloat32() {
		const v = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	readFloat32ArrayOffset(ar, length, offset) {
		if (!offset) {
			offset = 0;
		}
		if (!length) {
			length = ar.length;
		}
		let end = offset + length;
		for (let i = offset; i < end; i++) {
			ar[i] = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
			this.readIndex += 4;
		}
		return ar;
	}

	readFloat32Array(ar) {
		for (let i = 0; i < ar.length; i++) {
			ar[i] = this.dataView.getFloat32(this.readIndex, !this.isBigEndian);
			this.readIndex += 4;
		}
		return ar;
	}

	readFloat64() {
		const v = this.dataView.getFloat64(this.readIndex, !this.isBigEndian);
		this.readIndex += 8;
		return v;
	}

	readUint8() {
		return this.raw[this.readIndex++];
	}

	isEOF() {
		return this.readIndex >= this.raw.length;
	}

	readInt8() {
		const v = this.dataView.getInt8(this.readIndex);
		this.readIndex += 1;
		return v;
	}

	readUint16() {
		const v = this.dataView.getUint16(this.readIndex, !this.isBigEndian);
		this.readIndex += 2;
		return v;
	}

	readUint16Array(ar, length) {
		if (!length) {
			length = ar.length;
		}
		for (let i = 0; i < length; i++) {
			ar[i] = this.dataView.getUint16(this.readIndex, !this.isBigEndian);
			this.readIndex += 2;
		}
		return ar;
	}

	readInt16() {
		const v = this.dataView.getInt16(this.readIndex, !this.isBigEndian);
		this.readIndex += 2;
		return v;
	}

	readUint32() {
		const v = this.dataView.getUint32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	readInt32() {
		const v = this.dataView.getInt32(this.readIndex, !this.isBigEndian);
		this.readIndex += 4;
		return v;
	}

	byteArrayToString(bytes) {
		let out = [],
		    pos = 0,
		    c = 0;
		while (pos < bytes.length) {
			let c1 = bytes[pos++];
			if (c1 < 128) {
				out[c++] = String.fromCharCode(c1);
			} else if (c1 > 191 && c1 < 224) {
				let c2 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
			} else if (c1 > 239 && c1 < 365) {
				// Surrogate Pair
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				let c4 = bytes[pos++];
				let u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
				out[c++] = String.fromCharCode(0xD800 + (u >> 10));
				out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
			} else {
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			}
		}
		return out.join("");
	}

	readString() {
		const length = this.readUint32();
		const ua = new Uint8Array(length);
		for (let i = 0; i < length; i++) {
			ua[i] = this.raw[this.readIndex++];
		}
		return this.byteArrayToString(ua);
	}

	readRaw(to, length) {
		for (let i = 0; i < length; i++) {
			to[i] = this.raw[this.readIndex++];
		}
	}

	readBool() {
		return this.readUint8() === 1;
	}

	readBlockType() {
		return this.readUint8();
	}

	readImage(isOOB, cb) {
		if (isOOB) {
			const image = this.readString();
			const req = new XMLHttpRequest();
			req.open("GET", image, true);
			req.responseType = "blob";

			req.onload = function () {
				const blob = this.response;
				cb(blob);
			};
			req.send();
		} else {
			const size = this.readUint32();
			const atlasData = new Uint8Array(size);
			this.readRaw(atlasData, atlasData.length);
			const blob = new Blob([atlasData], { type: "image/png" });

			cb(blob);
		}
	}

	readId(label) {
		return this.readUint16();
	}

	readUint8Length() {
		return this.readUint8();
	}

	readUint16Length() {
		return this.readUint16();
	}

	readUint32Length() {
		return this.readUint32();
	}

	get containerType() {
		return "bin";
	}
}

BinaryReader.alignment = 1024;

/***/ }),

/***/ "./source/Readers/JSONReader.js":
/*!**************************************!*\
  !*** ./source/Readers/JSONReader.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return JSONReader; });
/* harmony import */ var _StreamReader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./StreamReader.js */ "./source/Readers/StreamReader.js");


class JSONReader extends _StreamReader_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
	constructor(object) {
		super();
		this._readObject = object["container"];
		this._context = [this._readObject];
	}

	readProp(label) {
		const head = this._last;
		if (head.constructor === Object) {
			const prop = head[label];
			delete head[label];
			return prop;
		} else if (head.constructor === Array) {
			return head.shift();
		}
	}

	readFloat32(label) {
		return this.readProp(label);
	}

	// Reads the array into ar
	readFloat32Array(ar, label) {
		return this.readArray(ar, label);
	}

	readFloat32ArrayOffset(ar, length, offset, label) {
		return this.readFloat32Array(ar, label);
	}

	readArray(ar, label) {
		const array = this.readProp(label);
		if (array) // I think there's a bug here.
			{
				for (let i = 0; i < ar.length; i++) {
					ar[i] = array[i];
				}
			}

		return ar;
	}

	readFloat64(label) {
		return this.readProp(label);
	}

	readUint8(label) {
		return this.readProp(label);
	}

	readUint8Length() {
		return this._readLength();
	}

	isEOF() {
		return this._context.length <= 1 && Object.keys(this._readObject).length === 0;
	}

	readInt8(label) {
		return this.readProp(label);
	}

	readUint16(label) {
		return this.readProp(label);
	}

	readUint16Array(ar, label) {
		return this.readArray(ar, label);
	}

	readInt16(label) {
		return this.readProp(label);
	}

	readUint16Length() {
		return this._readLength();
	}

	readUint32(label) {
		return this.readProp(label);
	}

	// This implementation doesn't need this, as it would read a wrong value.
	// readUint32Length(label)
	// {
	//     return this.readProp(label);
	// }

	byteArrayToString(bytes) {
		let out = [],
		    pos = 0,
		    c = 0;
		while (pos < bytes.length) {
			let c1 = bytes[pos++];
			if (c1 < 128) {
				out[c++] = String.fromCharCode(c1);
			} else if (c1 > 191 && c1 < 224) {
				let c2 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
			} else if (c1 > 239 && c1 < 365) {
				// Surrogate Pair
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				let c4 = bytes[pos++];
				let u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
				out[c++] = String.fromCharCode(0xD800 + (u >> 10));
				out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
			} else {
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			}
		}
		return out.join("");
	}

	readString(label) {
		return this.readProp(label);
	}

	readBool(label) {
		return this.readProp(label);
	}

	readRaw(obj, length, label) {
		const context = this._last;
		const next = this._peekNext();
		obj["container"] = next;
		// Remove the block from here.
		if (context.constructor === Object) {
			delete context[this._nextKey];
		} else if (context.constructor === Array) {
			context.shift();
		}
	}

	readBlockType(block) {
		const next = this._peekNext();
		let bType;
		if (next.constructor === Object) {
			const last = this._last;
			let nType;
			if (last.constructor === Object) {
				nType = this._nextKey;
			} else if (last.constructor === Array) {
				// Objects are serialized with "type" property.
				nType = next["type"];
			}
			bType = block.fromString(nType) || nType;
		} else if (next.constructor === Array) {
			// Arrays are serialized as "type": [Array].
			const nKey = this._nextKey;
			bType = block.fromString(nKey) || nKey;
		}
		return bType;
	}

	readImage(isOOB, cb) {
		const image = this.readString();
		if (isOOB) {
			const req = new XMLHttpRequest();
			req.open("GET", image, true);
			req.responseType = "blob";

			req.onload = function () {
				const blob = this.response;
				cb(blob);
			};
			req.send();
		} else {
			cb(image);
		}
	}

	readId(label) {
		const val = this.readUint16(label);
		return val !== undefined ? val + 1 : 0;
	}

	openArray(label) {
		const array = this.readProp(label);
		this._context.unshift(array);
	}

	closeArray() {
		this._context.shift();
	}

	openObject(label) {
		const o = this.readProp(label);
		this._context.unshift(o);
	}

	closeObject() {
		this._context.shift();
	}

	get containerType() {
		return "json";
	}

	_peekNext() {
		const stream = this._last;
		let next;
		if (stream.constructor === Object) {
			next = stream[this._nextKey];
		} else if (stream.constructor === Array) {
			next = stream[0];
		}
		return next;
	}

	get _nextKey() {
		return Object.keys(this._last)[0];
	}

	_readLength() {
		const context = this._last;
		if (context.constructor === Array) {
			return context.length;
		} else if (context.constructor === Object) {
			return Object.keys(context).length;
		}
	}

	get _last() {
		return this._context[0];
	}
}

/***/ }),

/***/ "./source/Readers/StreamReader.js":
/*!****************************************!*\
  !*** ./source/Readers/StreamReader.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return StreamReader; });
class StreamReader {
    constructor() {}
    readFloat32() {}
    readFloat32Array(ar, length, offset) {}
    readFloat32ArrayOffset(ar, length, offset) {}
    readFloat64() {}
    isEOF() {}
    readInt8() {}
    readUint8() {}
    readUint8Length() {}
    readUint16() {}
    readUint16Array(ar, length) {}
    readUint16Length() {}
    readInt16() {}
    readUint32() {}
    readUint32Length() {}
    readInt32() {}
    byteArrayToString(bytes) {}
    readString() {}
    readRaw(to, length) {}

    readBool() {}
    readBlockType() {}
    readImage(isOOB, cb) {}

    readId(label) {}

    openArray(label) {}
    closeArray() {}
    openObject(label) {}
    closeObject() {}

    get containerType() {
        return "stream";
    }
}

/***/ }),

/***/ "./source/TransformSpace.js":
/*!**********************************!*\
  !*** ./source/TransformSpace.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const TransformSpace = {
	Local: 0,
	World: 1
};

/* harmony default export */ __webpack_exports__["default"] = (TransformSpace);

/***/ })

/******/ });
//# sourceMappingURL=example.build.js.map