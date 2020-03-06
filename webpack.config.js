const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const doiuse = require('doiuse')

const confGeneral = {
	mode: process.env.NODE_ENV,
	result: process.env.NODE_RESULT,
	devtool: process.env.NODE_ENV == 'development' ? 'source-map' : '',
	entry: './index.js',
	context: path.resolve(__dirname, 'src')
}

const confResolve = {
	alias: {
		ROOT: path.resolve(__dirname, 'src/'),
	}
}

const confOutput = {
	filename: 'assets/js/[name].bundle.js?[hash]',
	path: path.resolve(__dirname, 'dist'),
	chunkFilename: 'assets/js/[name].bundle.js?[hash]',
}

const getOptimization = (mode = confGeneral.mode) => {
	optimization = {}
	if(mode == "production") {
		optimization.minimizer = [
			new UglifyJsPlugin(
				{
					uglifyOptions: {
						mangle: true
					}
				}
			)
		]
	}
	return optimization
}

const getPlugins = (result = confGeneral.result) => {
	const plugins = [
		new HtmlWebpackPlugin({
			template: './index.pug',
			inject: 'body',
			hash: true,
		})
	]
	if(result == "build") {
		plugins.push(
			new CleanWebpackPlugin()
		)
		plugins.push(
			new MiniCssExtractPlugin(
				{
					filename: 'assets/style/[name].css?[hash]'
				}
			)
		)
	} else {
		plugins.push(
			new webpack.HotModuleReplacementPlugin()
		)
	}
	return plugins
}

const getCssRule = (mode = confGeneral.mode, result = confGeneral.result) => {
	const loaders = []
	if(result == "build") {
		loaders.push(MiniCssExtractPlugin.loader)
	} else {
		loaders.push('style-loader')
	}
	loaders.push('css-loader')
	loaders.push(
		{
			loader: 'postcss-loader',
			options: {
				plugins: function () {
					return [
						autoprefixer(),
					]
				}
			}
		}
	)
	if(mode == "development") {
		loaders.push(
			{
				loader: 'postcss-loader',
				options: {
					plugins: function () {
						return [
							doiuse({
								browsers:['> 2.5%', 'not dead'],
								ignoreFiles: ['**/normalize.css'],
							})
						]
					}
				}
			}
		)
	}
	return loaders
}

const getDevServer = (result = confGeneral.result, port = process.env.PORT) => {
	devServer = {}
	if(result == "server") {
		devServer.inline = true
		devServer.hot = true
		devServer.contentBase = 'dist'
		devServer.host = 'localhost'
		devServer.port = port
	}
	return devServer
}

const confPlugins = getPlugins()
const confOptimization = getOptimization()
const confDevServer = getDevServer()
const confModule = {
	rules: [
		{
			test: /\.js$/,
    		loader: 'babel-loader',
    		exclude: [
    			/node_modules/,
    		]
		},
		{
			test: /\.css$/,
			use: getCssRule(),
		},
		{
			test: /\.pug$/,
			loader: {
				loader: 'pug-loader',
				options: {
					pretty: process.env.NODE_ENV == 'development' ? true : false
				}
			},
		},
	]
}

const conf = {
	context: confGeneral.context,
	entry: confGeneral.entry,
	devtool: confGeneral.devtool,
	mode: confGeneral.mode,
	output: confOutput,
	module: confModule,
	resolve: confResolve,
	plugins: confPlugins,
	optimization: confOptimization,
	devServer: confDevServer
}

module.exports = conf