import ZetherRegistrationIndex from "./parts/zether-registration-index";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import SimpleTransaction from "./../simple/simple-transaction";
import Vout from "../simple/parts/vout";
import Zether from "zetherjs"
import ZetherTransferFee from "./parts/zether-transfer-fee";
import ZetherPointBuffer from "./parts/zether-point-buffer"

const {BN} = global.kernel.utils;

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

                y: {
                    type: "array",
                    classObject: ZetherPointBuffer,
                    minSize: 2,
                    maxSize: 255,

                    position: 2000,
                },

                registrations:{

                    type: "array",
                    classObject: ZetherRegistrationIndex,

                    minSize: 0,
                    maxSize: 255,

                    validation(registrations){
                        for (let i=0; i <registrations.length; i++)
                            if (registrations[i].index < 0 || registrations[i].index > this.y.length )
                                throw new Exception(this, "index invalid for registration", {index: registrations[i].index});

                        return true;
                    },

                    position: 2001,
                },


                C: {
                    type: "array",
                    classObject: ZetherPointBuffer,
                    minSize: 2,
                    maxSize: 255,

                    validation(C){
                        return C.length === this.y.length;
                    },

                    position: 2002,
                },

                D: {
                    type: "buffer",
                    fixedBytes: 64,

                    position: 2003,
                },

                u: {
                    type: "buffer",
                    fixedBytes: 64,

                    position: 2004,
                },

                proof:{
                    type: "buffer",
                    minSize: 1024,
                    maxSize: 10*1024,
                    position: 2005,
                },

                whisperSender:{
                    type: "buffer",
                    fixedBytes: 32,
                    position: 2006,
                },

                whisperReceiver:{
                    type: "buffer",
                    fixedBytes: 32,
                    position: 2007,
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

    async transactionAddedToZether(chain = this._scope.mainChain, chainData = chain.data){

        const C = this.C.map( it => Zether.bn128.unserializeFromBuffer(it.buffer) );
        const y = this.y.map( it => Zether.bn128.unserializeFromBuffer(it.buffer) );
        const D = Zether.bn128.unserializeFromBuffer(this.D);
        const u = Zether.bn128.unserializeFromBuffer(this.u);

        for (const registration of this.registrations){

            const yHash = Zether.utils.keccak256( '0x'+this.y[ registration.index ].toString('hex') );
            if ( await chainData.zsc.registered(yHash) === false )
                await chainData.zsc.register( y[ registration.index ], Zether.utils.BNFieldfromHex( registration.c), Zether.utils.BNFieldfromHex( registration.s ) );

        }

        const verify = await chainData.zsc.transfer(  C, D, y, u, this.proof);
        if (!verify) throw new Exception(this, "Transfer verification failed");

        return true;
    }

    async createZetherTransferProof( zetherPrivateAddress, zetherDestinationAddress, amount, decoys = [], totalBalanceAvailable, registrations = [], chain = this._scope.mainChain, chainData = chain.data ){

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

        for (let i=0; i < registrations.length; i++)
            registrations[i].publicKeyBN = Zether.bn128.unserializeFromBuffer(registrations[i].publicKey);

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

        const registrationsFinal = [];
        for (let i=0; i < y.length; i++){

            const yHash = Zether.utils.keccak256( Zether.utils.encodedPackaged( Zether.bn128.serialize( y[i] ) ) );
            if ( await chainData.zsc.registered(yHash) === false ){

                let found = -1;
                for (let j=0; j < registrations.length; j++)
                    if (registrations[j].publicKeyBN.eq( y[ i ]) ){
                        found = j;
                        break;
                    }

                if (found === -1 )
                    throw new Exception(this, "Please make sure all parties (including decoys) are registered.", {}); // todo: better error message, i.e., which friend?

                registrationsFinal.push(this._createSchemaObject({
                    index: i,
                    c: registrations[found].c,
                    s: registrations[found].s,
                }, "object", 'registrations' ));

            }

        }

        if (registrationsFinal.length > registrations.length ) throw new Exception(this, "Too many registrations");
        if (registrationsFinal.length < registrations.length ) throw new Exception(this, "Too few registrations");

        const lastRollOver = chainData.getEpoch();

        let unserialized = await chainData.zsc.simulateAccounts( y, chainData.getEpoch() );

        //extra: simulate registrations
        for (let i=0; i < unserialized.length; i++)
            if ( unserialized[i][0].eq( Zether.bn128.zero) && unserialized[i][1].eq( Zether.bn128.zero) ){
                unserialized[i] = [ y[i], Zether.utils.g()  ]
            }

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
        this.registrations = registrationsFinal;
        this.whisperSender = Zether.bn128.toBuffer(v2);
        this.whisperReceiver = Zether.bn128.toBuffer(v);

    }

    fillRegistrations(registrations){

        this.registrations = [];

        for (const registration of registrations){

            let found = -1;
            for (let i=0; i < this.y.length; i++)
                if (registration.publicKey.equals( this.y[i] )){
                    found = i;
                    break;
                }

            if (found === -1)
                throw new Exception(this, "Registration PublicKey was not found in the ring", {publicKey: registration.publicKey });

            this.pushArray("registrations", {
                index: found,
                c: registration.c,
                s: registration.s,
            }, "object",);

        }

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
                transferFee: true,
                vout: true,
                y: true,
                registrations: true,
                C: true,
                D: true,
                u: true,
                proof: true,
                whisperSender: true,
                whisperReceiver: true,
            }

        } );

        return buffer;
    }


    _match(a,b){
        return a.eq(b);
    }

}

