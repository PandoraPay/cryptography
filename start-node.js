/**
 * Load Library and run it
 */

require('kernel');

const library  = require("./build/output/build-node").default;

library.app.start();

module.exports = library;