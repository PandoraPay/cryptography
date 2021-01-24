const TransactionTokenCurrencyTypeEnum = require( "../../base/tokens/transaction-token-currency-type-enum");

const {Helper} = require('kernel').helpers;
const {DBSchema} = require('kernel').marshal.db;
const {Exception, StringHelper, BufferHelper} = require('kernel').helpers;

module.exports = class Vout extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

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

        }, schema, false), data, type, creationOptions);


    }

    get address(){
        if (this._address)
            this._address = this._scope.cryptography.addressGenerator.generateAddressFromPublicKeyHash( this.publicKeyHash ).calculateAddress();

        return this._address;
    }

}

