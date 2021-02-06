const {SchemaBuild} = require('kernel').marshal;
const {Exception, Helper} = require('kernel').helpers;

class PrivateKeyAddressSchemaBuild extends SchemaBuild{

    constructor(schema) {

        super(Helper.merge({

            fields: {

                privateKey:{
                    type: "buffer",
                    minSize: 32,
                    maxSize: 32,

                    default(){
                        return this._scope.cryptography.cryptoSignature.createPrivateKey();
                    },

                    preprocessor(privateKey){
                        this.__data.publicKey = this._scope.cryptography.cryptoSignature.createPublicKey( privateKey );
                        return privateKey;
                    },

                    position: 100,
                },


                /**
                 * Public Keys are available
                 */

                publicKey:{

                    type: "buffer",
                    minSize: 33,
                    maxSize: 33,

                    skipMarshal: true,
                    skipSaving: true,

                    default(){
                        return this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
                    },

                    validation(value){
                        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
                        return value.equals(pubKey);
                    },

                    position: 101,
                },

            }

        }, schema, true ) );
    }

}

module.exports = {
    PrivateKeyAddressSchemaBuild,
    PrivateKeyAddressSchemaBuilt: new PrivateKeyAddressSchemaBuild(),
}