const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionTypeEnum from "src/transactions/models/tx/base/transaction-type-enum";
import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";
import TransactionTokenCurrencyTypeEnum from "../base/tokens/transaction-token-currency-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import VoutZetherDeposit from "./parts/vout-zether-deposit"

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

                /**
                 * size === 1 means that the fee is
                 */
                vin: {
                    minSize: 1,
                    maxSize: 2,
                },

                vout: {
                    classObject: VoutZetherDeposit,
                    minSize: 1,
                    maxSize: 1,
                    fixedBytes: 1,

                    validation(output){

                        const sumIn = {}, sumOut = {};

                        for (const vout of output){
                            const tokenCurrency = vout.tokenCurrency.toString('hex');
                            sumOut[tokenCurrency] = (sumOut[tokenCurrency] || 0) + vout.amount;
                        }

                        for (const vin of this.vin){
                            const tokenCurrency = vin.tokenCurrency.toString('hex');
                            sumIn[tokenCurrency] = (sumIn[tokenCurrency] || 0) + vin.amount;
                        }

                        this.validateOuts(sumIn, sumOut);
                        this.validateFee(sumIn, sumOut);

                        const fee = this.fee(sumIn, sumOut);
                        if (this.vin.length === 2 && !fee ) throw new Exception(this, 'One output needs to be fee');

                        return true;
                    },

                },

                // public key is made from two separate public keys
                zetherPublicKey: {
                    type: "buffer",
                    fixedBytes: 64,

                    position: 2000,
                }

            }

        }, schema, false), data, type, creationOptions);

    }

    toJSONRaw(){

        const json = this.toJSON( );

        for (let i=0; i < json.vin.length; i++)
            json.vin[i].address = this.vin[i].address;

        return json;

    }

    transactionAddedToZether(zsc = this._scope.zsc){

        const zetherPubKey1 = Buffer.alloc(32);
        this.zetherPublicKey.copy( outputzetherPubKey1,   0, 0,        32 );

        const zetherPubKey2 = Buffer.alloc(32);
        this.zetherPublicKey.copy( zetherPubKey2,   0, 32,        64 );

        const zetherPublicKey = [
            '0x'+zetherPubKey1.toString('hex'),
            '0x'+zetherPubKey2.toString('hex'),
        ];

        return zsc.fund( zetherPublicKey, value);

    }


}

