const {CryptoHelper} = require('kernel').helpers.crypto;
const {Helper, EnumHelper} = require('kernel').helpers;
const {DBSchemaBuild} = require('kernel').db;

class EncryptedMessageSchemaBuild extends DBSchemaBuild {

    constructor(schema) {

        super(Helper.merge({

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
                        maxSize(){
                            return this._scope.argv.encryptedMessage.maxSize //2 MB
                        },

                        position: 105,
                    },

                    receiverEncryptedData:{
                        type: "buffer",
                        minSize: 1,
                        maxSize(){
                            return this._scope.argv.encryptedMessage.maxSize; //2 MB
                        },

                        position: 106,
                    },

                    senderSignature:{
                        type: "buffer",
                        fixedBytes: 65,

                        position: 108,
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
            schema, false));
    }
}

module.exports = {
    EncryptedMessageSchemaBuild,
    EncryptedMessageSchemaBuilt: new EncryptedMessageSchemaBuild(),
}