const kernel = global.kernel;

const CryptoSignature = require("src/crypto/signatures/crypto-signature").default;
const App = require('src/app').default;
const Base58 = require("src/utils/base58/base58").default;

const PrivateKeyAddress  = require("src/addresses/address/private/private-key-address").default;
const ZetherPrivateKeyAddress  = require("src/addresses/address/private/zether-private-key-address").default;

const Address = require("src/addresses/address/public/address").default;
const ZetherAddress = require("src/addresses/address/public/zether-address").default;

const AddressGenerator = require("src/addresses/address-generator/address-generator").default;
const ZetherAddressGenerator = require("src/addresses/address-generator/zether-address-generator").default;

const AddressValidator = require("src/addresses/address-validator/address-validator").default;
const ZetherAddressValidator = require("src/addresses/address-validator/zether-address-validator").default;

const AES = require("src/crypto/encryption/aes").default;
const BaseTransaction = require("src/transactions/models/tx/base/base-transaction").default;

const TransactionTypeEnum = require("src/transactions/models/tx/base/transaction-type-enum").default;
const TransactionScriptTypeEnum = require("src/transactions/models/tx/base/transaction-script-type-enum").default;
const TransactionTokenCurrencyTypeEnum = require("src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum").default;

const SimpleTransaction = require("src/transactions/models/tx/simple/simple-transaction").default;
const ZetherDepositTransaction = require("src/transactions/models/tx/zether/zether-deposit-transaction").default;
const ZetherBurnTransaction = require("src/transactions/models/tx/zether/zether-burn-transaction").default;
const ZetherTransferTransaction = require("src/transactions/models/tx/zether/zether-transfer-transaction").default;

const TestsFiles = require("tests/tests/tests-index").default;
const DBEncryptedSchema = require("src/crypto/encryption/db-encrypted-schema/db-encrypted-schema").default;
const DBSchemaEncryptionTypeEnum = require("src/crypto/encryption/db-encrypted-schema/db-schema-encryption-type-enum").default;

const CreateIdenticon = require("src/utils/identicons/create-identicon").default;
const Identicon = require("src/utils/identicons/identicon").default;

const ChatMessage = require("src/crypto/encryption/encrypted-message/chat-message").default;
const EncryptedMessage = require("src/crypto/encryption/encrypted-message/encrypted-message").default;

const Zether = require('zetherjs');

const library = {

    ...kernel,

    app: new App({}),

    transactions : {

        base:{
            BaseTransaction,
        },

        simpleTransaction:{
            SimpleTransaction,
            ZetherDepositTransaction,
            ZetherBurnTransaction,
            ZetherTransferTransaction,
        },

        TransactionTypeEnum,
        TransactionScriptTypeEnum,
        TransactionTokenCurrencyTypeEnum,

    },

    addresses: {

        private:{
            PrivateKeyAddress,
            ZetherPrivateKeyAddress,
        },

        public:{
            Address,
            ZetherAddress,
        },

        AddressValidator,
        ZetherAddressValidator,
        AddressGenerator,
        ZetherAddressGenerator

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

    zether:{
        ...Zether
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

export default library;