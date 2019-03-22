const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'node',
    mode: 'development',
    entry: {
        app: ['./server2.js']
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './',
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, './'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: '/\.js$/',
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}