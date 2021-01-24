const {describe} = require('kernel').tests;

const TestsCryptoSignatures = require("./signatures/tests-crypto-signatures");

const TestsCryptoMessageEncryption = require("./encryption/tests-crypto-message-encryption");
const TestsDBEncryptedSchema = require("./db-encrypted-schema/tests-db-encrypted-schema");

module.exports = async function run () {

    await TestsCryptoSignatures();
    await TestsCryptoMessageEncryption();
    await TestsDBEncryptedSchema();

}