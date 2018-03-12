var webpack = require("webpack");
var path = require("path");

var BUILD_DIR = path.resolve(__dirname, "build/");
var APP_DIR = path.resolve(__dirname, "source/");

var config =
{
	entry: APP_DIR + "/Flare.js",
	output:
	{
		path: BUILD_DIR,
		filename: "Flare.min.js",
		library: "Flare",
		libraryTarget: "umd"
	},
	devtool:"source-map",
	module :
	{
	loaders :
	[
		{
			test : /\.js?/,
			include : APP_DIR,
			loader : "babel-loader"
		}
	]
	}
};

module.exports = config;