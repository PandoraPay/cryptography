const {describe} = global.kernel.tests;

import TestsCryptoSignatures from "./signatures/tests-crypto-signatures";
import TestsDBEncryptedSchema from "./db-encrypted-schema/tests-db-encrypted-schema";

export default async function run () {

    await TestsCryptoSignatures();
    await TestsDBEncryptedSchema();

}