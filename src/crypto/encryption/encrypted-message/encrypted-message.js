const {Helper, Exception} = global.kernel.helpers;
const {MarshalData} = global.kernel.marshal;
const {DBSchema} = global.kernel.marshal.db;
const {CryptoHelper} = global.kernel.helpers.crypto;

/**
 * It is used in Encrypted Chat Server and Wallet
 */

export default class EncryptedMessage extends DBSchema {

    constructor(scope, schema = {}, data, type, creationOptions) {

        super(scope, Helper.merge({

                fields: {

                    table: {
                        default: "encryptMsg",
                        fixedBytes: 10,
                    },

                    id:{
                        fixedBytes: 64,
                    },

                    version: {
                        type: "number",
                        default: 0,

                        validation(version){
                            return version === 0;
                        },

                        position: 100,
                    },

                    timestamp: {
                        type: "number",
                        default: 0,

                        position: 101,
                    },

                    /**
                     * nonce
                     */
                    nonce: {
                        type: "number",
                        default: 0,

                        position: 102,
                    },

                    senderPublicKey: {
                        type: "buffer",
                        fixedBytes: 33,

                        preprocessor(publicKey){
                            this._senderAddress = undefined;
                            return publicKey;
                        },

                        position: 103,
                    },

                    receiverPublicKey: {

                        type: "buffer",
                        fixedBytes: 33,

                        preprocessor(publicKey){
                            this._receiverAddress = undefined;
                            return publicKey;
                        },

                        position: 104,
                    },

                    senderEncryptedData:{
                        type: "buffer",
                        minSize: 1,
                        maxSize: scope.encryptedMessage.maxSize, //2 MB

                        position: 105,
                    },

                    receiverEncryptedData:{
                        type: "buffer",
                        minSize: 1,
                        maxSize: scope.encryptedMessage.maxSize, //2 MB

                        position: 106,
                    },

                },

                options: {
                    hashing: {
                        enabled: true,
                        parentHashingPropagation: true,
                        fct: CryptoHelper.dkeccak256,
                    },
                },

                saving:{
                    indexableById: true,
                },

            },
            schema, false), data, type, creationOptions);

    }

    async encryptData(data, publicKey ){

        const encrypted = await this._scope.cryptography.cryptoSignature.encrypt( data, publicKey );
        if (!encrypted) throw new Exception(this, "Encrypted couldn't be done", this.toJSON() );

        return encrypted;
    }

    async decryptData( encryptedData, privateKey){

        const out = await this._scope.cryptography.cryptoSignature.decrypt( encryptedData, privateKey );
        if (!out) throw new Exception(this, "PrivateKey is invalid", this.toJSON() );

        return out;

    }

    get senderAddress(){

        if (!this._senderAddress)
            this._senderAddress = PandoraPay.cryptography.addressGenerator.generateAddressFromPublicKey( this.senderPublicKey );

        return this._senderAddress;
    }

    get receiverAddress(){
        if (!this._receiverAddress)
            this._receiverAddress = PandoraPay.cryptography.addressGenerator.generateAddressFromPublicKey( this.receiverPublicKey );

        return this._receiverAddress;
    }



}