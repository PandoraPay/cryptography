const {describe} = PandoraLibrary.tests;

const TestsSimpleTransactions = require( "./simple/tests-simple-transactions");

module.exports = async function run () {

    await TestsSimpleTransactions();

}