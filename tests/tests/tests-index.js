const ArgvTest = require( "./argv/argv-test")

const TestsAddresses = require( "./tests-files/addresses/tests-addresses")
const TestsTransactions = require("./tests-files/transactions/tests-transactions")
const TestsCrypto = require("./tests-files/crypto/tests-crypto")

const TestsTransactionsHelper = require( "./tests-files/transactions/tests-transactions-helper")

const SimpleChain = require( "../../src/chain/simple-chain")


module.exports = {

    argvTests: ArgvTest,
    tests: async scope => {

        scope.logger.info(`Tests`, `Running Crypto tests`);

        if (!scope.simpleChain)
            scope.simpleChain = new SimpleChain(scope);

        scope.cryptography.testsTransactionsHelper = new TestsTransactionsHelper( scope );

        await TestsCrypto();
        await TestsAddresses();
        await TestsTransactions();

    },

}
