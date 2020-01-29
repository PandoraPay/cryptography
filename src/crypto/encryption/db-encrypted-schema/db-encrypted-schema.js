import DBSchemaEncryptionTypeEnum from "./db-schema-encryption-type-enum"

const {DBSchema} = global.kernel.marshal.db;
const {Helper, EnumHelper, Exception} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;

export default class DBEncryptedSchema extends DBSchema {

    constructor(scope, schema = { }, data, type , creationOptions){

        super(scope, Helper.merge( {

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
                        },

                        maxSize(){
                            if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) return 0;
                            if (this.encryption === DBSchemaEncryptionTypeEnum.ENCRYPTED) return 256;
                            if (this.encryption === DBSchemaEncryptionTypeEnum.PLAIN_TEXT) return 256;
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
            schema, false), data, type, creationOptions);

        this._unlocked = undefined;

    }

    setPlainTextValue(value){

        this.encryption = DBSchemaEncryptionTypeEnum.PLAIN_TEXT;
        this.value = value;

    }

    /**
     * Encrypt and store the encryption
     * @param password
     */
    encryptKey( password ){

        if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);
        if (this.encryption === DBSchemaEncryptionTypeEnum.ENCRYPTED) throw new Exception(this, `${this.id} is already encrypted`);

        const encryption = this._scope.cryptography.aes.encrypt( this.value, password );

        this.encryption = DBSchemaEncryptionTypeEnum.ENCRYPTED;
        this.value = encryption;

        delete this._unlocked;

        return this.value;

    }

    /**
     * Decrypt the value, but it will not change the store
     * @param password
     * @returns {*|PromiseLike<ArrayBuffer>|undefined}
     */
    decryptKey( password, askPassword = true ){

        if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);

        if (this.encryption === DBSchemaEncryptionTypeEnum.PLAIN_TEXT) return this.value;
        if (this._unlocked) return this._unlocked;

        if (typeof password !== "string"){

            if (!askPassword) throw new Exception(this, "Ask Password is set false");

            //asking for password
            password =  this._scope.cli.askInput('Enter your password', );

        }

        try{

            const decrypted = this._scope.cryptography.aes.decrypt( this.value, password);
            this._unlocked = decrypted;
            return this._unlocked;

        }catch(err){

        }

        throw new Exception(this, "Invalid password" );

    }

    /**
     * It will change the encryption
     * @param oldPassword
     * @param newPassword
     */
    changeEncryptionKey( oldPassword, newPassword) {

        if (!newPassword) throw new Exception(this, "New password was not specified");

        if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);

        if (this.encryption === DBSchemaEncryptionTypeEnum.ENCRYPTED) {

            const decrypted = this.decryptKey(oldPassword);
            this.encryption = DBSchemaEncryptionTypeEnum.PLAIN_TEXT;
            this.value = decrypted;

        }

        const encryptionNew = this.encryptKey( newPassword );

        delete this._unlocked;

        return encryptionNew;
    }

    removeEncryptionKey(oldPassword){

        if (this.encryption === DBSchemaEncryptionTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);

        if (this.encryption === DBSchemaEncryptionTypeEnum.ENCRYPTED) {

            const decrypted = this.decryptKey(oldPassword);
            this.encryption = DBSchemaEncryptionTypeEnum.PLAIN_TEXT;
            this.value = decrypted;

        }

        delete this._unlocked;

    }

}