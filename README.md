## Flare-JS
Javascript ES6 runtime with Canvas rendering.

### CanvasKit vs Canvas
There are currently two branches: master with CanvasKit rendering (Skia via WebAssembly) and context2d with the standard CanvasRenderingContext2D. The context2d branch is deprecated.

## Building
Use NPM to get the dependencies and then build with webpack:

```
npm install
npm start -- --watch
```

## Flare-JS Example

There are a few steps to start rendering a Flare file:
1. Create a `canvas` element in HTML
2. Instantiate and initialize the `Graphics` object with the `canvas` reference
3. Start the render loop with `window.requestAnimationFrame()`
4. Load an Actor from file with `Flare.ActorLoader.load(fileLocation, callback)`
5. Initialize and instantiate the `Actor` - that will initialize the `ActorArtboard`s for the loaded Flare file: 
    - First `Actor.initialize()`
    - then `actor.makeInstance()`
6. Create a new `AnimationInstance(actor, animation)`
7. Advance the `AnimationInstance` within the `window.requestAnimationFrame` callback: 
    - increase its time value with the provided setter `animationInstance.time`
    - then apply it with `animationInstance.apply()`
8. Advance the actor: `actor.advance(elapsed)`

### Running the Example

The [example folder](https://github.com/2d-inc/Flare-JS/blob/master/example) contains two files, `example.html` and `example.js`, with an example implementation on how to achieve this.

Use NPM to get the dependencies:
```
npm install gl-matrix
npm install canvaskit-wasm
```
The needed files will be in their respective `node_modules` folder:
`node_modules/gl-matrix/dist` and `node_modules/canvaskit-wasm/bin`.

Place these two files in the `/build` folder and then build with webpack.

Use a local web server such as [NGINX](https://www.nginx.com/) or [MAMP](https://www.mamp.info/en/) to expose the resources.

### example.html

This file contains the `canvas` element that we need to render the Flare file. It'll also load the necessary dependencies (i.e. `Flare-JS`, `gl-matrix`, `canvaskit`) and the example running script `example.js`.

The `<script>` tag will have implement the `onLoad()` callback for the `body` HTML Element: a `FlareExample` object is initialized with the `canvas` reference, and passed a callback function that'll load the Flare file from disk - `flareExample.load(filename, callback)`.

### example.js

This `js` file creates a `FlareExample` object. 
Its constructor initialized the `Graphics` object, starts the rendering loop and calls-back to the script.

The callback, in the HTML file will call `FlareExample.load(filename)` to load the file from disk. Once `Flare.ActorLoader` is done, its load callback will finish setting up the actor within the Example via `FlareExample.setActor()`.

`FlareExample.setActor` will perform the initialization and instantiation of the Artboards, and the Animation.

The render loop - that is `FlareExample.advance()` can now advance the Actor, the Animation and lastly draw to canvas via `FlareExample.Draw()`.

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## License
See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
