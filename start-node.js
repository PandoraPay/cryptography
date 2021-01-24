/**
 * Load Library and run it
 */

if ( typeof BROWSER === "undefined" )
    global.BROWSER = false;

require('kernel');

const library  = require("./index");

library.app.start();

module.exports = library;