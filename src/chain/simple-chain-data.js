/**
 * Dummy chain data
 */

export default class SimpleChainData {

    constructor(scope){

        this._scope = scope;

        this.clearData();

    }

    async addTransactionToChain( transaction ){

        const hash = transaction.hash();
        this._transactions [ hash.toString("hex") ] = transaction;

    }

    async getTransactionByHash( hash ){
        return this._transactions[ hash.toString("hex") ];
    }

    async getBlock( height  = this.end - 1 ){

    }

    clearData(){
        this._transactions = {};
        this.end = 0;
        this.start = 0;
        this.zsc = new this._scope.cryptography.Zether.ZSC(this, this._scope.argv.blockchain.genesis.zsc.address );
    }

    getEpoch(){
        return Math.floor( this.end / 10 );
    }

    getTimeLockEpoch(epoch){
        return epoch * 10;
    }

    fakeIncrementEpoch(){
        this.end += 10;
    }

}