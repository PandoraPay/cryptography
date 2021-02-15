/**
 * Based on https://github.com/reckscott/hd-keychain/blob/master/lib/HDKeychain.js
 */

const HDKey = require('hdkey');
const bip39 = require('bip39');

module.exports = class HDKeyChain{

    importSeed(seed){

        if (!seed ) throw Error("seed is not provided");
        if (!Buffer.isBuffer(seed) || seed.length !== 32 ) throw Error("provided seed is invalid");

        this.seed = seed;
    }

    fromSeedHex (seedHex) {
        this.importSeed( new Buffer(seedHex, 'hex') );
    };

    toSeedHex () {
        return this.seed.toString('hex');
    };

    fromSeedMnemonic (seedMnemonic) {
        this.importSeed(bip39.mnemonicToEntropy(seedMnemonic));
    }

    toSeedMnemonic () {
        return bip39.entropyToMnemonic(this.seed);
    };


    deriveKey(account, change, index){

        if (!this.seed) throw Error("seed was not set");

        const type = 473;
        const version = {
            public: 0x00,
            private: 0x80
        };

        const root = HDKey.fromMasterSeed(this.seed, version);
        const key = root.derive(`m/44'/${type}'/${account}'/${change ? 1 : 0}/${index}`);

        return key.privateKey;

    }

}