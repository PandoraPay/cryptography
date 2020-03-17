const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import Vout from "../simple/parts/vout";
import Zether from "zetherjs"
import ZetherTransferFee from "./parts/zether-transfer-fee";
import ZetherPointBuffer from "./parts/zether-point-buffer"

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

                y: {
                    type: "array",
                    classObject: ZetherPointBuffer,
                    minSize: 2,
                    maxSize: 255,

                    position: 2000,
                },

                C: {
                    type: "array",
                    classObject: ZetherPointBuffer,
                    minSize: 2,
                    maxSize: 255,

                    position: 2001,
                },

                D: {
                    type: "buffer",
                    fixedBytes: 64,

                    position: 2002,
                },

                u: {
                    type: "buffer",
                    fixedBytes: 64,

                    position: 2003,
                },

                proof:{
                    type: "buffer",
                    minSize: 1024,
                    maxSize: 10*1024,
                    position: 2004,
                },

                whisperSender:{
                    type: "buffer",
                    fixedBytes: 32,
                    position: 2005,
                },

                whisperReceiver:{
                    type: "buffer",
                    fixedBytes: 32,
                    position: 2006,
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

        const C = this.C.map( it => Zether.bn128.unserializeFromBuffer(it.buffer) );
        const y = this.y.map( it => Zether.bn128.unserializeFromBuffer(it.buffer) );
        const D = Zether.bn128.unserializeFromBuffer(this.D);
        const u = Zether.bn128.unserializeFromBuffer(this.u);

        const verify = chainData.zsc.transfer(  C, D, y, u, this.proof);
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

        let notRegistered = 0;
        for (let i=0; i < y.length; i++){

            const account = unserialized[i];

            if (account[0].eq( Zether.bn128.zero) && account[1].eq( Zether.bn128.zero )  )
                notRegistered += 1;
        }

        if (notRegistered !== this.registrations.length)
            throw new Error("Please make sure all parties (including decoys) are registered."); // todo: better error message, i.e., which friend?


        const r = Zether.bn128.randomScalar();
        let C = y.map((party, i) => Zether.bn128.curve.g.mul(i === index[0] ? new BN(-amount) : i === index[1] ? new BN( amount ) : new BN(0)).add( party.mul(r)));

        let D = Zether.bn128.curve.g.mul(r);
        let CLn = unserialized.map((account, i) =>  account[0].add( C[i] ));
        let CRn = unserialized.map((account) => account[1].add( D ));

        const proof = Zether.Service.proveTransfer( CLn, CRn, C, D, y, lastRollOver, accountKeyPair.x, r, amount, totalBalanceAvailable - amount, index);
        const u = Zether.utils.u(lastRollOver, accountKeyPair.x);

        //whisper the value to the receiver
        let v = Zether.utils.hash( Zether.bn128.representation( y[ index[1] ].mul( r )  ));
        v = v.redAdd( new BN(amount).toRed( Zether.bn128.q) );

        //whisper the value to the receiver
        let v2 = Zether.utils.hash( Zether.bn128.representation( D.mul(  accountKeyPair.x ) ) );
        v2 = v2.redAdd( new BN(amount).toRed( Zether.bn128.q) );

        this.y = y.map( (it, i) => this._createSchemaObject( {buffer: Zether.bn128.serializeToBuffer(it, i)}, "object", 'y', undefined, i) );
        this.C = C.map( (it, i) => this._createSchemaObject( {buffer: Zether.bn128.serializeToBuffer(it, i)}, "object", 'C', undefined, i) );
        this.D = Zether.bn128.serializeToBuffer(D);
        this.proof = Buffer.from( proof.slice(2), 'hex');
        this.u = Zether.bn128.serializeToBuffer(u);
        this.whisperSender = Zether.bn128.toBuffer(v2);
        this.whisperReceiver = Zether.bn128.toBuffer(v);

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

