const {Exception, StringHelper, ArrayHelper, BufferHelper, BufferReader, Base58} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;
const {Logger} = require('kernel');

const PrivateKeyAddress = require("../address/private/private-key-address");
const Address = require("../address/public/address");
const Generator = require("./generator")

const bip39 = require('bip39');
const HDKeyChain = require("./hd-key-chain");

/**
 * Enables Hierarchical Deterministic Wallets
 */

module.exports = class AddressGenerator extends Generator {


    generatePublicKeyHash(publicKey){

        if (typeof publicKey === "string" && StringHelper.isHex(publicKey)) publicKey = Buffer.from(publicKey, "hex");
        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33 ) throw new Exception(this, "PublicKey is invalid");

        const publicKeyHash = CryptoHelper.dkeccak256( publicKey );

        //copy the last 20 bytes
        const last20Bytes = Buffer.alloc( 20 );
        publicKeyHash.copy(last20Bytes, 0, 12, 32);

        return last20Bytes;
    }

    generateAddressFromPublicKey(publicKey, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        if (typeof publicKey === "string" && StringHelper.isHex(publicKey)) publicKey = Buffer.from(publicKey, "hex");
        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33 ) throw new Exception(this, "PublicKey is invalid");

        const publicKeyHash = this.generatePublicKeyHash(publicKey);

        return new Address(this._scope, undefined, {
            networkByte,
            publicKeyHash,
        })

    }

    generateAddressFromPublicKeyHash(publicKeyHash, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        if (typeof publicKeyHash === "string" && StringHelper.isHex(publicKeyHash)) publicKeyHash = Buffer.from(publicKeyHash, "hex");
        if (!Buffer.isBuffer(publicKeyHash) || publicKeyHash.length !== 20 ) throw new Exception(this, "PublicKeyHash is invalid");

        return new Address(this._scope, undefined, {
            networkByte,
            publicKeyHash,
        })

    }

    generatePrivateAddressFromPrivateKey( privateKey ){

        return new PrivateKeyAddress( this._scope, undefined, {
            privateKey,
        } );

    }

    generateContractPublicKeyHashFromAccountPublicKeyHash( publicKeyHash, nonce ){

        if (typeof publicKeyHash === "string" && StringHelper.isHex(publicKeyHash)) publicKeyHash = Buffer.from(publicKeyHash, "hex");
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

