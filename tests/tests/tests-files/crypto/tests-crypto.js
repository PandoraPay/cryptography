const {describe} = global.kernel.tests;

import TestsCryptoSignatures from "./signatures/tests-crypto-signatures";
import TestsZetherCryptoSignatures from "./signatures/tests-zether-crypto-signatures";

import TestsCryptoMessageEncryption from "./encryption/tests-crypto-message-encryption";
import TestsDBEncryptedSchema from "./db-encrypted-schema/tests-db-encrypted-schema";

export default async function run () {

    await TestsCryptoSignatures();
    await TestsZetherCryptoSignatures();
    await TestsCryptoMessageEncryption();
    await TestsDBEncryptedSchema();

}