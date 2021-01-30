const {Helper, Exception} = require('kernel').helpers;

const {BaseTransactionSchemaBuild} = require('../../base/schema/base-transaction-schema-build')

const TransactionTypeEnum = require( "../../base/schema/transaction-type-enum");
const TransactionScriptTypeEnum = require( "../../base/schema/transaction-script-type-enum");

const VinModel = require('./parts/vin-model')
const VoutModel = require('./parts/vout-model')

const {VoutSchemaBuilt} = require('./parts/schema/vout-schema-build')
const {VinSchemaBuilt} = require('./parts/schema/vin-schema-build')

class SimpleTransactionSchemaBuild extends BaseTransactionSchemaBuild {

    constructor(schema) {

        super(Helper.merge({

            fields: {

                version: {

                    default: TransactionTypeEnum.PUBLIC_TRANSACTION,

                    validation(version){
                        return version === TransactionTypeEnum.PUBLIC_TRANSACTION;
                    }

                },

                scriptVersion:{

                    default: TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION,

                    validation(script){
                        return script === TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION;
                    }

                },

                vin:{
                    type: "array",
                    schemaBuiltClass: VinSchemaBuilt,
                    modelClass: VinModel,

                    minSize: 1,
                    maxSize: 255,

                    /**
                     * Verify two conditions
                     *  Every (input, tokenCurrency) is unique
                     *  Every input contains maximum two tokenCurrencies
                     * @param input
                     * @returns {boolean}
                     */
                    validation(input){

                        if ( this._validateSpecialAddresses(input) !== true) throw new Exception(this, "vin validation failed special addresses");
                        if ( this._validateMapUniqueness(input) !== true) throw new Exception(this, "vin validation failed");

                        return true;
                    },

                    position: 1001,

                },

                vout:{
                    type: "array",

                    schemaBuiltClass: VoutSchemaBuilt,
                    modelClass: VoutModel,

                    minSize: 1,
                    maxSize: 255,

                    /**
                     * Verify three conditions
                     *  Every (output, tokenCurrency) is unique
                     *  Every output contains maximum two tokenCurrencies
                     *  Every (input, tokenCurrency) and (output, tokenCurrency) are unique
                     * @param output
                     * @returns {boolean}
                     */
                    validation(output){

                        if ( this._validateMapUniqueness(output) !== true) throw new Exception(this, "vin validation failed");

                        const sumIn = this.sumIn(this.vin), sumOut = this.sumOut(output);

                        this.validateOuts(sumIn, sumOut);
                        this.validateFee(sumIn, sumOut);

                        return true;
                    },

                    position: 1003,

                },


            }

        }, schema, false));
    }

}

module.exports = {
    SimpleTransactionSchemaBuild,
    SimpleTransactionSchemaBuilt: new SimpleTransactionSchemaBuild()
}