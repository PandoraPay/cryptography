const kernel = require('kernel');

const CryptoSignature = require("./src/crypto/signatures/crypto-signature");
const App = require('./src/app');
const Base58 = require("./src/utils/base58/base58");

const ModelPrivateKeyAddress  = require("./src/addresses/address/private/model-private-key-address");

const ModelAddress = require("./src/addresses/address/public/model-address");

const AddressGenerator = require("./src/addresses/address-generator/address-generator");

const AddressValidator = require("./src/addresses/address-validator/address-validator");

const AES = require("./src/crypto/encryption/aes");
const ModelBaseTransaction = require("./src/transactions/models/tx/base/model-base-transaction");

const TransactionTypeEnum = require("./src/transactions/models/tx/base/schema/transaction-type-enum");
const TransactionScriptTypeEnum = require("./src/transactions/models/tx/base/schema/transaction-script-type-enum");
const TransactionTokenCurrencyTypeEnum = require("./src/transactions/models/tx/base/schema/tokens/transaction-token-currency-type-enum");

const ModelSimpleTransaction = require("./src/transactions/models/tx/simple/model-simple-transaction");

const TestsFiles = require("./tests/tests/tests-index");
const ModelEncrypted = require("./src/crypto/encryption/db-encrypted/model-encrypted");
const SchemaEncryptionTypeEnum = require("./src/crypto/encryption/db-encrypted/schema/schema-encryption-type-enum");
const SchemaBuildEncrypted = require("./src/crypto/encryption/db-encrypted/schema/schema-build-encrypted");

const CreateIdenticon = require("./src/utils/identicons/create-identicon");
const Identicon = require("./src/utils/identicons/identicon");

const ChatMessage = require("./src/crypto/encryption/encrypted-message/schema/db-schema-build-chat-message");
const EncryptedMessage = require("./src/crypto/encryption/encrypted-message/db-model-encrypted-message");

const {Helper} = require('kernel').helpers;

const library = Helper.merge( kernel, {

    app: new App({}),

    transactions : {

        base:{
            ModelBaseTransaction,
        },

        simpleTransaction:{
            ModelSimpleTransaction,
        },

        TransactionTypeEnum,
        TransactionScriptTypeEnum,
        TransactionTokenCurrencyTypeEnum,

    },

    addresses: {

        private:{
            ModelPrivateKeyAddress,
        },

        public:{
            ModelAddress,
        },

        AddressValidator,
        AddressGenerator,

    },

    encryption:{
        AES,
        ChatMessage,
        EncryptedMessage,
    },

    signatures: {
        CryptoSignature
    },

    utils: {
        App,
        Base58,
        CreateIdenticon,
        Identicon,
    },

    tests: {
        TestsFiles,
    },

    schema:{
        ModelEncrypted,
        SchemaBuildEncrypted,
    },

    enums:{
        SchemaEncryptionTypeEnum,
    },

}, false);

if (typeof window !== "undefined") {
    window.library = library;
    window.PandoraPay = window.app = library.app;
    global.cryptography = library;
}

if (typeof global !== "undefined"){
    global.library = library;
    global.PandoraPay = global.app = library.app;
    global.cryptography = library;
}

module.exports = library;