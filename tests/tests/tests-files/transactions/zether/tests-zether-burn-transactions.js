const {describe} = global.kernel.tests;

import ZetherDepositTransaction from "src/transactions/models/tx/zether/zether-deposit-transaction"
import ZetherBurnTransaction from "src/transactions/models/tx/zether/zether-burn-transaction"
import TransactionTokenCurrencyTypeEnum from "src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum";

export default async function run () {


    describe("Zether Burn Transaction", {

        "one input burn": async function () {

            this._scope.simpleChain.data.clearData();

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address = privateAddress.getAddress();
            const zetherPrivateAddress = privateAddress.getZetherPrivateAddress();
            const zetherAddress = zetherPrivateAddress.getZetherAddress();
            const zetherRegistration = zetherPrivateAddress.getZetherRegistration();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

            const tx = new ZetherDepositTransaction(this._scope, undefined, {

                vin: [ {
                    amount: 1000,
                    publicKey: privateAddress.publicKey,
                }],

                vout: [{
                    amount: 1000,
                    zetherPublicKey: zetherAddress.publicKey,
                }],

                registration:{
                    registered: 1,
                    c: zetherRegistration.c,
                    s: zetherRegistration.s,
                },

            } );

            await tx.signTransaction([ privateAddress ]);
            tx.transactionAddedToZether(this._scope.simpleChain);

            for (const fee of [0, 200]){

                const tx = new ZetherBurnTransaction(this._scope, undefined, {

                    vin: [ {
                        amount: 500 + fee,
                        publicKey: privateAddress.publicKey,
                    }],

                    zetherInput:{
                        amount: 500,
                        zetherPublicKey: zetherAddress.publicKey,
                    },

                    vout: [{
                        amount: 1000,
                        publicKeyHash: address2.publicKeyHash,
                    }],


                } );

                const feeOut = tx.fee();
                if (fee){

                    this.expect( typeof feeOut , "object");
                    this.expect( feeOut.tokenCurrency, TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
                    this.expect( feeOut.amount, fee);

                } else {
                    this.expect( feeOut , undefined);
                }

                const out = await tx.signTransaction([ privateAddress ]);

                this.expect( typeof out === "object", true);
                this.expect( out[0].length, 65 );

                const verification = tx.verifyTransactionSignatures( );

                this.expect( verification, true );

                tx.transactionAddedToZether(this._scope.simpleChain);

            }

        }
    });

}