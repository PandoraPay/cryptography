const {SchemaBuild} = require('kernel').marshal;
const {Helper, Exception} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;

const TransactionScriptTypeEnum = require("./transaction-script-type-enum")
const TransactionTokenCurrencyTypeEnum = require( "./tokens/transaction-token-currency-type-enum")
const TransactionTypeEnum = require( "./transaction-type-enum")

class BaseTransactionSchemaBuild extends SchemaBuild {

    constructor(schema) {

        super( Helper.merge({

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

                networkByte: {

                    type: "number",

                    default() {
                        return this._scope.argv.crypto.addresses.publicAddress.networkByte;
                    },

                    validation(networkByte){

                        if ( this._scope.argv.crypto.addresses.publicAddress.networkByte !== networkByte )
                            throw new Exception(this, "network byte is invalid");

                        return true;
                    },

                    position: 102,
                },

                unlockTime: {

                    type: "number",

                    default: 0,

                    position: 103,
                },

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: CryptoHelper.dkeccak256,
                },
            }

        }, schema, true));
    }

}

module.exports = {
    BaseTransactionSchemaBuild,
    BaseTransactionSchemaBuilt : new BaseTransactionSchemaBuild(),
}