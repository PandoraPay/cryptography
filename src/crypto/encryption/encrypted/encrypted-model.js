const EncryptedTypeEnum = require("./schema/encrypted-type-enum")

const {DBModel} = require('kernel').db;
const {Exception} = require('kernel').helpers;

const {EncryptedSchemaBuilt} = require('./schema/encrypted-schema-build')

module.exports = class EncryptedModel extends DBModel {

    constructor(scope, schema = EncryptedSchemaBuilt, data, type , creationOptions){

        super(scope, schema, data, type, creationOptions);
        this._unlocked = undefined;

    }

    setPlainTextValue(value){

        this.encryption = EncryptedTypeEnum.PLAIN_TEXT;
        this.value = value;

    }

    /**
     * Encrypt and store the encryption
     * @param password
     */
    encryptKey( password ){

        if (this.encryption === EncryptedTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);
        if (this.encryption === EncryptedTypeEnum.ENCRYPTED) throw new Exception(this, `${this.id} is already encrypted`);

        const encryption = this._scope.cryptography.aes.encrypt( this.value, password );

        this.encryption = EncryptedTypeEnum.ENCRYPTED;
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

        if (this.encryption === EncryptedTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);

        if (this.encryption === EncryptedTypeEnum.PLAIN_TEXT) return this.value;
        if (this._unlocked) return this._unlocked;

        if ( !Buffer.isBuffer(password) || password.length !== 32){

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

        if (this.encryption === EncryptedTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);

        if (this.encryption === EncryptedTypeEnum.ENCRYPTED) {

            const decrypted = this.decryptKey(oldPassword);
            this.encryption = EncryptedTypeEnum.PLAIN_TEXT;
            this.value = decrypted;

        }

        const encryptionNew = this.encryptKey( newPassword );

        delete this._unlocked;

        return encryptionNew;
    }

    removeEncryptionKey(oldPassword){

        if (this.encryption === EncryptedTypeEnum.NON_EXISTENT) throw new Exception(this, `${this.id} data is not present`);

        if (this.encryption === EncryptedTypeEnum.ENCRYPTED) {

            const decrypted = this.decryptKey(oldPassword);
            this.encryption = EncryptedTypeEnum.PLAIN_TEXT;
            this.value = decrypted;

        }

        delete this._unlocked;

    }

}