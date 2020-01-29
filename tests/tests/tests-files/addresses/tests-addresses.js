const {describe} = global.kernel.tests;

import TestsAddressGenerator from "./address/tests-address-generator"
import TestsAddressValidator from "./address/tests-address-validator"

/**
 *
 * REDIS BENCHMARK
 *
 */

export default async function run () {

    await TestsAddressGenerator();
    await TestsAddressValidator();

}