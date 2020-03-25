const bip39 = require('bip39');
import HDKeyChain from "./hd-key-chain";

export default class Generator{

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


}