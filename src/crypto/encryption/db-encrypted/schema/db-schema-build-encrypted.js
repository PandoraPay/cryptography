const {DBSchemaBuild} = require('kernel').db;
const {Helper, EnumHelper} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;

const DBSchemaEncryptionTypeEnum = require('./db-schema-encryption-type-enum')

class DBSchemaBuildEncrypted extends DBSchemaBuild{

    constructor(schema) {

        super(Helper.merge( {

                fields:{

                    table: {
                        default: "crypt",
                        fixedBytes: 5,
                    },

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

                        default: DBSchemaEncryptionTypeEnum.NON_EXISTENT,

                        validation: value => EnumHelper.validateEnum(value, DBSchemaEncryptionTypeEnum),

                        position: 101,

                    },

                    value: {

                        type: "buffer",

                        minSize(){
                            if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) return 0;
                            if (this.encryption === DBSchemaEncryptionTypeEnum.ENCRYPTED) return 16;
                            if (this.encryption === DBSchemaEncryptionTypeEnum.PLAIN_TEXT) return 1;
                            return 0;
                        },

                        maxSize(){
                            if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) return 0;
                            if (this.encryption === DBSchemaEncryptionTypeEnum.ENCRYPTED) return 256;
                            if (this.encryption === DBSchemaEncryptionTypeEnum.PLAIN_TEXT) return 256;
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
    DBSchemaBuildEncrypted,
    DBSchemaBuiltEncrypted: new DBSchemaBuildEncrypted(),
}