const {Exception, StringHelper, ArrayHelper, BufferHelper, BufferReader, Base58} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;
const {Logger} = global.kernel;

import Argv from "bin/argv/argv"
import PrivateKeyAddress from "../address/private/private-key-address";
import Address from "../address/public/address";

const bip39 = require('bip39');
import HDKeyChain from "./hd-key-chain";

/**
 * Enables Hierarchical Deterministic Wallets
 */

export default class AddressGenerator{

    constructor(scope){

        this._scope = scope;

        this.bip39 = bip39;

    }

    getAvailableMnemonicWordlists(){

        const languages = [];
        for (const key in bip39.wordlists)
            if (key && bip39.wordlists[key].length > 1000)
                languages.push(key);

        return languages;
    }

    generateMnemonic(  language = 'english' ) {

        const words = bip39.generateMnemonic(256, null, bip39.wordlists[language] );

        return words.split(' ');

    }

    generateAddressFromMnemonic( words=[], sequence = 0 ){

        if (!Array.isArray(words)) throw new Exception(this, "Seed for Address generation is not an array");

        if (words.length === 0) words = this.generateMnemonic();

        const mnemonic = words.join(' ');

        const validation = bip39.validateMnemonic( mnemonic );
        if (!validation) throw new Exception(this, "Mnemonic is invalid");

        const hdwallet = new HDKeyChain();
        hdwallet.fromSeedMnemonic(mnemonic);

        const privateKey = hdwallet.deriveKey(0,0, sequence);

        return {
            mnemonic: words,
            sequence,
            privateAddress: this.generatePrivateAddressFromPrivateKey( privateKey ),
        };

    }

    generateNewAddress(sequence){
        return this.generateAddressFromMnemonic([], sequence);
    }

    generatePublicKeyHash(publicKey){

        if (typeof publicKey === "string" && StringHelper.isHex(publicKey)) publicKey = Buffer.from(publicKey, "hex");
        if (!Buffer.isBuffer(publicKey)) throw new Exception(this, "PublicKey is not a buffer");

        const publicKeyHash = CryptoHelper.dkeccak256( publicKey );

        //copy the last 20 bytes
        const last20Bytes = Buffer.alloc( 20 );
        publicKeyHash.copy(last20Bytes, 0, 12, 32);

        return last20Bytes;
    }

    generateAddressFromPublicKey(publicKey, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        const publicKeyHash = this.generatePublicKeyHash(publicKey);

        return new Address(this._scope, undefined, {
            networkByte: networkByte,
            publicKeyHash: publicKeyHash,
        })

    }

    generateAddressFromPublicKeyHash(publicKeyHash, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        return new Address(this._scope, undefined, {
            networkByte: networkByte,
            publicKeyHash: publicKeyHash,
        })

    }

    generatePrivateAddressFromPrivateKey( privateKey ){

        return new PrivateKeyAddress( this._scope, undefined, {
            privateKey,
        } );

    }


}

