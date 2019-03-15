const path = require('path');

module.exports = {
    target: 'node',
    mode: 'development',
    entry: {
        app: ['./server2.js']
    },
    devtool: 'inline-source-map',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, './')
    },
    module: {
        rules: [
            {
                test: '/\.js$/',
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ["@babel/preset-env"]
                }
            }
        ]
    }
}