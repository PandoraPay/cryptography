const {Helper} = require('kernel').helpers;
const {DBModel} = require('kernel').db;
const {CryptoHelper} = require('kernel').helpers.crypto;
const {Exception, Base58, StringHelper, BufferReader} = require('kernel').helpers;
const HDKeyChain = require("./hd-key-chain");

/**
 * This is used to store the private key
 */
const {PrivateKeySchemaBuilt} = require('./private-key-schema-build')

module.exports = class PrivateKeyModel extends DBModel {

    constructor(scope, schema= PrivateKeySchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    /**
     * returns an address
     */
    getAddress(networkByte ){
        return this._scope.cryptography.addressGenerator.generateAddressFromPublicKey( this.publicKey, networkByte);
    }

    /**
     * returns a addressPublicKey
     */
    getAddressPublicKey(networkByte ){
        return this._scope.cryptography.addressGenerator.generateAddressPublicKeyFromPublicKey( this.publicKey, networkByte);
    }

    validatePublicKey(value){
        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
        return this.publicKey.equals(pubKey);
    }

    /**
     * Get delegate stake private key
     *
     * dsha256( STAKE + dkeccak256( dkeccak256( PRIV + privateKey + DELEGATE) + NONCE ) + SECRET )
     *
     */
    getDelegateStakePrivateKey(delegateNonce){

        if (typeof delegateNonce !== "number") throw new Exception(this, "DelegateNonce is missing");

        const hdwallet = new HDKeyChain();
        const privateKey = CryptoHelper.dsha256( CryptoHelper.dkeccak256(this.privateKey) );
        hdwallet.fromSeed(this._getDelegateStakePrivateKey());
        const delegatePrivateKey = hdwallet.deriveKey(0,0, delegateNonce);

        return new PrivateKeyModel( this._scope, undefined, {
            privateKey: delegatePrivateKey,
        } );

    }

}