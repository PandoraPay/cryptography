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
                            return script === 0;
                        },

                        position: 101,
                    },

                    data: {
                        type: "buffer",
                        minSize: 1,
                        maxSize: 4000,

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