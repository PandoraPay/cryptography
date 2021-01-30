const {SchemaBuild} = require('kernel').marshal;
const {Helper, Exception} = require('kernel').helpers;

const TransactionTokenCurrencyTypeEnum = require( "../../../../base/schema/tokens/transaction-token-currency-type-enum");

class VoutSchemaBuild extends SchemaBuild {

    constructor(schema) {

        super(Helper.merge({

            fields: {

                publicKeyHash: {

                    type: "buffer",

                    fixedBytes: 20,

                    preprocessor(publicKey){
                        this._address = undefined;
                        return publicKey;
                    },

                    position: 100,
                },

                amount: {

                    type: "number",

                    minSize: 1,
                    position: 101,
                },

                tokenCurrency: {

                    type: "buffer",
                    maxSize: 20,
                    minSize: 1,

                    default: TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,

                    validation(value) {
                        return value.equals( TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    position : 102,
                },



            },


            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: (b)=>b,
                },
            }

        }, schema, true ));
    }

}

module.exports = {
    VoutSchemaBuild,
    VoutSchemaBuilt: new VoutSchemaBuild(),
}