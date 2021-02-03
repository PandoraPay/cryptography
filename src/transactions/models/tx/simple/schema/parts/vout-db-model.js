const {DBModel} = require('kernel').db;
const {VoutDBSchemaBuilt} = require('./schema/vout-db-schema-build')

module.exports = class VoutDBModel extends DBModel {

    constructor(scope, schema= VoutDBSchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    get address(){
        if (this._address)
            this._address = this._scope.cryptography.addressGenerator.generateAddressFromPublicKeyHash( this.publicKeyHash ).calculateAddress();

        return this._address;
    }

}

