const ModelAddress = require("../address/public/model-address");
const ModelPrivateKeyAddress = require("../address/private/model-private-key-address");

const {Exception, Base58, StringHelper, BufferReader} = require('kernel').helpers;

module.exports = class AddressValidator {

    constructor(scope){
        this._scope = scope;
    }


    /**
     * Validates an address
     * @param data
     * @return {*}
     */
    _validateAddress(input){

        if (input instanceof ModelAddress && input.validate() ) return input;

        const address = new ModelAddress( this._scope, undefined, undefined, undefined, {emptyObject: true} );
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
        if (input instanceof ModelPrivateKeyAddress) return input.getAddress();
        if (input instanceof ModelAddress && input.validate() ) return input;

        /**
         * 25 = Address WIF ( 1 + 20 + 4)
         */
        let WIFLength = 25;

        //an optimization
        if (typeof input === "string" ){

            const prefix = input.substr(0, this._scope.argv.crypto.addresses.publicAddress.networkPrefixLength);

            input = input.substr(this._scope.argv.crypto.addresses.publicAddress.networkPrefixLength)

            if ( Base58.verify( input )) {

                const base  = Base58.decode(input);
                if ( base.length >= WIFLength) input = base;

            } else
                throw new Exception(this, "Input is string but not base58");

            if (prefix !== this._scope.argv.crypto.addresses.publicAddress.networkPrefix)
                throw new Exception(this, "Input Prefix is not matching", {prefix});

        }else {

            const prefix = Buffer.alloc( this._scope.argv.crypto.addresses.publicAddress.networkPrefixLength );
            input.copy(prefix, 0, 0, this._scope.argv.crypto.addresses.publicAddress.networkPrefixLength);

            const remaining = Buffer.alloc(input.length - this._scope.argv.crypto.addresses.publicAddress.networkPrefixLength);
            input.copy(remaining, 0, this._scope.argv.crypto.addresses.publicAddress.networkPrefixLength )

            input = remaining;

            if ( !prefix.equals(this._scope.argv.crypto.addresses.publicAddress.networkPrefixBuffer) )
                throw new Exception(this, "Input Prefix is not matching", {prefix});
        }

        if (Buffer.isBuffer(input))
            return this._validateAddress( input );

        return undefined;
    }


    validatePrivateAddress( input ){


        if (!input) throw new Exception(this, "invalid input");

        if (input instanceof ModelPrivateKeyAddress) {
            if (!input.validatePublicKey()) throw new Exception(this, "public key is invalid 1");
            return input;
        }

        const addr = new ModelPrivateKeyAddress( this._scope, undefined, undefined, undefined, {emptyObject: true} );
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
