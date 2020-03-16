/**
 * Dummy chain to keep track of mix rings
 */

import SimpleChainData from "./simple-chain-data"

export default class SimpleChain{

    constructor(scope){

        this._scope = scope;

        this.data = new SimpleChainData({
            ...scope,
            chain: this,
        });

    }


}