const {describe} = global.kernel.tests;

import ZetherDepositTransaction from "src/transactions/models/tx/zether/zether-deposit-transaction"
import ZetherBurnTransaction from "src/transactions/models/tx/zether/zether-burn-transaction"
import TransactionTokenCurrencyTypeEnum from "src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum";

export default async function run () {


    describe("Zether Burn Transaction", {

        "one input burn": async function () {

            this._scope.simpleChain.data.clearData();

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const zetherPrivateAddress = privateAddress.getZetherPrivateAddress();
            const zetherAddress = zetherPrivateAddress.getZetherAddress();
            const zetherRegistration = zetherPrivateAddress.getZetherRegistration();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

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
                    c: zetherRegistration.c,
                    s: zetherRegistration.s,
                },

            } );

            await tx.signTransaction([ privateAddress ]);
            await tx.transactionAddedToZether(this._scope.simpleChain);

            this._scope.simpleChain.data.fakeIncrementEpoch();

            let step = -1;
            for (const fee of [0, 200]){

                step +=1;
                const tx = new ZetherBurnTransaction(this._scope, undefined, {

                    vin: fee ? [ {
                        amount: fee,
                        publicKey: privateAddress.publicKey,
                    }] : [],

                    zetherInput:{
                        amount: 500,
                        zetherPublicKey: zetherAddress.publicKey,
                    },

                    vout: [{
                        amount: 500,
                        publicKeyHash: address2.publicKeyHash,
                    }],


                } );

                await tx.createZetherBurnProof( zetherPrivateAddress, balance, this._scope.simpleChain );

                const feeOut = tx.fee();
                if (fee){
                    this.expect( feeOut.tokenCurrency, TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
                    this.expect( feeOut.amount, fee);

                } else
                    this.expect( feeOut , undefined);


                await tx.signTransaction(fee ? [ privateAddress ] : []);
                this.expect( tx.verifyTransactionSignatures( ), true );

                await tx.transactionAddedToZether(this._scope.simpleChain);

                this._scope.simpleChain.data.fakeIncrementEpoch();
                balance -= 500;

            }

        },

        "zero input burn": async function () {

            this._scope.simpleChain.data.clearData();

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const zetherPrivateAddress = privateAddress.getZetherPrivateAddress();
            const zetherAddress = zetherPrivateAddress.getZetherAddress();
            const zetherRegistration = zetherPrivateAddress.getZetherRegistration();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

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
                    c: zetherRegistration.c,
                    s: zetherRegistration.s,
                },

            } );

            await tx.signTransaction([ privateAddress ]);
            await tx.transactionAddedToZether(this._scope.simpleChain);

            this._scope.simpleChain.data.fakeIncrementEpoch();

            let step = -1;
            for (const fee of [0, 200]){

                step +=1;
                const tx = new ZetherBurnTransaction(this._scope, undefined, {

                    vin: [],

                    zetherInput:{
                        amount: 500,
                        zetherPublicKey: zetherAddress.publicKey,
                    },

                    vout: [{
                        amount: 500 - fee ,
                        publicKeyHash: address2.publicKeyHash,
                    }],


                } );

                await tx.createZetherBurnProof( zetherPrivateAddress, balance, this._scope.simpleChain );

                const feeOut = tx.fee();
                if (fee){
                    this.expect( feeOut.tokenCurrency, TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
                    this.expect( feeOut.amount, fee);
                } else
                    this.expect( feeOut , undefined);

                await tx.transactionAddedToZether(this._scope.simpleChain);

                this._scope.simpleChain.data.fakeIncrementEpoch();
                balance -= 500;
            }

        }

    });

}