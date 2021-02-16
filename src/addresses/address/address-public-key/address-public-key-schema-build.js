const {Exception, Helper} = PandoraLibrary.helpers;

const {AddressSchemaBuild} = require('../address/address-schema-build')

class AddressPublicKeySchemaBuild extends AddressSchemaBuild {

    constructor(schema) {
        super(Helper.merge( {

            fields:{

                publicKeyHash: null,

                publicKey: {
                    type: "buffer",
                    minSize: 33,
                    maxSize: 33,

                    preprocessor(publicKey){
                        this.publicKeyHash = this._scope.cryptography.addressGenerator.generatePublicKeyHash( publicKey );
                        return publicKey;
                    },

                    position: 11,
                },

            }

        }, schema, true));
    }
}

module.exports = {
    AddressPublicKeySchemaBuild,
    AddressPublicKeySchemaBuilt: new AddressPublicKeySchemaBuild(),
}