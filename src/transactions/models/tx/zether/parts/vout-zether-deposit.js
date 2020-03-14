import TransactionTokenCurrencyTypeEnum from "../../base/tokens/transaction-token-currency-type-enum";

const {CryptoHelper} = global.kernel.helpers.crypto;
const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

export default class VoutZetherDeposit extends DBSchema {

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

