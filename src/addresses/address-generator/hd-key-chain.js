/**
 * Based on https://github.com/reckscott/hd-keychain/blob/master/lib/HDKeychain.js
 */

const HDKey = require('hdkey');
const bip39 = require('bip39');

module.exports = class HDKeyChain{

    constructor(){
    }

    importSeed(seed){

        if (!seed)
            throw "seed is not provided";

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
    };

    toSeedMnemonic () {
        return bip39.entropyToMnemonic(this.seed);
    };


    deriveKey(account, change, index){

        if (!this.seed)
            throw "seed was not set";

        const type = 473;
        const version = {
            public: 0x00,
            private: 0x80
        };

        var root = HDKey.fromMasterSeed(this.seed, version);
        var key = root.derive(`m/44'/${type}'/${account}'/${change ? 1 : 0}/${index}`);

        return key.privateKey;

    }

}