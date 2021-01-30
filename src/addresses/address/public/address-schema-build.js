const {SchemaBuild} = require('kernel').marshal;
const {Exception, Helper} = require('kernel').helpers;

class AddressSchemaBuild extends SchemaBuild{

    constructor(schema) {
        super(Helper.merge( {

            fields:{

                networkByte: {

                    type: "number",

                    default() {
                        return this._scope.argv.crypto.addresses.publicAddress.networkByte;
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

        }, schema, true));
    }
}

module.exports = {
    AddressSchemaBuild,
    AddressSchemaBuilt: new AddressSchemaBuild(),
}