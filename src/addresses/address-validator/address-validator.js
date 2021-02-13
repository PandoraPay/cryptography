const AddressModel = require("../address/address/address-model");
const AddressPublicKeyModel = require("../address/address-public-key/address-public-key-model");

const PrivateKeyModel = require("../address/private-key/private-key-model");

const {Exception, Base58} = require('kernel').helpers;

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

        if (input instanceof AddressModel && input.validate() ) return input;

        const address = new AddressModel( this._scope, undefined, input);
        return address;
    }

    _validateAddressPublicKey(input){
        if (input instanceof AddressPublicKeyModel && input.validate() ) return input;

        const addressPublicKey = new AddressPublicKeyModel(this._scope, undefined, input);
        return addressPublicKey;
    }

    _preprocessAddress(input, WIFLength){

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

        if ( Buffer.isBuffer(input) && input.length === WIFLength)
            return input;
    }

    /**
     * Validates if it is an Valid Address
     * @param scope
     * @param input
     * @return {*}
     */
    validateAddress(input){

        if (!input) throw new Exception(this, "Input is invalid");
        if (input instanceof AddressModel && input.validate() ) return input;

        /**
         * 25 = Address WIF ( 1 + 20 + 4)
         */
        input = this._preprocessAddress(input, 24 + this._scope.argv.crypto.addresses.publicAddress.networkByteLength);
        if (input) return this._validateAddress( input );

    }

    validateAddressPublicKey(input){
        if (!input) throw new Exception(this, "Input is invalid");
        if (input instanceof AddressModel && input.validate() ) return input;

        /**
         * 38 = Address WIF ( 1 + 33 + 4)
         */
        input = this._preprocessAddress(input,37 + this._scope.argv.crypto.addresses.publicAddress.networkByteLength )
        if (input) return this._validateAddressPublicKey( input );

    }

    validateAnyAddress(input){
        return this.validateAddress(input) || this.validateAddressPublicKey(input);
    }

    validatePrivateKeyAddress( input ){

        if (!input) throw new Exception(this, "invalid input");

        if (input instanceof PrivateKeyModel) {
            if (!input.validatePublicKey()) throw new Exception(this, "public key is invalid 1");
            return input;
        }

        const addr = new PrivateKeyModel( this._scope, undefined, input );

        if (!addr.validatePublicKey()) throw new Exception(this, "public key is invalid 2");

        return addr;

    }

    validatePrivateKey( privateKeyInput ){

         if (!Buffer.isBuffer(privateKeyInput)) throw new Exception(this, "private key must be a buffer");

         if (privateKeyInput.length !== 32 || privateKeyInput.equals(Buffer.alloc(32))) throw new Exception(this, "private key length must be 32");

         const publicKey = this._scope.cryptography.cryptoSignature.createPublicKey( privateKeyInput );

         return {
             privateKey: privateKeyInput,
             publicKey: publicKey,
         }

    }


}
