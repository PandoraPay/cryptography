import TransactionTokenCurrencyTypeEnum from "../../base/tokens/transaction-token-currency-type-enum";

const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;

export default class ZetherTransferFee extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                subtractFeeEnabled:{

                    type: "number",

                    validation(subtract){
                        return subtract === 0 || subtract === 1;
                    },

                    position: 100,
                },

                feeAmount: {

                    type: "number",

                    skipMarshal(){
                        return this.__data.subtractFeeEnabled === 1 ? false : true;
                    },

                    skipSaving(){
                        return this.__data.subtractFeeEnabled === 1 ? false : true;
                    },

                    position : 101,
                },

                feeTokenCurrency: {

                    type: "buffer",
                    default: TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,
                    maxSize: 20,
                    minSize: 1,

                    validation(value) {
                        return value.equals( TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    skipMarshal(){
                        return this.__data.subtractFeeEnabled === 1 ? false : true;
                    },

                    skipSaving(){
                        return this.__data.subtractFeeEnabled === 1 ? false : true;
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
            },

            saving: {
                storeDataNotId: true,
            }

        }, schema, false), data, type, creationOptions);


    }

}

