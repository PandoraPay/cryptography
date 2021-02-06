const {SchemaBuild} = require('kernel').marshal;
const {Helper, Exception} = require('kernel').helpers;

const TxTokenCurrencyTypeEnum = require( "../../../../base/schema/tokens/tx-token-currency-type-enum");

class VinSchemaBuild extends SchemaBuild {

    constructor(schema) {

        super(Helper.merge( {

            fields: {

                publicKey: {

                    type: "buffer",

                    minSize: 33,
                    maxSize: 33,

                    preprocessor(publicKey){
                        this._publicKeyHash = undefined;
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
                    minSize: 0,
                    specifyLength: true,

                    default: TxTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,

                    validation(value) {
                        return value.equals( TxTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    position : 102,
                },


                signature: {

                    type: "buffer",
                    minSize: 65,
                    maxSize: 65,

                    removeLeadingZeros: true, //it used useful when two inputs have the same publicKeyHash as the 2nd signature will be filled with zeros

                    position: 103,
                }

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: (b)=>b,
                },
            }

        }, schema, true));
    }

}

module.exports = {
    VinSchemaBuild,
    VinSchemaBuilt: new VinSchemaBuild()
}