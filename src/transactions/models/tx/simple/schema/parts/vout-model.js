const {Model} = require('kernel').marshal;
const {VoutSchemaBuilt} = require('./schema/vout-schema-build')

module.exports = class VoutModel extends Model {

    constructor(scope, schema= VoutSchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    get address(){
        if (this._address)
            this._address = this._scope.cryptography.addressGenerator.generateAddressFromPublicKeyHash( this.publicKeyHash ).calculateAddress();

        return this._address;
    }

}

