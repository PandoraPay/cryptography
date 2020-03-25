const {Exception, StringHelper, ArrayHelper, BufferHelper, BufferReader, Base58} = global.kernel.helpers;
const {Logger} = global.kernel;

import ZetherPrivateKeyAddress from "../address/private/zether-private-key-address";
import ZetherAddress from "../address/public/zether-address";
import Generator from "./generator"

/**
 * Enables Hierarchical Deterministic Wallets
 */

const bip39 = require('bip39');
import HDKeyChain from "./hd-key-chain";

export default class ZetherAddressGenerator extends Generator {


    generateZetherAddressFromMnemonic( words = [], sequence = 0 ){

        if (!Array.isArray(words)) throw new Exception(this, "Seed for Address generation is not an array");

        if (words.length === 0) words = this.generateMnemonic();

        const mnemonic = words.join(' ');

        const validation = bip39.validateMnemonic( mnemonic );
        if (!validation) throw new Exception(this, "Mnemonic is invalid");

        const hdwallet = new HDKeyChain();
        hdwallet.fromSeedMnemonic(mnemonic);

        const privateKey = hdwallet.deriveKey(1, 0, sequence);

        return {
            mnemonic: words,
            sequence,
            privateAddress: this.generateZetherPrivateAddressFromPrivateKey( privateKey ),
        };

    }

    generateZetherNewAddress(sequence){
        return this.generateZetherAddressFromMnemonic([], sequence);
    }

    generateZetherAddressFromPublicKey(publicKey, registration, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        if (typeof publicKey === "string" && StringHelper.isHex(publicKey)) publicKey = Buffer.from(publicKey, "hex");
        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 64 ) throw new Exception(this, "PublicKey is invalid");

        return new ZetherAddress(this._scope, undefined, {
            networkByte,
            publicKey,
            registration: registration ? {
                registered: 1,
                c: registration.c,
                s: registration.s,
            } : undefined,
        })

    }

    generateZetherPrivateAddressFromPrivateKey( privateKey ){

        return new ZetherPrivateKeyAddress( this._scope, undefined, {
            privateKey,
        } );

    }


}

