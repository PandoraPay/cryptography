const path = require('path');
const merge = require('webpack-merge');

const webpackConfig = require('webpack-config').webpackConfigNode;

module.exports = (env, argv, pathResolve) => {

    if (!pathResolve)
        pathResolve = p => path.resolve( __dirname + p);

    if (!webpackConfig) {
        console.error("webpackConfigNode was not set. Try to \n cd webpack-config \n npm link ");
        return;
    }

    return merge ( webpackConfig(env, argv, pathResolve), {

    });
};
