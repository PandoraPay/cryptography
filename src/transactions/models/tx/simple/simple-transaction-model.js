const {Helper} = require('kernel').helpers;
const {Exception, StringHelper, BufferHelper} = require('kernel').helpers;
const {CryptoHelper} = require('kernel').helpers.crypto;

const BaseTransactionModel = require( "../base/base-transaction-model");

const {SimpleTransactionSchemaBuilt} = require('./schema/simple-transaction-schema-build')

module.exports = class SimpleTransactionModel extends BaseTransactionModel {

    constructor(scope, schema= SimpleTransactionSchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

    _validateSpecialAddresses(input){

        for (const vin of input)
            if ( vin.publicKeyHash.equals(this._scope.argv.blockchain.genesis.BURN_PUBLIC_KEY_HASH) ||
                 vin.publicKeyHash.equals(this._scope.argv.blockchain.genesis.COINS_LOCKED_PUBLIC_KEY_HASH))
                throw new Exception(this, 'vin contains SPECIAL ADDRESSES');

        return true;
    }

    _validateMapUniqueness(input, propertyName = 'publicKeyHash'){

        const mapTokens = {};

        for (const vin of input){

            const publicKeyHash = vin[propertyName].toString('hex');
            const tokenCurrency = vin.tokenCurrency.toString('hex');

            if (!mapTokens[publicKeyHash]) mapTokens[publicKeyHash] = {};

            if (mapTokens[publicKeyHash][tokenCurrency] ) throw new Exception(this, 'vin input uses same currency twice', vin);
            mapTokens[publicKeyHash][tokenCurrency] = true;
        }

        return true;
    }

    signTransaction( privateKeys ){

        const buffer = this._prefixBufferForSignature();

        if (privateKeys.length !== this.vin.length) throw new Exception(this, "privateKeys array must have vin length", this.vin.length);

        const signatures = {};
        const alreadySigned = {};

        for (let i=0; i < this.vin.length; i++){

            if (!privateKeys[i]) continue;

            const vin = this.vin[i];
            const publicKeyHash = vin.publicKeyHash.toString('hex');

            if (alreadySigned[ publicKeyHash ]){
                signatures[i] = Buffer.alloc(65);
                continue;
            }

            const out = this._scope.cryptography.cryptoSignature.sign( buffer, privateKeys[i].privateKey );
            if (!out) throw new Exception(this, "Signature invalid", vin.toJSON() );

            signatures[i] = out;
            vin.signature = out;

            alreadySigned[publicKeyHash] = true;

        }

        return signatures;

    }

    verifyTransactionSignatures(){

        const buffer = this._prefixBufferForSignature();
        const alreadySigned = {};

        for (const vin of this.vin){

            const publicKeyHash = vin.publicKeyHash.toString('hex');
            if (alreadySigned[publicKeyHash]) continue;

            const out = this._scope.cryptography.cryptoSignature.verify( buffer, vin.signature, vin.publicKey );
            if (!out) throw new Exception(this, "Signature invalid", vin.toJSON() );

            alreadySigned[publicKeyHash] = true;
        }

        return true;

    }

    sumOut(vout = this.vout){

        let sum = {};
        for (const out of vout) {

            const tokenCurrency = out.tokenCurrency.toString('hex');
            if (!sum[tokenCurrency]) sum[tokenCurrency] = 0;

            sum[tokenCurrency] += out.amount;
        }

        return sum;
    }

    sumIn(vin = this.vin){

        let sum = {};
        for (const input of vin) {

            const tokenCurrency = input.tokenCurrency.toString('hex');
            if (!sum[tokenCurrency]) sum[tokenCurrency] = 0;

            sum[tokenCurrency] += input.amount;
        }

        return sum;
    }

    validateOuts(sumIn, sumOut){

        if (!sumIn) sumIn = this.sumIn();
        if (!sumOut) sumOut = this.sumOut();

        for (const tokenCurrency in sumOut)
            if (!sumIn[tokenCurrency] || sumOut[tokenCurrency] > sumIn[tokenCurrency] ) throw new Exception(this, 'sumOut > sumIn', {tokenCurrency, sumOut: sumOut[tokenCurrency], sumIn: sumIn[tokenCurrency]});


        return true;
    }

    fee(sumIn, sumOut){

        if (!sumIn) sumIn = this.sumIn();
        if (!sumOut) sumOut = this.sumOut();

        const fees = {};

        let feeTokenCurrencies = 0, lastTokenCurrency;

        for (const tokenCurrency in sumIn )
            if (sumIn[tokenCurrency] && sumOut[tokenCurrency] === undefined ) {
                fees[tokenCurrency] = sumIn[tokenCurrency];
                feeTokenCurrencies += 1;
                lastTokenCurrency = tokenCurrency;
            }

        for (const tokenCurrency in sumOut)
            if (sumOut[tokenCurrency] < sumIn[tokenCurrency] ) {
                fees[tokenCurrency] = sumIn[tokenCurrency] - sumOut[tokenCurrency] ;
                feeTokenCurrencies += 1;
                lastTokenCurrency = tokenCurrency;
            }

        if (feeTokenCurrencies === 0) return undefined;
        if (feeTokenCurrencies === 1) return {
            tokenCurrency: lastTokenCurrency,
            amount: fees[lastTokenCurrency],
        };

        throw new Exception(this, 'too many fee token currencies', {feeTokenCurrencies});
    }



    validateFee(sumIn, sumOut){

        if (!sumIn) sumIn = this.sumIn();
        if (!sumOut) sumOut = this.sumOut();

        let feeTokenCurrencies = 0;

        for (const tokenCurrency in sumOut)
            if ( sumOut[tokenCurrency] < sumIn[tokenCurrency] )
                feeTokenCurrencies += 1;

        if (feeTokenCurrencies > 1) throw new Exception(this, 'too many fee token currencies', {feeTokenCurrencies});

        return true;
    }


    noOuts(){
        return this.vout.length;
    }

    _fieldsForSignature(){
        return {
            ...super._fieldsForSignature(),
            vin: {
                address: true,
                amount: true,
                tokenCurrency: true,
            },
            vout: true,
        }
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

