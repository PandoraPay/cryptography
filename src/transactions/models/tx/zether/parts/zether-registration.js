const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;

export default class ZetherRegistration extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                registered:{
                    type: "number",

                    validation(registration){
                        return registration === 0 || registration === 1;
                    },

                    position: 100,
                },

                c: {

                    type: "buffer",
                    fixedBytes: 32,

                    skipMarshal(){
                        return this.__data.registration === 1 ? false : true;
                    },

                    skipSaving(){
                        return this.__data.registration === 1 ? false : true;
                    },

                    position : 101,
                },

                s: {

                    type: "buffer",
                    fixedBytes: 32,

                    skipMarshal(){
                        return this.__data.registration === 1 ? false : true;
                    },

                    skipSaving(){
                        return this.__data.registration === 1 ? false : true;
                    },

                    position : 102,
                },

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: (b)=>b,
                },
            }

        }, schema, false), data, type, creationOptions);


    }

}

