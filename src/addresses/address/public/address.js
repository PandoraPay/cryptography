const {Exception, StringHelper, BufferHelper} = require('kernel').helpers;
const {MarshalData} = require('kernel').marshal;
const {Helper} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;
const {DBSchema} = require('kernel').marshal.db;
const Identicon = require("../../../utils/identicons/identicon");

module.exports = class Address extends DBSchema {

    constructor(scope, schema={},  data, type, creationOptions){

        super (scope, Helper.merge( {

            fields:{

                networkByte: {

                    type: "number",

                    default() {
                        return scope.argv.crypto.addresses.publicAddress.networkByte;
                    },

                    validation(networkByte){

                        if ( this._scope.argv.crypto.addresses.publicAddress.networkByte !== networkByte )
                            throw new Exception(this, "network byte is invalid");

                        return true;
                    },

                    position: 10,
                },

                publicKeyHash: {
                    type: "buffer",
                    fixedBytes: 20,

                    position: 11,
                },

                checkSum:{

                    type: "buffer",
                    fixedBytes: 4,


                    default(){
                        return this.calculateCheckSum(this);
                    },

                    validation(value){
                        return value.equals( this.calculateCheckSum(this) );
                    },

                    position: 12,

                }

            }

        }, schema, false), data, type, creationOptions);

    }

    calculateCheckSum(){

        const preAddr = Buffer.concat([
            this.addressPrefix(),
            MarshalData.marshalOneByte(this.networkByte),
            this.publicKeyHash
        ]);

        const hash = CryptoHelper.keccak256( preAddr );
        const buffer = Buffer.alloc( 4 );
        hash.copy(buffer, 0, 0, 4);
        return buffer;

    }

    addressPrefix(){
        return this._scope.argv.crypto.addresses.publicAddress.networkPrefixBuffer;
    }

    addressPrefixStr(){
        return this._scope.argv.crypto.addresses.publicAddress.networkPrefix;
    }

    isAddress(){
        return this._scope.argv.crypto.addresses.publicAddress.networkByte === this.networkByte;
    }

    calculateAddress(){
        return this.addressPrefixStr() + this.toBase58();
    }

    identiconCanvas(){
        return Identicon.createIdenticon( this.toHex(undefined, {
            onlyFields:{
                networkByte: true,
                publicKeyHash: true,
            }
        }) );
    }

    identiconImg(){
        return this.identiconCanvas().toDataURL();
    }

}
