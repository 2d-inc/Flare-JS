const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "build/");
const APP_DIR = path.resolve(__dirname, "source/");

const config =
{
	mode: "development",
	target: "web",
	devtool: "source-map",
	node:
	{
		fs: "empty"
	},
	entry: 
	{
		Flare: APP_DIR + "/Flare.js"
	},
	output:
	{
		path: BUILD_DIR,
		filename: "Flare.min.js",
		library: "Flare",
		libraryTarget: "umd"
	},
	module:
	{
		rules :
		[
			{
				test : /\.js$/,
				use: [
					{ loader: "babel-loader"},
					{
						loader: "ifdef-loader",
						options: 
						{
							CanvasKitLocation: "embedded",
							"ifdef-verbose": true,       // add this for verbose output
							"ifdef-triple-slash": true 
						}
					}
				]
			},
			{
				test: /\.wasm$/,
				type: "javascript/auto",
				use: { loader: "arraybuffer-loader" }
			}
		]
	}
};

module.exports = config;