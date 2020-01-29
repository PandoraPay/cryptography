const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {MarshalData} = global.kernel.marshal;
const {Helper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;
const {DBSchema} = global.kernel.marshal.db;
import Identicon from "src/utils/identicons/identicon";

export default class Address extends DBSchema {

    constructor(scope, schema={},  data, type, creationOptions){

        super (scope, Helper.merge( {

            fields:{

                networkByte: {

                    type: "number",
                    fixedBytes: 1,

                    position: 10,

                    default() {
                        return scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main;
                    },

                    validation(networkByte){

                        if ( !this._scope.argv.crypto.addresses.publicAddress.isAddress(networkByte) )
                            throw new Exception(this, "network byte is invalid");

                        return true;
                    }

                },

                publicKeyHash: {
                    type: "buffer",
                    fixedBytes: 20,

                    position: 11,
                },

                checkSum:{

                    type: "buffer",
                    fixedBytes: 4,

                    calculateCheckSum(){

                        const preAddr = MarshalData.marshalOneByte(this.networkByte).toString("hex") + this.publicKeyHash.toString("hex");

                        const hash = CryptoHelper.keccak256( preAddr );
                        const buffer = Buffer.alloc( 4 );
                        hash.copy(buffer, 0, 0, 4);
                        return buffer;

                    },

                    default(){
                        return this._schema.fields.checkSum.calculateCheckSum.call(this);
                    },

                    validation(value){
                        return value.equals( this._schema.fields.checkSum.calculateCheckSum.call(this) );
                    },

                    position: 1000,

                }

            }

        }, schema, false), data, type, creationOptions);

    }

    isAddress(){
        return this._scope.argv.crypto.addresses.publicAddress.isAddress(this.networkByte);
    }

    get generateQR(){

    }

    get generateImage(){

    }

    calculateAddress(){
        return this.toBase58();
    }

    identiconCanvas(){
        return Identicon.createIdenticon( this.toBuffer() );
    }

    identiconImg(){
        return Identicon.createIdenticon( this.toBuffer() ).toDataURL();
    }

}
