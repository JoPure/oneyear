/**
 * Created by jo.chan on 2017/9/14.
 */

var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var SentryPlugin = require('webpack-sentry-plugin');
var ImageminPlugin = require('imagemin-webpack-plugin').default;

//定义了一些文件夹的路径
var path = require('path');
var ROOT_PATH = path.resolve(__dirname);
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');

var myModule = {
    loaders: [
        {test: /\.js?$/, loader: 'babel-loader?presets[]=es2015,presets[]=react'},
        {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader", {
                // publicPath: '../'
            })
        },
        {// html
            test: /\.(htm|html)$/,
            loader: 'html-withimg-loader'
        },
        {
            test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
            exclude: '/icon/',
            loader: 'url-loader?limit=8192&name=img/[name].[hash:8].[ext]'
        }
    ]
};

module.exports = [
    {
        //项目的文件夹 可以直接用文件夹名称 默认会找index.js 也可以确定是哪个文件名字
        entry: './entry.js',
        //输出的文件名 合并以后的js会命名为bundle.js
        output: {
            path: BUILD_PATH,
            filename: './js/bundle.[hash:8].js'
        },
        devtool: '#source-map',
        target: 'web',
        plugins: [
            new HtmlwebpackPlugin({
                template: 'index.html',
                filename: 'index.html'
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': '"production"'
                }
            }),

            new ExtractTextPlugin("[name].[hash:8].css", {allChunks: true}),

            new webpack.optimize.UglifyJsPlugin({ // js、css都会压缩
                mangle: {
                    except: ['$super', '$', 'exports', 'require', 'module', '_', '*.swf']
                },
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                }
            }),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            }),
            new ImageminPlugin({
                pngquant: {
                    quality: '70'
                }
            }),
            new SentryPlugin({
                organization: 'sentry',
                project: '3ds201711-d3',
                apiKey: 'e472e7df133243e4b696e8de618fa6e04d154dd110724f3d89a08a4b46187739',
                release: '2.3.3',
                baseSentryURL: 'http://sentry.pocketgamesol.com/api/0/'
            })
        ],
        externals: {
            jquery: 'window.$'
        },
        module: myModule
    }
];
