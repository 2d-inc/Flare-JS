const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "build/");
const APP_DIR = path.resolve(__dirname, "source/");

const config =
{
	mode: "development",
	target: "web",
	devtool: "source-map",
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
				test : /\.js?/,
				include : APP_DIR,
				use: { loader: "babel-loader" }
			}
		]
	}
};

module.exports = config;