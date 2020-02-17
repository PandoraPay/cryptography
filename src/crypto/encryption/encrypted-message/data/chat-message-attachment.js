const {CryptoHelper} = global.kernel.helpers.crypto;
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
                        default: "chatAtt",
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
                        maxSize: scope.argv.encryptedMessage.maxSize,

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
            schema, false), data, type, creationOptions);

    }



}