import ZetherVoutDeposit from "./parts/zether-vout-deposit";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import Vout from "../simple/parts/vout";
import Zether from "zetherjs"
import TransactionTokenCurrencyTypeEnum from "../base/tokens/transaction-token-currency-type-enum";
import ZetherTransferFee from "./parts/zether-transfer-fee";
const {BN} = global.kernel.utils;

import ZetherPublicKeyRegistration from "./parts/zether-public-key-registration"

export default class ZetherTransferTransaction extends SimpleTransaction {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                scriptVersion:{

                    default: TransactionScriptTypeEnum.TX_SCRIPT_ZETHER_TRANSFER,

                    validation(script){
                        return script === TransactionScriptTypeEnum.TX_SCRIPT_ZETHER_TRANSFER;
                    }
                },

                /**
                 * size === 1 means that the fee is
                 */
                vin: {
                    minSize: 0,
                    maxSize: 1,
                },

                transferFee: {
                    type: "object",
                    classObject: ZetherTransferFee,

                    position: 1003,
                },

                vout: {

                    classObject: Vout,
                    minSize: 0,
                    maxSize: 0,
                    fixedBytes: 0,

                    validation(output){

                        const sumIn = this.sumIn(this.vin);
                        const sumOut = this.sumOut(output);

                        this.validateOuts(sumIn, sumOut);
                        this.validateFee(sumIn, sumOut);

                        return true;
                    },

                    position: 1004,
                },

                registrations:{

                    type: "array",
                    classObject: ZetherPublicKeyRegistration,

                    minSize: 0,
                    maxSize: 255,
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

        if (this.transferFee.subtractFeeEnabled === 1){

            const tokenCurrency = this.transferFee.feeTokenCurrency.toString('hex');
            if (!sumIn[tokenCurrency]) sumIn[tokenCurrency] = 0;

            sumIn[tokenCurrency] += this.transferFee.feeAmount;

        }

        return sumIn;
    }

    transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        const y =  Zether.bn128.unserializeFromBuffer(this.zetherInput.zetherPublicKey);

        const verify = chainData.zsc.burn( y, this.zetherInput.amount, Zether.bn128.unserializeFromBuffer(this.u), this.proof, '0x'+this.vout[0].publicKeyHash.toString('hex') );
        if (!verify) throw new Exception(this, "Burn verification failed");

        return true;
    }

    createZetherTransferProof( zetherPrivateAddress, zetherDestinationAddress, amount, decoys = [], totalBalanceAvailable, chain = this._scope.mainChain, chainData = chain.data ){

        const size = 2 + decoys.length;

        if (size & (size - 1)) {
            let previous = 1;
            let next = 2;
            while (next < size) {
                previous *= 2;
                next *= 2;
            }
            throw "Anonset's size (including you and the recipient) must be a power of two. Add " + (next - size) + " or remove " + (size - previous) + ".";
        }

        const accountKeyPair = {
            x: Zether.utils.BNFieldfromHex( zetherPrivateAddress.privateKey ),
            y: Zether.bn128.unserializeFromBuffer( zetherPrivateAddress.publicKey ),
        };

        const destinationPublicKey = Zether.bn128.unserializeFromBuffer( zetherDestinationAddress.publicKey );

        if ( this._match( destinationPublicKey, accountKeyPair.y  ) )
            throw "Sending to yourself is currently unsupported (and useless!).";

        const y = [ accountKeyPair.y, destinationPublicKey ]; // not yet shuffled
        for (const decoy of decoys)
            y.push(decoy);


        const index = [];
        let m = y.length;
        while (m !== 0) { // https://bost.ocks.org/mike/shuffle/
            const i = Math.floor(Math.random() * m--);
            const temp = y[i];
            y[i] = y[m];
            y[m] = temp;
            if (this._match(temp, accountKeyPair.y ))
                index[0] = m;
            else if (this._match(temp, destinationPublicKey))
                index[1] = m;
        } // shuffle the array of y's
        if (index[0] % 2 === index[1] % 2) {
            const temp = y[index[1]];
            y[index[1]] = y[index[1] + (index[1] % 2 === 0 ? 1 : -1)];
            y[index[1] + (index[1] % 2 === 0 ? 1 : -1)] = temp;
            index[1] = index[1] + (index[1] % 2 === 0 ? 1 : -1);
        } // make sure you and your friend have opposite parity


        const lastRollOver = chainData.getEpoch();

        let result = chainData.zsc.simulateAccounts( y, chainData.getEpoch() );

        const unserialized = result.map(account => account );

        if (unserialized.some((account) => account[0].eq( Zether.bn128.zero) && account[1].eq( Zether.bn128.zero )))
            throw new Error("Please make sure all parties (including decoys) are registered."); // todo: better error message, i.e., which friend?

        const r = Zether.bn128.randomScalar();
        let C = y.map((party, i) => Zether.bn128.curve.g.mul(i === index[0] ? new BN(-value) : i === index[1] ? new BN(value ) : new BN(0)).add( party.mul(r)));

        let D = Zether.bn128.curve.g.mul(r);
        let CLn = unserialized.map((account, i) =>  account[0].add( C[i] ));
        let CRn = unserialized.map((account) => account[1].add( D ));


        // const simulated = result[0];
        // const CLn = simulated[0].add( Zether.bn128.curve.g.mul( new BN( - this.zetherInput.amount ) ));
        // const CRn = simulated[1];
        //
        // const proof = Zether.Service.proveBurn(CLn, CRn, y, lastRollOver, '0x'+this.vout[0].publicKeyHash.toString('hex'), Zether.utils.BNFieldfromHex( zetherPrivateAddress.privateKey ), totalBalanceAvailable - this.zetherInput.amount );
        // const u = Zether.utils.u( lastRollOver, Zether.utils.BNFieldfromHex(zetherPrivateAddress.privateKey) );

        this.proof = Buffer.from( proof.slice(2), 'hex');
        this.u = Zether.bn128.serializeToBuffer(u);

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


    _match(a,b){
        return a.eq(b);
    }

}

