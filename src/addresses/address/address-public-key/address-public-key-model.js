const {MarshalData} = require('kernel').marshal;
const Identicon = require("../../../utils/identicons/identicon");

const AddressModel = require('../../address/address/address-model')
const {AddressPublicKeySchemaBuilt} = require('./address-public-key-schema-build')

module.exports = class AddressPublicKeyModel extends AddressModel {

    constructor(scope, schema = AddressPublicKeySchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    _calculateCheckSumPrefix(){
        return Buffer.concat([
            this.addressPrefix(),
            MarshalData.marshalOneByte(this.networkByte),
            this.publicKey,
        ]);
    }

    identiconCanvas(){
        const buffer = this.toBuffer( undefined, {
            onlyFields:{
                networkByte: true,
            }
        });

        return Identicon.createIdenticon( Buffer.concat([ buffer, this.publicKeyHash ]).toString('hex') );
    }

}