import TransactionTokenCurrencyTypeEnum from "../../base/tokens/transaction-token-currency-type-enum";

const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;

export default class ZetherVin extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

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

                // public key is made from two separate public keys
                zetherPublicKey: {
                    type: "buffer",
                    fixedBytes: 64,

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

        }, schema, false), data, type, creationOptions);


    }

}

