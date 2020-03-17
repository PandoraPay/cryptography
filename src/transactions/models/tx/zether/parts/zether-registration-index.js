const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;

export default class ZetherRegistrationIndex extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                index:{
                    type: "number",
                    maxSize: 255,
                    position: 100,
                },

                c: {

                    type: "buffer",
                    fixedBytes: 32,

                    position : 101,
                },

                s: {

                    type: "buffer",
                    fixedBytes: 32,

                    position : 102,
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

