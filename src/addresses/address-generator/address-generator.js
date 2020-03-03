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
            networkByte: networkByte,
            publicKeyHash: publicKeyHash,
        })

    }

    generateAddressFromPublicKeyHash(publicKeyHash, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        if (typeof publicKeyHash === "string" && StringHelper.isHex(publicKeyHash)) publicKeyHash = Buffer.from(publicKeyHash, "hex");
        if (!Buffer.isBuffer(publicKeyHash) || publicKeyHash.length !== 20 ) throw new Exception(this, "PublicKeyHash is invalid");

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

    generateContractPublicKeyHashFromAccountPublicKeyHash(publicKeyHash, nonce ){

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

        return contractPublicKeyHash;

    }

}

