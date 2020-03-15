const {describe} = global.kernel.tests;

import TestsSimpleTransactions from "./simple/tests-simple-transactions";
import TestsZetherDepositTransactions from "./zether/tests-zether-deposit-transactions"

export default async function run () {

    await TestsSimpleTransactions();
    await TestsZetherDepositTransactions();

}