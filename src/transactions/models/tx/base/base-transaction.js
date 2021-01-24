const {Helper} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;
const {DBSchema} = require('kernel').marshal.db;
const {Exception, StringHelper, BufferHelper, EnumHelper} = require('kernel').helpers;

const TransactionScriptTypeEnum = require("./transaction-script-type-enum")
const TransactionTokenCurrencyTypeEnum = require( "./tokens/transaction-token-currency-type-enum")
const TransactionTypeEnum = require( "./transaction-type-enum")

module.exports = class BaseTransaction extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                version: {

                    type: "number",
                    fixedBytes: 1,

                    default: TransactionTypeEnum.PUBLIC_TRANSACTION,

                    validation(value){
                        return value === TransactionTypeEnum.PUBLIC_TRANSACTION;
                    },

                    position: 100,

                },

                scriptVersion:{
                    type: "number",
                    fixedBytes:  1,

                    default: TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION,

                    validation(value){
                        return value === TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION;
                    },

                    position: 101,
                },

                unlockTime: {

                    type: "number",

                    default: 0,

                    position: 102,
                },

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: CryptoHelper.dkeccak256,
                },
            }

        }, schema, false), data, type, creationOptions);

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

