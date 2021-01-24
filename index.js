const kernel = require('kernel');

const CryptoSignature = require("./src/crypto/signatures/crypto-signature");
const App = require('./src/app');
const Base58 = require("./src/utils/base58/base58");

const PrivateKeyAddress  = require("./src/addresses/address/private/private-key-address");

const Address = require("./src/addresses/address/public/address");

const AddressGenerator = require("./src/addresses/address-generator/address-generator");

const AddressValidator = require("./src/addresses/address-validator/address-validator");

const AES = require("./src/crypto/encryption/aes");
const BaseTransaction = require("./src/transactions/models/tx/base/base-transaction");

const TransactionTypeEnum = require("./src/transactions/models/tx/base/transaction-type-enum");
const TransactionScriptTypeEnum = require("./src/transactions/models/tx/base/transaction-script-type-enum");
const TransactionTokenCurrencyTypeEnum = require("./src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum");

const SimpleTransaction = require("./src/transactions/models/tx/simple/simple-transaction");

const TestsFiles = require("./tests/tests/tests-index");
const DBEncryptedSchema = require("./src/crypto/encryption/db-encrypted-schema/db-encrypted-schema");
const DBSchemaEncryptionTypeEnum = require("./src/crypto/encryption/db-encrypted-schema/db-schema-encryption-type-enum");

const CreateIdenticon = require("./src/utils/identicons/create-identicon");
const Identicon = require("./src/utils/identicons/identicon");

const ChatMessage = require("./src/crypto/encryption/encrypted-message/chat-message");
const EncryptedMessage = require("./src/crypto/encryption/encrypted-message/encrypted-message");

const library = {

    ...kernel,

    app: new App({}),

    transactions : {

        base:{
            BaseTransaction,
        },

        simpleTransaction:{
            SimpleTransaction,
        },

        TransactionTypeEnum,
        TransactionScriptTypeEnum,
        TransactionTokenCurrencyTypeEnum,

    },

    addresses: {

        private:{
            PrivateKeyAddress,
        },

        public:{
            Address,
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
        ...kernel.utils,
        App,
        Base58,
        CreateIdenticon,
        Identicon,
    },

    tests: {
        ...kernel.tests,
        TestsFiles,
    },

    marshal:{
        ...kernel.marshal,
        db:{
            ...kernel.marshal.db,
            samples:{
                ...kernel.marshal.db.samples,
                DBEncryptedSchema,
                DBSchemaEncryptionTypeEnum,
            }
        }
    },

};

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