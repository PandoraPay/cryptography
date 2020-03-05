import TransactionTokenCurrencyTypeEnum from "../base/tokens/transaction-token-currency-type-enum";

const {Helper} = global.kernel.helpers;
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;

import TransactionTypeEnum from "src/transactions/models/tx/base/transaction-type-enum";
import TransactionScriptTypeEnum from "src/transactions/models/tx/base/transaction-script-type-enum";

import BaseTransaction from "./../base/base-transaction";
import Vin from "./parts/vin";
import Vout from "./parts/vout";

export default class SimpleTransaction extends BaseTransaction {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                version: {

                    default: TransactionTypeEnum.PUBLIC_TRANSACTION,

                    validation(version){
                        return version === TransactionTypeEnum.PUBLIC_TRANSACTION;
                    }

                },

                scriptVersion:{

                    default: TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION,

                    validation(script){
                        return script === TransactionScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION;
                    }
                },

                tokenCurrency: {

                    type: "buffer",
                    maxSize: 20,
                    minSize: 1,

                    default: TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,

                    validation(value) {
                        return value.equals( TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    position : 1000,
                },

                vin:{
                    type: "array",
                    classObject: Vin,

                    minSize: 1,
                    maxSize: 255,

                    validation(vin){

                        //verify if all vins are unique
                        const map = {};
                        for (let i=0; i < vin.length; i++){

                            const publicKey = vin[i].publicKey.toString("hex");

                            if (map[publicKey]) throw new Exception(this, "vin contains identical inputs", vin[i]  );
                            map[publicKey] = true;
                        }

                        return true;
                    },

                    position: 1001,

                },

                nonce: {
                    type: "number",

                    position: 1002,
                },

                vout:{
                    type: "array",

                    classObject: Vout,

                    minSize: 1,
                    maxSize: 255,

                    validation(vout){

                        const map = {};

                        for (let i=0; i < this.vin.length; i++){
                            const publicKeyHash = this.vin[i].publicKeyHash.toString("hex");

                            if (map[publicKeyHash]) throw new Exception(this, "vin contains identical inputs", this.vin[i] );
                            map[publicKeyHash] = true;
                        }

                        for (let i=0; i < vout.length; i++){
                            const publicKeyHash = vout[i].publicKeyHash.toString("hex");

                            if (map[publicKeyHash]) throw new Exception(this, "vout contains identical outputs", vout[i] );
                            map[publicKeyHash] = true;
                        }

                        return true;
                    },

                    position: 1003,

                },

            }

        }, schema, false), data, type, creationOptions);

    }

    signTransaction( privateKeys ){

        const buffer = this.prefixBufferForSignature();

        if (privateKeys.length !== this.vin.length) throw new Exception(this, "privateKeys array must have vin length", this.vin.length);

        const signatures = {};

        for (let i=0; i < this.vin.length; i++){

            if (!privateKeys[i]) continue;

            const vin = this.vin[i];

            const out = this._scope.cryptography.cryptoSignature.sign( buffer, privateKeys[i].privateKey );
            if (!out) throw new Exception(this, "Signature invalid", vin.toJSON() );

            signatures[i] = out;

            vin.signature = out;

        }

        return signatures;

    }

    verifyTransactionSignatures(){

        const buffer = this.prefixBufferForSignature();

        for (const vin of this.vin){

            const out = this._scope.cryptography.cryptoSignature.verify( buffer, vin.signature, vin.publicKey );
            if (!out) throw new Exception(this, "Signature invalid", vin.toJSON() );

        }

        return true;

    }

    sumOut(){

        let sum = 0;
        for (const out of this.vout)
            sum += out.amount ;

        return sum;
    }

    sumIn(){

        let sum = 0;
        for (const out of this.vin)
            sum += out.amount ;

        return sum;
    }


    get fee(){
        return this.sumIn() - this.sumOut();
    }

    noOuts(){
        return this.vout.length;
    }

    prefixBufferForSignature(){

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
                },
                vout: true,
            }

        } );

        return buffer;

    }

    toJSONRaw(){

        const json = this.toJSON( );

        for (let i=0; i < json.vin.length; i++)
            json.vin[i].address = this.vin[i].address;


        for (let j=0; j < json.vout.length; j++)
            json.vout[j].address = this.vout[j].address;

        return json;

    }

}

