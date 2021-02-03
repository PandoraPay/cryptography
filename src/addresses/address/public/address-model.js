const {MarshalData} = require('kernel').marshal;
const {CryptoHelper} = require('kernel').helpers.crypto;
const {DBModel} = require('kernel').db;
const Identicon = require("../../../utils/identicons/identicon");

const {AddressSchemaBuilt} = require('./address-schema-build')

module.exports = class AddressModel extends DBModel {

    constructor(scope, schema = AddressSchemaBuilt,  data, type, creationOptions){
        super (scope, schema, data, type, creationOptions);
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
