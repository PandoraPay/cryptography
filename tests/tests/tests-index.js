import ArgvTest from "./argv/argv-test"

import TestsAddresses from "./tests-files/addresses/tests-addresses"
import TestTransactions from "./tests-files/transactions/tests-transactions"
import TestsCrypto from "./tests-files/crypto/tests-crypto"

import TestsTransactionsHelper from "./tests-files/transactions/tests-transactions-helper"

import SimpleChain from "src/chain/simple-chain"

export default {

    argvTests: ArgvTest,
    tests: async scope => {

        scope.logger.info(`Tests`, `Running Crypto tests`);

        if (!scope.simpleChain)
            scope.simpleChain = new SimpleChain(scope);

        scope.cryptography.testsTransactionsHelper = new TestsTransactionsHelper( scope );

        await TestsCrypto();
        await TestsAddresses();
        await TestTransactions();

    },

}
