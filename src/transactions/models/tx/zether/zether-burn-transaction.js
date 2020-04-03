import ZetherVin from "./parts/zether-vin";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import Zether from "zetherjs"
const {BN} = global.kernel.utils;

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

                vinZether: {
                    type: "array",
                    classObject: ZetherVin,
                    minSize: 1,
                    maxSize: 1,
                    fixedBytes: 1,

                    validation(vinZether){
                        return vinZether.length === 1;
                    },

                    position: 1003,
                },

                vout: {

                    minSize: 1,
                    maxSize: 1,
                    fixedBytes: 1,

                    validation(output){

                        const sumIn = this.sumIn(this.vin);
                        const sumOut = this.sumOut(output);

                        this.validateOuts(sumIn, sumOut);
                        this.validateFee(sumIn, sumOut);

                        return true;
                    },

                    position: 1004,
                },

                u: {
                    type: "buffer",
                    fixedBytes: 64,

                    position: 2000,
                },

                proof:{
                    type: "buffer",
                    minSize: 100,
                    maxSize: 2*1024,
                    position: 2001,
                },

            }

        }, schema, false), data, type, creationOptions);

    }

    sumIn(input = this.vin, vin){
        const sumIn = super.sumIn(input);

        const tokenCurrency = this.vinZether[0].tokenCurrency.toString('hex');
        if (!sumIn[tokenCurrency]) sumIn[tokenCurrency] = 0;
        sumIn[tokenCurrency] += this.vinZether[0].amount;

        return sumIn;
    }

    async transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        for (const vinZether of this.vinZether) {
            const y = Zether.bn128.unserializeFromBuffer( vinZether.zetherPublicKey);

            const verify = await chainData.zsc.burn(y, vinZether.amount, Zether.bn128.unserializeFromBuffer(this.u), this.proof, '0x' + this.vout[0].publicKeyHash.toString('hex'));
            if (!verify) throw new Exception(this, "Burn verification failed");
        }

        return true;
    }

    async createZetherBurnProof( zetherPrivateAddress, totalBalanceAvailable, chain = this._scope.mainChain, chainData = chain.data ){

        const y =  Zether.bn128.unserializeFromBuffer( this.vinZether[0].zetherPublicKey);

        const lastRollOver = chainData.getEpoch();

        let result = await chainData.zsc.simulateAccounts( [y], chainData.getEpoch() );

        const simulated = result[0];
        const CLn = simulated[0].add( Zether.bn128.curve.g.mul( new BN( - this.vinZether[0].amount ) ));
        const CRn = simulated[1];

        const proof = Zether.Service.proveBurn(CLn, CRn, y, lastRollOver, '0x'+this.vout[0].publicKeyHash.toString('hex'), Zether.utils.BNFieldfromHex( zetherPrivateAddress.privateKey ), totalBalanceAvailable - this.vinZether[0].amount );
        const u = Zether.utils.u( lastRollOver, Zether.utils.BNFieldfromHex(zetherPrivateAddress.privateKey) );

        this.proof = Buffer.from( proof.slice(2), 'hex');
        this.u = Zether.bn128.serializeToBuffer(u);

    }

    _fieldsForSignature(){
        return {
            ...super._fieldsForSignature(),
            vinZether: true,
            u: true,
            proof: true,
        }
    }



}

