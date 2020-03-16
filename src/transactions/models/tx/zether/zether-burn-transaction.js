import ZetherVoutDeposit from "./parts/zether-vout-deposit";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import Vout from "../simple/parts/vout";

export default class ZetherBurnTransaction extends SimpleTransaction {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                scriptVersion:{

                    default: TransactionScriptTypeEnum.TX_SCRIPT_ZETHER_BURN ,

                    validation(script){
                        return script === TransactionScriptTypeEnum.TX_SCRIPT_ZETHER_BURN;
                    }
                },

                /**
                 * size === 1 means that the fee is
                 */
                vin: {
                    minSize: 0,
                    maxSize: 1,
                },

                zetherInput: {
                    classObject: ZetherVoutDeposit,
                    position: 1003,
                },

                vout: {

                    classObject: Vout,
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

                    position: 1004,
                },

            }

        }, schema, false), data, type, creationOptions);

    }

    sumIn(input = this.vin){
        const sumIn = super.sumIn(input);

        const tokenCurrency = this.zetherInput.tokenCurrency.toString('hex');
        if (!sumIn[tokenCurrency]) sumIn[tokenCurrency] = 0;

        sumIn[tokenCurrency] += this.zetherInput.amount;
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

            const y = this._scope.cryptography.Zether.utils.G1PointArray(zetherPublicKey);

            const yHash = this._scope.cryptography.Zether.utils.keccak256( this._scope.cryptography.Zether.utils.encodedPackaged( this._scope.cryptography.Zether.bn128.serialize( y ) ) );
            if ( !chainData.zsc.registered(yHash)  )
                chainData.zsc.register( y, this._scope.cryptography.Zether.utils.BNFieldfromHex( this.registration.c), this._scope.cryptography.Zether.utils.BNFieldfromHex( this.registration.s ) );
        }

        return chainData.zsc.fund( zetherPublicKey, this.vout[0].amount );

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
                zetherInput: true,
                vout: true,
            }

        } );

        return buffer;
    }


}

