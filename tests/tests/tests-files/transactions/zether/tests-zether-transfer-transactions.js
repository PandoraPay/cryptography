const {describe} = global.kernel.tests;

import ZetherDepositTransaction from "src/transactions/models/tx/zether/zether-deposit-transaction"
import ZetherTransferTransaction from "src/transactions/models/tx/zether/zether-transfer-transaction"
import TransactionTokenCurrencyTypeEnum from "src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum";

export default async function run () {


    describe("Zether Trasnfer Transaction", {

        "one input burn": async function () {

            this._scope.simpleChain.data.clearData();

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const zetherPrivateAddress = privateAddress.getZetherPrivateAddress();
            const zetherAddress = zetherPrivateAddress.getZetherAddress();
            const zetherRegistration = zetherPrivateAddress.getZetherRegistration();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const zetherPrivateAddress2 = privateAddress2.getZetherPrivateAddress();
            const address2 = privateAddress2.getAddress();
            const zetherAddress2 = zetherPrivateAddress2.getZetherAddress();
            const zetherRegistration2 = zetherPrivateAddress2.getZetherRegistration();

            let balance = 1000;
            const tx = new ZetherDepositTransaction(this._scope, undefined, {

                vin: [ {
                    amount: balance,
                    publicKey: privateAddress.publicKey,
                }],

                vout: [{
                    amount: balance,
                    zetherPublicKey: zetherAddress.publicKey,
                }],

                registration:{
                    registered: 1,
                    ...zetherRegistration,
                },

            } );

            await tx.signTransaction([ privateAddress ]);
            tx.transactionAddedToZether(this._scope.simpleChain);

            this._scope.simpleChain.data.fakeIncrementEpoch();

            for (const fee of [0, 200]){

                const tx = new ZetherTransferTransaction(this._scope, undefined, {

                    vin: fee ? [ {
                        amount: fee,
                        publicKey: privateAddress.publicKey,
                    }] : [],

                    vout: [],

                    registrations:[{
                        publicKey: zetherAddress2.publicKey,
                        ...zetherAddress2,
                    }],

                }, "object", {skipProcessingConstructionValues: true, skipValidation: true} );

                tx.createZetherTransferProof( zetherPrivateAddress,  zetherAddress2,500, [], balance, this._scope.simpleChain );

                const feeOut = tx.fee();
                if (fee){
                    this.expect( feeOut.tokenCurrency, TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
                    this.expect( feeOut.amount, fee);

                } else
                    this.expect( feeOut , undefined);


                await tx.signTransaction(fee ? [ privateAddress ] : []);
                this.expect( tx.verifyTransactionSignatures( ), true );

                tx.transactionAddedToZether(this._scope.simpleChain);

                this._scope.simpleChain.data.fakeIncrementEpoch();
                balance -= 500;
            }

        },


    });

}