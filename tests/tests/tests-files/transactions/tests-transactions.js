const {describe} = require('kernel').tests;

const TestsSimpleTransactions = require( "./simple/tests-simple-transactions");

module.exports = async function run () {

    await TestsSimpleTransactions();

}