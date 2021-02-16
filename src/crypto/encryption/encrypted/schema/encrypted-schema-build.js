const {DBSchemaBuild} = PandoraLibrary.db;
const {Helper, EnumHelper} = PandoraLibrary.helpers;
const {CryptoHelper} = PandoraLibrary.helpers.crypto;

const EncryptedTypeEnum = require('./encrypted-type-enum')

class EncryptedSchemaBuild extends DBSchemaBuild {

    constructor(schema) {

        super(Helper.merge( {

            fields:{

                version: {

                    type: "number",

                    default: 0,

                    validation(version){
                        return version === 0;
                    },

                    position: 100,

                },

                encryption: {

                    type: "number",

                    default: EncryptedTypeEnum.NON_EXISTENT,

                    validation: value => EnumHelper.validateEnum(value, EncryptedTypeEnum),

                    position: 101,

                },

                value: {

                    type: "buffer",

                    minSize(){
                        if (this.encryption === EncryptedTypeEnum.NON_EXISTENT) return 0;
                        if (this.encryption === EncryptedTypeEnum.ENCRYPTED) return 16;
                        if (this.encryption === EncryptedTypeEnum.PLAIN_TEXT) return 1;
                        return 0;
                    },

                    maxSize(){
                        if (this.encryption === EncryptedTypeEnum.NON_EXISTENT) return 0;
                        if (this.encryption === EncryptedTypeEnum.ENCRYPTED) return 256;
                        if (this.encryption === EncryptedTypeEnum.PLAIN_TEXT) return 256;
                        return 0;
                    },

                    position: 102,

                },

            },

            options: {
                hashing: {
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
    EncryptedSchemaBuild,
    EncryptedSchemaBuilt: new EncryptedSchemaBuild(),
}