const {Helper, Exception} = global.kernel.helpers;
const {MarshalData} = global.kernel.marshal;
const {DBSchema} = global.kernel.marshal.db;

/**
 * It is used in Encrypted Chat Server and Wallet
 */

export default class EncryptedMessage extends DBSchema {

    constructor(scope, schema = {}, data, type, creationOptions) {

        super(scope, Helper.merge({

                fields: {

                    table: {
                        default: "encryptMsg",
                        fixedBytes: 10,
                    },

                    version: {
                        type: "number",
                        default: 0,

                        validation(version){
                            return version === 0;
                        },

                        position: 100,
                    },

                    timestamp: {
                        type: "number",
                        default: 0,

                        position: 101,
                    },

                    /**
                     * nonce
                     */
                    nonce: {
                        type: "number",
                        default: 0,

                        position: 102,
                    },

                    destinationPublicKey: {

                        type: "buffer",
                        fixedBytes: 33,

                        position: 103,
                    },

                    encryptedData:{
                        type: "buffer",
                        minSize: 1,
                        maxSize: 10*1024, //4kb

                        position: 104,
                    },

                    verifiedSignature:{
                        type: "buffer",
                        fixedBytes: 65,

                        position: 105,
                    }


                }

            },
            schema, false), data, type, creationOptions);

    }

    prefixBufferForSignature(){

        //const hash
        const buffer = this.toBuffer( undefined, {

            onlyFields:{
                version: true,
                timestamp: true,
                nonce: true,
                publicKey: true,
                encryptedData: true,

            }

        } );

        return buffer;

    }

    async encryptData(data, publicKey = this.destinationPublicKey){

        const encrypted = await this._scope.cryptography.cryptoSignature.encrypt( data, publicKey );
        if (!encrypted) throw new Exception(this, "Encrypted could be done", this.toJSON() );

        this.encryptedData = encrypted;
        return encrypted;
    }

    async decryptData(privateKey){

        const data = await this._scope.cryptography.cryptoSignature.decrypt( this.encryptedData, privateKey );
        if (!data) throw new Exception(this, "PrivateKey is invalid", this.toJSON() );

        return data;

    }

    signVerifer(privateKey){

        const buffer = this.prefixBufferForSignature();

        const out = this._scope.cryptography.cryptoSignature.sign( buffer, privateKey );
        if (!out) throw new Exception(this, "Signature invalid", this.toJSON() );

        this.signature = out;
        return out;
    }

    verifyVerifer(){

        const buffer = this.prefixBufferForSignature();

        if (this._scope.cryptography.cryptoSignature.verify( buffer, this.verifiedSignature, this.destinationPublicKey ) !== true) throw new Exception(this, "Signature invalid", this.toJSON() );

        return true;
    }


}