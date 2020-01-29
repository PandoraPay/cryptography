const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;
import EthCrypto from 'eth-crypto';

/**
 * This is used to store the private key
 */

export default class PrivateKeyAddress extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                /**
                 * EdDSA ed25519
                 */
                privateKey:{
                    type: "buffer",
                    fixedBytes: 32,

                    default(){
                        return this._scope.cryptography.cryptoSignature.createPrivateKey();
                    },

                    preprocessor(privateKey){
                        this.__data.publicKey = this._scope.cryptography.cryptoSignature.createPublicKey( privateKey );
                        return privateKey;
                    },

                    position: 100,
                },


                /**
                 * Public Keys are available
                 */

                publicKey:{

                    type: "buffer",
                    fixedBytes: 33,

                    skipMarshal: true,
                    skipSaving: true,

                    default(){
                        return this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
                    },

                    validation(value){
                        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
                        return value.equals(pubKey);
                    },

                    position: 101,
                },

            }

        }, schema, false), data, type, creationOptions);

    }

    /**
     * returns a publicAddress
     */
    getAddress(networkByte ){

        return this._scope.cryptography.addressGenerator.generateAddressFromPublicKey( this.publicKey, networkByte);

    }

    validatePublicKey(value){

        if (!value) value = this.publicKey;

        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );

        return value.equals(pubKey);
    }

}
