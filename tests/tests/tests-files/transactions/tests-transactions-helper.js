const {Exception, StringHelper, BufferHelper} = require('kernel').helpers;

module.exports = class TestsTransactionsHelper{

    constructor(scope){
        this._scope = scope;
    }

    distributeAmount(amount, count){

        if (!count) count = Math.floor( Math.random() * 5 )+2;

        let done = false;
        while (!done){

            const amountsValue = Math.floor( amount /  count);
            const amounts = [];

            let sum = amount - amountsValue * count;

            for (let i=0; i < count; i++) {

                amounts[i] = amountsValue;

                let diff;

                switch (Math.floor( Math.random()*2)){

                    case 0:
                        diff = Math.floor( amounts[i] / 2 );

                        if (amounts[i] > diff) {
                            amounts[i] -= diff;
                            sum += diff;
                        }

                        break;

                    case 1:
                        diff = Math.floor( sum / 2);
                        amounts[i] += diff;
                        sum -= diff;

                        break;
                }

            }

            if (sum > 0) {
                amounts[amounts.length-1] += sum;
                sum = 0;
            }


            done = true;
            for (let i=0; i < amounts.length; i++)
                if (amounts[i] <= 0)
                    done = false;

            if (done)
                return amounts;

        }

    }

    distributeAmountVout(  amount, count, networkByte ){

        if (!count) count = Math.floor( Math.random() * 5 )+2;

        const amounts = this.distributeAmount( amount );

        const outsPrivateKeys = [];
        const vout = [];
        for (let i=0; i < amounts.length; i++) {

            outsPrivateKeys.push( this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress );

            const address = outsPrivateKeys[i].getAddress( networkByte );

            vout.push({
                address: address,
                amount: amounts[i],
            });
        }

        return {
            vout,
            outsPrivateKeys,
            amounts,
        }

    }



}
