const {MarshalData} = PandoraLibrary.marshal;
const {CryptoHelper} = PandoraLibrary.helpers.crypto;
const {DBModel} = PandoraLibrary.db;
const Identicon = require("../../../utils/identicons/identicon");

const {AddressSchemaBuilt} = require('./address-schema-build')

module.exports = class AddressModel extends DBModel {

    constructor(scope, schema = AddressSchemaBuilt,  data, type, creationOptions){
        super (scope, schema, data, type, creationOptions);
    }

    _calculateCheckSumPrefix(){
        return Buffer.concat([
            this.addressPrefix(),
            MarshalData.marshalNumber(this.networkByte),
            this.publicKeyHash
        ]);
    }

    calculateCheckSum(){

        const hash = CryptoHelper.keccak256( this._calculateCheckSumPrefix() );
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
        const buffer = Buffer.concat([
            MarshalData.marshalNumber(this.networkByte),
            this.publicKeyHash
        ]);

        return Identicon.createIdenticon( buffer.toString('hex') );
    }

    identiconImg(){
        return this.identiconCanvas().toDataURL();
    }

}
