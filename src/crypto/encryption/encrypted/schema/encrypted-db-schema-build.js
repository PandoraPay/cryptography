const {SchemaBuild} = require('kernel').marshal;
const {Helper, EnumHelper} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;

const SchemaEncryptionTypeEnum = require('./schema-encryption-type-enum')

class EncryptedDBSchemaBuild extends SchemaBuild {

    constructor(schema) {

        super(Helper.merge( {

                fields:{

                    version: {

                        type: "number",
                        fixedBytes: 1,

                        default: 0,

                        validation(version){
                            return version === 0;
                        },

                        position: 100,

                    },

                    encryption: {

                        type: "number",
                        fixedBytes: 1,

                        default: SchemaEncryptionTypeEnum.NON_EXISTENT,

                        validation: value => EnumHelper.validateEnum(value, SchemaEncryptionTypeEnum),

                        position: 101,

                    },

                    value: {

                        type: "buffer",

                        minSize(){
                            if (this.encryption === SchemaEncryptionTypeEnum.NON_EXISTENT) return 0;
                            if (this.encryption === SchemaEncryptionTypeEnum.ENCRYPTED) return 16;
                            if (this.encryption === SchemaEncryptionTypeEnum.PLAIN_TEXT) return 1;
                            return 0;
                        },

                        maxSize(){
                            if (this.encryption === SchemaEncryptionTypeEnum.NON_EXISTENT) return 0;
                            if (this.encryption === SchemaEncryptionTypeEnum.ENCRYPTED) return 256;
                            if (this.encryption === SchemaEncryptionTypeEnum.PLAIN_TEXT) return 256;
                            return 0;
                        },

                        position: 102,

                    },

                },

                options: {
                    hashing: {
                        enabled: true,
                        parentHashingPropagation: true,
                        fct: a => a,
                    }
                },

                saving:{
                    storeDataNotId: true,
                },

            },
            schema, true));
    }
}

module.exports = {
    EncryptedDBSchemaBuild,
    EncryptedDBSchemaBuilt: new EncryptedDBSchemaBuild(),
}