const {Helper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;
const {DBSchema} = global.kernel.marshal.db;
const {Exception, StringHelper, BufferHelper, EnumHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "./transaction-script-type-enum"
import TransactionTokenCurrencyTypeEnum from "./tokens/transaction-token-currency-type-enum"
import TransactionTypeEnum from "./transaction-type-enum"

export default class BaseTransaction extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                version: {

                    type: "number",
                    fixedBytes: 1,

                    default: TransactionTypeEnum.PUBLIC_TRANSACTION,

                    validation(value){
                        return value === TransactionTypeEnum.PUBLIC_TRANSACTION;
                    },

                    position: 100,

                },

                scriptVersion:{
                    type: "number",
                    fixedBytes:  1,

                    default: TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION,

                    validation(value){
                        return value === TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION;
                    },

                    position: 101,
                },

                unlockTime: {

                    type: "number",

                    default: 0,

                    position: 102,
                },

                tokenCurrency: {

                    type: "buffer",
                    maxSize: 20,
                    minSize: 1,

                    default: Buffer.from( TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id, "hex"),

                    validation(value){

                        let tokenCurrencyString = value.toString("hex");
                        return EnumHelper.validateEnum(tokenCurrencyString, TransactionTokenCurrencyTypeEnum );
                    },

                    position : 103,
                },

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: CryptoHelper.dkeccak256,
                },
            }

        }, schema, false), data, type, creationOptions);

    }

    signTransaction(  ){
        throw new Exception(this, "signTransaction is not defined");
    }

    async verify(chain = this._scope.chain){

        if (this.unlockTime)
            if (this.unlockTime < chain.height)
                throw new Exception (this, "Unlock time is invalid");

        const signature = this.verifyTransactionSignatures();
        if (!signature) throw new Exception(this, "Signature verification failed");

        return true;

    }

    verifyTransactionSignatures(){
        throw new Exception(this, "verifyTransaction is not defined");
    }

    get fee(){
        return 0;
    }

    noOuts(){
        return 0;
    }

}

