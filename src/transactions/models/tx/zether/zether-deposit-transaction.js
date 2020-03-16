import ZetherRegistration from "./parts/zether-registration";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import ZetherVoutDeposit from "./parts/zether-vout-deposit"

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
                    classObject: ZetherVoutDeposit,
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

                registration:{
                    type: "object",
                    classObject:ZetherRegistration,
                },

            }

        }, schema, false), data, type, creationOptions);

    }

    toJSONRaw(){

        const json = this.toJSON( );

        for (let i=0; i < json.vin.length; i++)
            json.vin[i].address = this.vin[i].address;

        return json;

    }

    transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        const zetherPubKey1 = Buffer.alloc(32);
        this.vout[0].zetherPublicKey.copy( zetherPubKey1,   0, 0,        32 );

        const zetherPubKey2 = Buffer.alloc(32);
        this.vout[0].zetherPublicKey.copy( zetherPubKey2,   0, 32,        64 );

        const zetherPublicKey = [
            '0x'+zetherPubKey1.toString('hex'),
            '0x'+zetherPubKey2.toString('hex'),
        ];

        if (this.registration.registered === 1){
            chainData.zsc.register( this._scope.cryptography.Zether.utils.G1PointArray(zetherPublicKey), this._scope.cryptography.Zether.utils.BNFieldfromHex( this.registration.c), this._scope.cryptography.Zether.utils.BNFieldfromHex( this.registration.s ) );
        }

        return chainData.zsc.fund( zetherPublicKey, this.vout[0].amount );

    }


}

