const kernel = require('kernel');

const CryptoSignature = require("./src/crypto/signatures/crypto-signature");
const App = require('./src/app');
const Base58 = require("./src/utils/base58/base58");

const PrivateKeyAddressDBModel  = require("./src/addresses/address/private/private-key-address-db-model");
const PrivateKeyAddressDBSchemaBuild  = require("./src/addresses/address/private/private-key-address-db-schema-build");

const AddressDBModel = require("./src/addresses/address/public/address-model");
const AddressSchemaDBBuilt = require("./src/addresses/address/public/address-schema-db-build");

const AddressGenerator = require("./src/addresses/address-generator/address-generator");

const AddressValidator = require("./src/addresses/address-validator/address-validator");

const AES = require("./src/crypto/encryption/aes");
const BaseTransactionDBModel = require("./src/transactions/models/tx/base/base-transaction-db-model");
const BaseTransactionSchemaDBBuild = require("./src/transactions/models/tx/base/schema/base-transaction-db-schema-build");

const TransactionTypeEnum = require("./src/transactions/models/tx/base/schema/transaction-type-enum");
const TransactionScriptTypeEnum = require("./src/transactions/models/tx/base/schema/transaction-script-type-enum");
const TransactionTokenCurrencyTypeEnum = require("./src/transactions/models/tx/base/schema/tokens/transaction-token-currency-type-enum");

const SimpleTransactionDBModel = require("./src/transactions/models/tx/simple/simple-transaction-db-model");
const SimpleTransactionDBSchemaBuilt = require("./src/transactions/models/tx/simple/schema/simple-transaction-db-schema-build");

const TestsFiles = require("./tests/tests/tests-index");
const EncryptedDBModel = require("./src/crypto/encryption/encrypted/encrypted-db-model");
const SchemaEncryptionTypeEnum = require("./src/crypto/encryption/encrypted/schema/schema-encryption-type-enum");
const SchemaBuildEncrypted = require("./src/crypto/encryption/encrypted/schema/encrypted-db-schema-build");

const CreateIdenticon = require("./src/utils/identicons/create-identicon");
const Identicon = require("./src/utils/identicons/identicon");

const ChatMessage = require("./src/crypto/encryption/encrypted-message/schema/chat-message-db-schema-build");
const EncryptedMessageDBModel = require("./src/crypto/encryption/encrypted-message/encrypted-message-db-model");

const {Helper} = require('kernel').helpers;

const library = Helper.merge( kernel, {

    app: new App({}),

    transactions : {

        base:{
            BaseTransactionDBModel,
            BaseTransactionSchemaDBBuild,
        },

        simpleTransaction:{
            SimpleTransactionDBModel,
            SimpleTransactionDBSchemaBuilt,
        },

        TransactionTypeEnum,
        TransactionScriptTypeEnum,
        TransactionTokenCurrencyTypeEnum,

    },

    addresses: {

        private:{
            PrivateKeyAddressDBSchemaBuild,
            PrivateKeyAddressDBModel,
        },

        public:{
            AddressSchemaDBBuilt,
            AddressDBModel,
        },

        AddressValidator,
        AddressGenerator,

    },

    encryption:{
        AES,
        ChatMessage,
        EncryptedMessageDBModel,
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

    schemas:{
        SchemaBuildEncrypted,
    },

    models: {
        EncryptedDBModel,
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