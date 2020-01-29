/**
 * Dummy chain to keep track of mix rings
 */

export default class SimpleChain{

    constructor(scope){

        this._scope = scope;

        this.clear();
    }

    async addTransactionToChain( transaction ){


        const hash = transaction.hash();
        this._transactions [ hash.toString("hex") ] = transaction;

    }

    getTransaction( hash ){

        return this._transactions[ hash.toString("hex") ];

    }

    clear(){
        this._transactions = {

        };
    }

}