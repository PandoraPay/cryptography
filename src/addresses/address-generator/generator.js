const bip39 = require('bip39');
const HDKeyChain = require("./hd-key-chain");

module.exports = class Generator{

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

    generatePrivateKeyFromMnemonic( words = [], sequence = 0 ){

        if (!Array.isArray(words)) throw new Exception(this, "Seed for Address generation is not an array");

        if (words.length === 0) words = this.generateMnemonic();

        const mnemonic = words.join(' ');

        const validation = bip39.validateMnemonic( mnemonic );
        if (!validation) throw new Exception(this, "Mnemonic is invalid");

        const hdwallet = new HDKeyChain();
        hdwallet.fromSeedMnemonic(mnemonic);

        const privateKey = this._deriveKey(hdwallet, sequence)

        return {
            mnemonic: words,
            sequence,
            privateKeyModel: this.generatePrivateKeyModelFromPrivateKey( privateKey ),
        };

    }

    generateNewAddress(sequence){
        return this.generatePrivateKeyFromMnemonic([], sequence);
    }

    _deriveKey(hdwallet, sequence){
        throw Error("not defined");
    }

    generatePrivateKeyModelFromPrivateKey(privateKey){
        throw Error("not defined");
    }

}