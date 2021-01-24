const {CryptoHelper} = require('kernel').helpers.crypto;
const {Helper, Exception} = require('kernel').helpers;
const {MarshalData} = require('kernel').marshal;
const {DBSchema} = require('kernel').marshal.db;

const ChatMessageAttachment = require( "./data/chat-message-attachment")
const ChatMessageString = require("./data/chat-message-string")

/**
 * It is used in Encrypted Chat Server and Wallet
 */

module.exports = class ChatMessage extends DBSchema {

    constructor(scope, schema = {}, data, type, creationOptions) {

        super(scope, Helper.merge({

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
                        classObject() {
                            if (this.script === 0) return ChatMessageString;
                            if (this.script === 1) return ChatMessageAttachment;
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
            schema, false), data, type, creationOptions);

    }



}