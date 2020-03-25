import Address from "src/addresses/address/public/address";
import PrivateKeyAddress from "src/addresses/address/private/private-key-address";

const {Exception, Base58, StringHelper, BufferReader} = global.kernel.helpers;
import EthCrypto from 'eth-crypto';

export default class AddressValidator {

    constructor(scope){
        this._scope = scope;
    }


    /**
     * Validates an address
     * @param data
     * @return {*}
     */
    _validateAddress(input){

        if (input instanceof Address && input.validate() ) return input;

        const address = new Address( this._scope, undefined, undefined, undefined, {emptyObject: true} );
        address.fromType( input );

        return address;

    }


    /**
     * Validates if it is an Valid Address
     * @param scope
     * @param input
     * @return {*}
     */
    validateAddress(input){

        if (!input) throw new Exception(this, "Input is invalid");
        if (input instanceof PrivateKeyAddress) return input.getAddress();
        if (input instanceof Address && input.validate() ) return input;

        //an optimization
        if (typeof input === "string" ){

            /**
             * 38 = Address WIF ( 1 + 20 + 4)
             */
            if ( Base58.verify( input )) {

                const base  = Base58.decode(input);
                if ( base.length === 25) input = base;

            } else
                throw new Exception(this, "Input is string but not base58");

        }

        if (Buffer.isBuffer(input)){

            const netbyte = input[0];

            if ( this._scope.argv.crypto.addresses.publicAddress.isAddress(netbyte) ) return this._validateAddress( input );

            throw new Exception(this, "Invalid Address Network Byte: ", netbyte);

        }

        return undefined;
    }


    validatePrivateAddress( input ){


        if (!input) throw new Exception(this, "invalid input");

        if (input instanceof PrivateKeyAddress) {
            if (!input.validatePublicKey()) throw new Exception(this, "public key is invalid 1");
            return input;
        }

        const addr = new PrivateKeyAddress( this._scope, undefined, undefined, undefined, {emptyObject: true} );
        addr.fromType( input );

        if (!addr.validatePublicKey()) throw new Exception(this, "public key is invalid 2");

        return addr;

    }

    validatePrivateKey( privateKeyInput ){

         if (typeof privateKeyInput === "string") privateKeyInput = Buffer.from(privateKeyInput, "hex");
         if (!Buffer.isBuffer(privateKeyInput)) throw new Exception(this, "private key must be a buffer");

         if (privateKeyInput.length !== 32 || privateKeyInput.equals(Buffer.alloc(32))) throw new Exception(this, "private key length must be 32");

         const publicKey = this._scope.cryptography.cryptoSignature.createPublicKey( privateKeyInput );

         return {
             privateKey: privateKeyInput,
             publicKey: publicKey,
         }

    }


}
