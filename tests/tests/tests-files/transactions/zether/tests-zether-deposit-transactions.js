const {describe} = global.kernel.tests;

import ZetherDepositTransaction from "src/transactions/models/tx/zether/zether-deposit-transaction"
import TransactionTokenCurrencyTypeEnum from "src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum";

export default async function run () {


    describe("Zether Deposit Transaction", {

        "one input deposit": async function () {

            this._scope.simpleChain.data.clearData();

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address = privateAddress.getAddress();
            const zetherPrivateAddress = privateAddress.getZetherPrivateAddress();
            const zetherAddress = zetherPrivateAddress.getZetherAddress();
            const zetherRegistration = zetherPrivateAddress.getZetherRegistration();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

            let step = -1;
            for (const fee of [0, 200]){

                step++;
                const tx = new ZetherDepositTransaction(this._scope, undefined, {

                    vin: [ {
                        amount: 1000,
                        publicKey: privateAddress.publicKey,
                    }],

                    vout: [{
                        amount: fee ? 1000 - fee : 1000,
                        zetherPublicKey: zetherAddress.publicKey,
                    }],

                    registration: step ? undefined : {
                        registered: 1,
                        c: zetherRegistration.c,
                        s: zetherRegistration.s,
                    } ,

                } );

                const feeOut = tx.fee();
                if (fee){

                    this.expect( typeof feeOut , "object");
                    this.expect( feeOut.tokenCurrency, TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
                    this.expect( feeOut.amount, fee);

                } else
                    this.expect( feeOut , undefined);


                await tx.signTransaction([ privateAddress ]);
                this.expect( tx.verifyTransactionSignatures( ), true );

                tx.transactionAddedToZether(this._scope.simpleChain);

            }

        }
    });

}