const kernel = require('kernel');

const CryptoSignature = require("./src/crypto/signatures/crypto-signature");
const App = require('./src/app');
const Base58 = require("./src/utils/base58/base58");

const PrivateKeyModel  = require("./src/addresses/address/private-key/private-key-model");
const PrivateKeySchemaBuild  = require("./src/addresses/address/private-key/private-key-schema-build");

const AddressModel = require("./src/addresses/address/address/address-model");
const AddressSchemaBuild = require("./src/addresses/address/address/address-schema-build");

const AddressPublicKeyModel = require("./src/addresses/address/address-public-key/address-public-key-model");
const AddressPublicKeySchemaBuild = require("./src/addresses/address/address-public-key/address-public-key-schema-build");

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

const {Helper} = PandoraLibrary.helpers;

const library = Helper.merge( PandoraLibrary, {

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
            PrivateKeySchemaBuild,
            PrivateKeyModel,
        },

        address:{
            AddressSchemaBuild,
            AddressModel,
        },

        addressPublicKey:{
            AddressPublicKeySchemaBuild,
            AddressPublicKeyModel
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
    window.PandoraLibrary = library;
    window.PandoraPay = window.app = library.app;
    global.cryptography = library;
}

if (typeof global !== "undefined"){
    global.PandoraLibrary = library;
    global.PandoraPay = global.app = library.app;
    global.cryptography = library;
}

module.exports = library;