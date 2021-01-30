const {Helper, Exception} = require('kernel').helpers;
const {MarshalData} = require('kernel').marshal;
const {DBModel} = require('kernel').db;
const {CryptoHelper} = require('kernel').helpers.crypto;

/**
 * It is used in Encrypted Chat Server and Wallet
 */

const {EncryptedMessageDBSchemaBuilt} = require('../encrypted/encrypted-model')

module.exports = class EncryptedMessageDBModel extends DBModel {

    constructor(scope, schema = EncryptedMessageDBSchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    async encryptData(data, publicKey ){

        const encrypted = await this._scope.cryptography.cryptoSignature.encrypt( data, publicKey );
        if (!encrypted) throw new Exception(this, "Encrypted couldn't be done", this.toJSON() );

        return encrypted;
    }

    async decryptData( encryptedData, privateKey){

        const out = await this._scope.cryptography.cryptoSignature.decrypt( encryptedData, privateKey );
        if (!out) throw new Exception(this, "PrivateKey is invalid", this.toJSON() );

        return out;

    }

    get senderAddress(){

        if (!this._senderAddress)
            this._senderAddress = PandoraPay.cryptography.addressGenerator.generateAddressFromPublicKey( this.senderPublicKey );

        return this._senderAddress;
    }

    get receiverAddress(){
        if (!this._receiverAddress)
            this._receiverAddress = PandoraPay.cryptography.addressGenerator.generateAddressFromPublicKey( this.receiverPublicKey );

        return this._receiverAddress;
    }


    _prefixBufferForSignature(){

        //const hash
        const buffer = this.toBuffer( undefined, {

            onlyFields:{
                version: true,
                timestamp: true,
                nonce: true,
                senderPublicKey: true,
                receiverPublicKey: true,
                senderEncryptedData: true,
                receiverEncryptedData: true,
            }

        } );

        return buffer;

    }

    signEncryptedMessage(privateKey){

        const buffer = this._prefixBufferForSignature();

        const out = this._scope.cryptography.cryptoSignature.sign( buffer, privateKey );
        if (!out) throw new Exception(this, "Signature invalid", this.toJSON() );

        this.senderSignature = out;
        return out;
    }

    verifyEncryptedMessage(){

        const buffer = this._prefixBufferForSignature();

        if (this._scope.cryptography.cryptoSignature.verify( buffer, this.senderSignature, this.senderPublicKey ) !== true) throw new Exception(this, "Signature invalid", this.toJSON() );

        if ( this.isExpired() )
            throw new Exception(this, "Timestamp is invalid");

        return true;
    }

    isExpired(){

        if (this.timestamp > new Date().getTime()/1000 + 60 )
            return true;

        return false;
    }

}