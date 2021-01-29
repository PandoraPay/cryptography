const {DBModel} = require('kernel').db;
const {Exception} = require('kernel').helpers;

const {SchemaBuiltBaseTransaction} = require('./schema/schema-build-base-transaction')

module.exports = class ModelBaseTransaction extends DBModel {

    constructor(scope, schema= SchemaBuiltBaseTransaction, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    signTransaction(  ){
        throw new Exception(this, "signTransaction is not defined");
    }

    verifyTransactionSignatures(){
        throw new Exception(this, "verifyTransaction is not defined");
    }

    get fee(){
        return 0;
    }

    noOuts(){
        return 0;
    }


    _fieldsForSignature(){
        return {
            version: true,
            scriptVersion: true,
            unlockTime: true,
        }
    }

    _prefixBufferForSignature(){

        //const hash
        const buffer = this.toBuffer( undefined, {

            onlyFields: this._fieldsForSignature(),

        } );

        return buffer;

    }

}

