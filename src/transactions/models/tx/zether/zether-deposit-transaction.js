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

                vout: {

                    minSize: 0,
                    maxSize: 0,
                    fixedBytes: 0,

                    validation(output){
                        return output.length === 0;
                    },

                },

                voutZether:{
                    type: "array",
                    classObject: ZetherVoutDeposit,
                    minSIze: 1,
                    maxSize: 255,
                    fixedBytes: 1,

                    validation(voutZether){

                        if ( this._validateMapUniqueness(voutZether, 'zetherPublicKey') !== true) throw new Exception(this, "vin validation failed");

                        const sumIn = this.sumIn(this.vin);
                        const sumOut = this.sumOut(voutZether);

                        this.validateOuts(sumIn, sumOut);
                        this.validateFee(sumIn, sumOut);

                        return true;

                    },

                    position: 1004,
                },


            }

        }, schema, false), data, type, creationOptions);

    }

    sumOut(vout = this.voutZether){

        return super.sumOut(vout);

    }

    async transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        for (let i=0; i < this.voutZether.length; i++){

            const voutZether = this.voutZether[i];

            const y =  Zether.bn128.unserializeFromBuffer( voutZether.zetherPublicKey);

            if (voutZether.registration.registered === 1){

                const yHash = Zether.utils.keccak256( Zether.utils.encodedPackaged( Zether.bn128.serialize( y ) ) );
                if ( await chainData.zsc.registered(yHash) !== true )
                    await chainData.zsc.register( y, Zether.utils.BNFieldfromHex( voutZether.registration.c), Zether.utils.BNFieldfromHex( voutZether.registration.s ) );
                else
                    throw new Exception(this, "Account already registered");
            }


            if (await chainData.zsc.fund( y, voutZether.amount ) !== true) throw new Exception(this, "Deposit verification failed");

        }

        return true;
    }

    _fieldsForSignature(){
        return {
            ...super._fieldsForSignature(),
            registration: true,
        }
    }

    toJSONRaw(){

        const json = this.toJSON( );

        for (let i=0; i < json.vin.length; i++)
            json.vin[i].address = this.vin[i].address;

        return json;

    }

}

