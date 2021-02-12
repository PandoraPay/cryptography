const kernel = require('kernel');

const CryptoSignature = require("./src/crypto/signatures/crypto-signature");
const App = require('./src/app');
const Base58 = require("./src/utils/base58/base58");

const PrivateKeyAddressModel  = require("./src/addresses/address/private/private-key-address-model");
const PrivateKeyAddressSchemaBuild  = require("./src/addresses/address/private/private-key-address-schema-build");

const AddressModel = require("./src/addresses/address/public/address-model");
const AddressSchemaBuilt = require("./src/addresses/address/public/address-schema-build");

const AddressGenerator = require("./src/addresses/address-generator/address-generator");

const AddressValidator = require("./src/addresses/address-validator/address-validator");

const AES = require("./src/crypto/encryption/aes");
const BaseTxModel = require("./src/transactions/models/tx/base/base-tx-model");
const BaseTxSchemaBuild = require("./src/transactions/models/tx/base/schema/base-tx-schema-build");

const TxTypeEnum = require("./src/transactions/models/tx/base/schema/tx-type-enum");
const TxScriptTypeEnum = require("./src/transactions/models/tx/base/schema/tx-script-type-enum");
const TxTokenCurrencyTypeEnum = require("./src/transactions/models/tx/base/schema/tokens/tx-token-currency-type-enum");

const SimpleTxModel = require("./src/transactions/models/tx/simple/simple-tx-model");
const SimpleTxSchemaBuild = require("./src/transactions/models/tx/simple/schema/simple-tx-schema-build");

const TestsFiles = require("./tests/tests/tests-index");
const EncryptedModel = require("./src/crypto/encryption/encrypted/encrypted-model");
const EncryptedTypeEnum = require("./src/crypto/encryption/encrypted/schema/encrypted-type-enum");
const EncryptedSchemaBuild = require("./src/crypto/encryption/encrypted/schema/encrypted-schema-build");

const CreateIdenticon = require("./src/utils/identicons/create-identicon");
const Identicon = require("./src/utils/identicons/identicon");

const ChatMessageModel = require("./src/crypto/encryption/encrypted-message/schema/chat-message-schema-build");
const EncryptedMessageModel = require("./src/crypto/encryption/encrypted-message/encrypted-message-model");

const {Helper} = require('kernel').helpers;

const library = Helper.merge( kernel, {

    app: new App({}),

    transactions : {

        baseTransaction: {
            BaseTxModel,
            BaseTxSchemaBuild,
        },

        simpleTransaction:{
            SimpleTxModel,
            SimpleTxSchemaBuild,
        },

        TxTypeEnum,
        TxScriptTypeEnum,
        TxTokenCurrencyTypeEnum,

    },

    addresses: {

        private:{
            PrivateKeyAddressSchemaBuild,
            PrivateKeyAddressModel,
        },

        public:{
            AddressSchemaBuilt,
            AddressModel,
        },

        AddressValidator,
        AddressGenerator,

    },

    encryption:{
        AES,
        ChatMessageModel,
        EncryptedMessageModel,
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
        EncryptedSchemaBuild,
    },

    models: {
        EncryptedModel,
    },

    enums:{
        EncryptedTypeEnum,
    },

}, true );

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