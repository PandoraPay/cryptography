const {Helper, Exception} = PandoraLibrary.helpers;

const {BaseTxSchemaBuild} = require('../../base/schema/base-tx-schema-build')

const TxTypeEnum = require( "../../base/schema/tx-type-enum");
const TxScriptTypeEnum = require( "../../base/schema/tx-script-type-enum");

const VinModel = require('./parts/vin-model')
const VoutModel = require('./parts/vout-model')

const {VoutSchemaBuilt} = require('./parts/schema/vout-schema-build')
const {VinSchemaBuilt} = require('./parts/schema/vin-schema-build')

class SimpleTxSchemaBuild extends BaseTxSchemaBuild {

    constructor(schema) {

        super(Helper.merge({

            fields: {

                version: {

                    default: TxTypeEnum.PUBLIC_TRANSACTION,

                    validation(version){
                        return version === TxTypeEnum.PUBLIC_TRANSACTION;
                    }

                },

                scriptVersion:{

                    default: TxScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION,

                    validation(script){
                        return script === TxScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION;
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

                    position: 1000,

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

                    position: 1001,

                },


            }

        }, schema, false));
    }

}

module.exports = {
    SimpleTxSchemaBuild,
    SimpleTxSchemaBuilt: new SimpleTxSchemaBuild()
}