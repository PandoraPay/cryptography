const {CryptoHelper} = require('kernel').helpers.crypto;
const {Helper, Exception} = require('kernel').helpers;
const {MarshalData} = require('kernel').marshal;
const {DBSchemaBuild} = require('kernel').db;

const {ChatMessageAttachmentDBSchemaBuilt} = require( "./data/chat-message-attachment-db-schema-build")
const {ChatMessageStringDBSchemaBuilt} = require("./data/chat-message-string-db-schema-build")

/**
 * It is used in Encrypted Chat Server and Wallet
 */

class ChatMessageDBSchemaBuild extends DBSchemaBuild {

    constructor(schema) {

        super( Helper.merge({

                fields: {

                    table: {
                        default: "chatMsg",
                        fixedBytes: 7,
                    },

                    version: {
                        type: "number",
                        default: 0,

                        validation(version){
                            return version === 0;
                        },

                        position: 100,
                    },

                    script:{
                        type: "number",

                        validation(script){
                            return script === 0 || script === 1;
                        },

                        position: 101,
                    },

                    data: {

                        type: "object",
                        schemaBuiltClass() {
                            if (this.script === 0) return ChatMessageStringDBSchemaBuilt;
                            if (this.script === 1) return ChatMessageAttachmentDBSchemaBuilt;
                        },

                        position: 102,
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
                    storeDataNotId: true,
                },

            },
            schema, true ) );

    }

}

module.exports = {
    ChatMessageDBSchemaBuild,
    ChatMessageDBSchemaBuilt: new ChatMessageDBSchemaBuild(),
}