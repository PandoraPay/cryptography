import ZetherRegistration from "./parts/zether-registration";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import ZetherVoutDeposit from "./parts/zether-vout-deposit"
import Zether from "zetherjs"

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



    async transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        const y =  Zether.bn128.unserializeFromBuffer(this.vout[0].zetherPublicKey);

        if (this.registration.registered === 1){

            const yHash = Zether.utils.keccak256( Zether.utils.encodedPackaged( Zether.bn128.serialize( y ) ) );
            if ( await chainData.zsc.registered(yHash) === false )
                await chainData.zsc.register( y, Zether.utils.BNFieldfromHex( this.registration.c), Zether.utils.BNFieldfromHex( this.registration.s ) );
            else
                throw new Exception(this, "Account already registered");
        }

        const verify = chainData.zsc.fund( y, this.vout[0].amount );
        if (!verify) throw new Exception(this, "Deposit verification failed");

        return true;
    }


    _prefixBufferForSignature(){
        //const hash
        const buffer = this.toBuffer( undefined, {

            onlyFields:{
                version: true,
                scriptVersion: true,
                unlockTime: true,
                nonce: true,
                vin: {
                    address: true,
                    amount: true,
                    tokenCurrency: true,
                },
                vout: true,
                registration: true
            }

        } );

        return buffer;
    }


    toJSONRaw(){

        const json = this.toJSON( );

        for (let i=0; i < json.vin.length; i++)
            json.vin[i].address = this.vin[i].address;

        return json;

    }

}

