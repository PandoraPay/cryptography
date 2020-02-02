const {describe} = global.kernel.tests;

import TestsCryptoSignatures from "./signatures/tests-crypto-signatures";
import TestsCryptoMessageEncryption from "./encryption/tests-crypto-message-encryption";
import TestsDBEncryptedSchema from "./db-encrypted-schema/tests-db-encrypted-schema";

export default async function run () {

    await TestsCryptoSignatures();
    await TestsCryptoMessageEncryption();
    await TestsDBEncryptedSchema();

}