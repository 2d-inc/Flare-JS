const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "build/");
const APP_DIR = path.resolve(__dirname, "source/");
const EXAMPLE_DIR = path.resolve(__dirname, "example/");

const config =
{
	mode: "development",
	target: "web",
	devtool: "source-map",
	entry:
	{
		Flare: EXAMPLE_DIR + "/example.js"
	},
	output:
	{
		path: EXAMPLE_DIR,
		filename: "example.build.js",
	},
	module:
	{
		rules :
		[
			{
				test : /\.js?/,
				include : APP_DIR,
				use: { loader: "babel-loader" }
			}
		]
	}
};

module.exports = config;