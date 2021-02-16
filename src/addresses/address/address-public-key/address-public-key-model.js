const {MarshalData} = PandoraLibrary.marshal;
const Identicon = require("../../../utils/identicons/identicon");

const AddressModel = require('../../address/address/address-model')
const {AddressPublicKeySchemaBuilt} = require('./address-public-key-schema-build')

module.exports = class AddressPublicKeyModel extends AddressModel {

    constructor(scope, schema = AddressPublicKeySchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    generateAddress(){
        return new AddressModel(this._scope, undefined,  {
            networkByte: this.networkByte,
            publicKeyHash: this.publicKeyHash,
        }, 'object');
    }

    _calculateCheckSumPrefix(){
        return Buffer.concat([
            this.addressPrefix(),
            MarshalData.marshalNumber(this.networkByte),
            this.publicKey,
        ]);
    }

}