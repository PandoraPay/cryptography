const {describe} = global.kernel.tests;

import TestsSimpleTransactions from "./simple/tests-simple-transactions";

export default async function run () {

    await TestsSimpleTransactions();

}