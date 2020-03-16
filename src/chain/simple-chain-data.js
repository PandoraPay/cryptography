/**
 * Dummy chain data
 */

export default class SimpleChainData {

    constructor(scope){

        this._scope = scope;

        this.zsc = new this._scope.cryptography.Zether.ZSC(this);

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
    }

    getEpoch(){
        return this.end / 10;
    }

}