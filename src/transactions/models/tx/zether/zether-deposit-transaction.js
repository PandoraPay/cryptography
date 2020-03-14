import SimpleTransaction from "../simple/simple-transaction";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;

import TransactionTypeEnum from "src/transactions/models/tx/base/transaction-type-enum";
import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";
import TransactionTokenCurrencyTypeEnum from "../base/tokens/transaction-token-currency-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";

export default class ZetherDepositTransaction extends SimpleTransaction {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                scriptVersion:{

                    default: TransactionScriptTypeEnum.TX_SCRIPT_ZETHER_DEPOSIT ,

                    validation(script){
                        return script === TransactionScriptTypeEnum.TX_SCRIPT_ZETHER_DEPOSIT;
                    }
                },

                tokenCurrency: {

                    type: "buffer",
                    maxSize: 20,
                    minSize: 1,

                    default: TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,

                    validation(value) {
                        return value.equals( TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    position : 1000,
                },

                /**
                 * size === 1 means that the fee is
                 */
                vin: {
                    minSize: 1,
                    maxSize: 2,
                },

                vout: {
                    minSize: 0,
                    maxSize: 0,
                    fixedBytes: 0,
                },

                proof: {
                    type: "buffer",

                    position: 2000,
                }

            }

        }, schema, false), data, type, creationOptions);

    }



}

