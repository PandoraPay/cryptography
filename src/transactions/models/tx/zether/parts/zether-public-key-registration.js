const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;

export default class ZetherPublicKeyRegistration extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                publicKey:{
                    type: "buffer",
                    fixedBytes: 64,

                    position: 101,
                },

                c: {
                    type: "buffer",
                    fixedBytes: 32,

                    position : 102,
                },

                s: {
                    type: "buffer",
                    fixedBytes: 32,

                    position : 103,
                },

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: (b)=>b,
                },
            },

            saving: {
                storeDataNotId: true,
            }

        }, schema, false), data, type, creationOptions);


    }

}

