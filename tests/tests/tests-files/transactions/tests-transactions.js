const {describe} = global.kernel.tests;

import TestsSimpleTransactions from "./simple/tests-simple-transactions";
import TestsZetherDepositTransactions from "./zether/tests-zether-deposit-transactions"
import TestsZetherBurnTransactions from "./zether/tests-zether-burn-transactions"
import TestsZetherTransferTransactions from "./zether/tests-zether-transfer-transactions"

export default async function run () {

    await TestsSimpleTransactions();
    await TestsZetherDepositTransactions();
    await TestsZetherBurnTransactions();
    await TestsZetherTransferTransactions();

}