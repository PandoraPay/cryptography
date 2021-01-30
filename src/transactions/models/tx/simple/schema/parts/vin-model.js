const {Model} = require('kernel').marshal;
const {VinSchemaBuilt} = require('./schema/vin-schema-build')

module.exports = class VinModel extends Model {

    constructor(scope, schema= VinSchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    get publicKeyHash(){

        if (!this._publicKeyHash)
            this._publicKeyHash = this._scope.cryptography.addressGenerator.generatePublicKeyHash( this.publicKey );

        return this._publicKeyHash;

    }

    get address(){

        if (!this._address)
            this._address = this._scope.cryptography.addressGenerator.generateAddressFromPublicKey( this.publicKey ).calculateAddress();

        return this._address;
    }

}

