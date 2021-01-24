/**
 * Dummy chain to keep track of mix rings
 */

const SimpleChainData = require("./simple-chain-data")

module.exports = class SimpleChain{

    constructor(scope){

        this._scope = scope;

        this.data = new SimpleChainData({
            ...scope,
            chain: this,
        });

    }


}