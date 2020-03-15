const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;
const {CryptoHelper} = global.kernel.helpers.crypto;
const {Exception, Base58, StringHelper, BufferReader} = global.kernel.helpers;

/**
 * This is used to store the Zether private key
 */

export default class ZetherPrivateKeyAddress extends DBSchema {

    constructor(scope, schema = {}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                privateKey: {
                    type: "buffer",
                    fixedBytes: 32,

                    default() {
                        return this._scope.cryptography.cryptoSignature.createPrivateKey();
                    },

                    preprocessor(privateKey) {
                        this.__data.publicKey = this._scope.cryptography.cryptoSignature.createPublicKey(privateKey);
                        return privateKey;
                    },

                    position: 100,
                },


                /**
                 * Public Keys are available
                 */

                publicKey: {

                    type: "buffer",
                    fixedBytes: 64,

                    skipMarshal: true,
                    skipSaving: true,

                    default() {
                        return this._scope.cryptography.cryptoSignature.createPublicKey(this.privateKey);
                    },

                    validation(value) {
                        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey(this.privateKey);
                        return value.equals(pubKey);
                    },

                    position: 101,
                },

            }

        }, schema, false), data, type, creationOptions);

    }

}