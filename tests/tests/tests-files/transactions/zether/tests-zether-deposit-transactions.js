const {BufferHelper} = global.kernel.helpers;

const {describe} = global.kernel.tests;

import ZetherDepositTransaction from "src/transactions/models/tx/zether/zether-deposit-transaction"
import TransactionTokenCurrencyTypeEnum from "src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum";

export default async function run () {


    describe("Zether Deposit Transaction", {

        "one input deposit": async function () {

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address = privateAddress.getAddress();
            const zetherPrivateAddress = privateAddress.getZetherPrivateAddress();
            const zetherAddress = zetherPrivateAddress.getZetherAddress();
            const zetherRegistration = zetherPrivateAddress.getZetherRegistration();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

            for (const fee of [0, 200]){


                const tx = new ZetherDepositTransaction(this._scope, undefined, {

                    vin: [ {
                        amount: 1000,
                        publicKey: privateAddress.publicKey,
                        }
                    ],

                    vout: [{
                        amount: fee ? 1000 : 1000 -fee,
                        zetherPublicKey: zetherAddress.publicKey,
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