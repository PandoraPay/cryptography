const {Exception, StringHelper, ArrayHelper, BufferHelper, BufferReader, Base58} = PandoraLibrary.helpers;
const {CryptoHelper} = PandoraLibrary.helpers.crypto;

const PrivateKeyModel = require("../address/private-key/private-key-model");
const AddressModel = require("../address/address/address-model");
const AddressPublicKeyModel = require("../address/address-public-key/address-public-key-model");
const Generator = require("./generator")

/**
 * Enables Hierarchical Deterministic Wallets
 */

module.exports = class AddressGenerator extends Generator {


    generatePublicKeyHash(publicKey){

        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33 ) throw new Exception(this, "PublicKey is invalid");

        const publicKeyHash = CryptoHelper.dkeccak256( publicKey );

        //copy the last 20 bytes
        const last20Bytes = Buffer.alloc( 20 );
        publicKeyHash.copy(last20Bytes, 0, 12, 32);

        return last20Bytes;
    }

    generateAddressFromPublicKey(publicKey, networkByte = this._scope.argv.crypto.addresses.publicAddress.networkByte){

        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33 ) throw new Exception(this, "PublicKey is invalid");

        const publicKeyHash = this.generatePublicKeyHash(publicKey);

        return new AddressModel(this._scope, undefined, {
            networkByte,
            publicKeyHash,
        })

    }

    generateAddressPublicKeyFromPublicKey(publicKey, networkByte = this._scope.argv.crypto.addresses.publicAddress.networkByte){

        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33 ) throw new Exception(this, "PublicKey is invalid");

        return new AddressPublicKeyModel(this._scope, undefined, {
            networkByte,
            publicKey,
        })

    }

    generateAddressFromPublicKeyHash(publicKeyHash, networkByte = this._scope.argv.crypto.addresses.publicAddress.networkByte){

        if (!Buffer.isBuffer(publicKeyHash) || publicKeyHash.length !== 20 ) throw new Exception(this, "PublicKeyHash is invalid");

        return new AddressModel(this._scope, undefined, {
            networkByte,
            publicKeyHash,
        })

    }

    generatePrivateKeyModelFromPrivateKey( privateKey ){

        return new PrivateKeyModel( this._scope, undefined, {
            privateKey,
        } );

    }

    generateContractPublicKeyHashFromAccountPublicKeyHash( publicKeyHash, nonce ){

        if (!Buffer.isBuffer(publicKeyHash) || publicKeyHash.length !== 20 ) throw new Exception(this, "PublicKeyHash is invalid");
        if (typeof nonce !== "number") throw new Exception(this, "Nonce is missing");

        let nonceHex = nonce.toString(16);
        if (nonceHex.length % 2 === 1) nonceHex = "0"+nonceHex;

        const concat = Buffer.concat([
            publicKeyHash,
            Buffer.from(nonceHex, 'hex'),
        ]);

        const contractPublicKeyHash = CryptoHelper.dsha256( concat );

        //copy the last 20 bytes
        const last20Bytes = Buffer.alloc( 20 );
        contractPublicKeyHash.copy(last20Bytes, 0, 12, 32);

        return last20Bytes;

    }

    _deriveKey(hdwallet, sequence) {
        return hdwallet.deriveKey(0, 0, sequence);
    }

}

