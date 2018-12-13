## Flare-JS
Javascript ES6 runtime with Canvas rendering.

## Building
Use NPM to get the dependencies and then build with webpack:

```
npm install
npm start -- --watch
```

## Usage
Take a look at example/example.html and example/example.js for how to initialize and use a Flare animation. We'll be providing more in-depth documentation soon.

### CanvasKit vs Canvas
There are currently two branches: master with Canvas 2d context as the renderer and CanvasKit with SKIA via WebAssembly. Going forward the CanvasKit branch will become the active one as it supports more advanced rendering operations which Flare will soon require.

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## License
See the [LICENSE](LICENSE) file for license rights and limitations (MIT).