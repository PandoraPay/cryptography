const {CryptoHelper} = require('kernel').helpers.crypto;
const {Helper, Exception} = require('kernel').helpers;
const {SchemaBuild} = require('kernel').marshal;

/**
 * It is used in Encrypted Chat Server and Wallet
 */

class ChatMessageAttachmentSchemaBuild extends SchemaBuild {

    constructor( schema = {} ) {

        super( Helper.merge({

                fields: {

                    version: {
                        type: "number",
                        default: 0,

                        validation(version){
                            return version === 0;
                        },

                        position: 100,
                    },

                    text:{
                        type: "string",
                        minSize: 0,
                        maxSize: 4*1024, //4kb

                        position: 101,
                    },

                    name: {
                        type: "string",
                        minSize: 0,
                        maxSize: 1024, //1kb

                        position: 102,
                    },

                    type: {
                        type: "string",
                        minSize: 0,
                        maxSize: 10,

                        position: 103
                    },

                    data: {
                        type: "buffer",
                        minSize: 0,
                        maxSize(){
                            return this._scope.argv.encryptedMessage.maxSize
                        },

                        position: 104,
                    },

                },

                options: {
                    hashing: {
                        enabled: true,
                        parentHashingPropagation: true,
                        fct: a => a,
                    },
                },

                saving:{
                    storeDataNotId: true,
                },

            },
            schema, true ) );

    }

}

module.exports = {
    ChatMessageAttachmentSchemaBuild,
    ChatMessageAttachmentSchemaBuilt: new ChatMessageAttachmentSchemaBuild(),
}