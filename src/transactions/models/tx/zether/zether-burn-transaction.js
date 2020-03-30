import ZetherVoutDeposit from "./parts/zether-vout-deposit";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import Vout from "../simple/parts/vout";
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

                zetherInput: {
                    type: "object",
                    classObject: ZetherVoutDeposit,
                    position: 1003,
                },

                vout: {

                    classObject: Vout,
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

    sumIn(input = this.vin){
        const sumIn = super.sumIn(input);

        const tokenCurrency = this.zetherInput.tokenCurrency.toString('hex');
        if (!sumIn[tokenCurrency]) sumIn[tokenCurrency] = 0;

        sumIn[tokenCurrency] += this.zetherInput.amount;

        return sumIn;
    }

    async transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        const y =  Zether.bn128.unserializeFromBuffer(this.zetherInput.zetherPublicKey);

        const verify = await chainData.zsc.burn( y, this.zetherInput.amount, Zether.bn128.unserializeFromBuffer(this.u), this.proof, '0x'+this.vout[0].publicKeyHash.toString('hex') );
        if (!verify) throw new Exception(this, "Burn verification failed");

        return true;
    }

    async createZetherBurnProof( zetherPrivateAddress, totalBalanceAvailable, chain = this._scope.mainChain, chainData = chain.data ){

        const y =  Zether.bn128.unserializeFromBuffer(this.zetherInput.zetherPublicKey);

        const lastRollOver = chainData.getEpoch();

        let result = await chainData.zsc.simulateAccounts( [y], chainData.getEpoch() );

        const simulated = result[0];
        const CLn = simulated[0].add( Zether.bn128.curve.g.mul( new BN( - this.zetherInput.amount ) ));
        const CRn = simulated[1];

        const proof = Zether.Service.proveBurn(CLn, CRn, y, lastRollOver, '0x'+this.vout[0].publicKeyHash.toString('hex'), Zether.utils.BNFieldfromHex( zetherPrivateAddress.privateKey ), totalBalanceAvailable - this.zetherInput.amount );
        const u = Zether.utils.u( lastRollOver, Zether.utils.BNFieldfromHex(zetherPrivateAddress.privateKey) );

        this.proof = Buffer.from( proof.slice(2), 'hex');
        this.u = Zether.bn128.serializeToBuffer(u);

    }

    _fieldsForSignature(){
        return {
            ...super._fieldsForSignature(),
            zetherInput: true,
            u: true,
            proof: true,
        }
    }

    get getVinPublicKeyHash(){
        return this.vin.length ? this.vin[0].publicKeyHash : undefined;
    }

}

