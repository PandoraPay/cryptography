const {Model} = require('kernel').marshal;
const {SchemaBuiltVout} = require('./schema/schema-build-vout')

module.exports = class ModelVout extends Model {

    constructor(scope, schema= SchemaBuiltVout, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    get address(){
        if (this._address)
            this._address = this._scope.cryptography.addressGenerator.generateAddressFromPublicKeyHash( this.publicKeyHash ).calculateAddress();

        return this._address;
    }

}

