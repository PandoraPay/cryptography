const {describe} = require('kernel').tests;

const TestsAddressGenerator = require( "./address/tests-address-generator")
const TestsAddressValidator = require("./address/tests-address-validator")

/**
 *
 * REDIS BENCHMARK
 *
 */

module.exports = async function run () {

    await TestsAddressGenerator();
    await TestsAddressValidator();

}