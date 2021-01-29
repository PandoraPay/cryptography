const {describe} = require('kernel').tests;

const TestsCryptoSignatures = require("./signatures/tests-crypto-signatures");

const TestsCryptoMessageEncryption = require("./encryption/tests-crypto-message-encryption");
const TestsDBEncryptedMarshal = require("./db-encrypted/tests-db-encrypted");

module.exports = async function run () {

    await TestsCryptoSignatures();
    await TestsCryptoMessageEncryption();
    await TestsDBEncryptedMarshal();

}