const {Helper, Exception} = global.kernel.helpers;
const {MarshalData} = global.kernel.marshal;
const {DBSchema} = global.kernel.marshal.db;

/**
 * It is used in Encrypted Chat Server and Wallet
 */

export default class ChatMessage extends DBSchema {

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

                    senderPublicKey: {
                        type: "buffer",
                        fixedBytes: 33,

                        position: 101,
                    },

                    script:{
                        type: "number",

                        validation(script){
                            return script === 0;
                        },

                        position: 102,
                    },

                    text: {
                        type: "string",
                        minSize: 1,
                        maxSize: 4000,

                        position: 103,
                    },

                }

            },
            schema, false), data, type, creationOptions);

    }



}