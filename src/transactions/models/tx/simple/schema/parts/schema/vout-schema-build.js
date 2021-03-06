const {SchemaBuild} = PandoraLibrary.marshal;
const {Helper, Exception} = PandoraLibrary.helpers;

const TxTokenCurrencyTypeEnum = require( "../../../../base/schema/tokens/tx-token-currency-type-enum");

class VoutSchemaBuild extends SchemaBuild {

    constructor(schema) {

        super(Helper.merge({

            fields: {

                publicKeyHash: {

                    type: "buffer",

                    minSize: 20,
                    maxSize: 20,

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
                    minSize: 0,
                    specifyLength: true,

                    default: TxTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,

                    validation(value) {
                        return value.equals( TxTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    position : 102,
                },



            },

            options: {
                hashing: {
                    fct: b => b,
                },
            },

            saving:{
                storeDataNotId: true,
            },

        }, schema, true ));
    }

}

module.exports = {
    VoutSchemaBuild,
    VoutSchemaBuilt: new VoutSchemaBuild(),
}