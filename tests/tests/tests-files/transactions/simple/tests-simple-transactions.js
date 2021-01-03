const {BufferHelper} = global.kernel.helpers;

const {describe} = global.kernel.tests;

import SimpleTransaction from "src/transactions/models/tx/simple/simple-transaction"
import TransactionTokenCurrencyTypeEnum from "src/transactions/models/tx/base/tokens/transaction-token-currency-type-enum";

export default async function run () {


    describe("Simple transactions", {

        "one input and one output": async function () {

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address = privateAddress.getAddress();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

            const privateAddress3 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address3 = privateAddress3.getAddress();

            for (const fee of [0, 200]){

                const tx = new SimpleTransaction(this._scope, undefined, {

                    vin: [ {
                            amount: 1000,
                            publicKey: privateAddress.publicKey,
                        }
                    ],

                    vout: [ {
                            amount: 500,
                            publicKeyHash: address2.publicKeyHash,
                        }, {
                            amount: 300 + (fee ? 0 : 200),
                            publicKeyHash: address3.publicKeyHash,
                        }
                    ],

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

                const buffer = tx.toBuffer();
                const tx2 = new SimpleTransaction(this._scope, undefined, {

                    vin: [ {
                        amount: 50,
                        publicKey: privateAddress.publicKey,
                    }],

                    vout: [ {
                        amount: 50,
                        publicKeyHash: address2.publicKeyHash,
                    }],


                } );

                tx2.fromBuffer(buffer);
                this.expect( tx2.toHex(), tx.toHex() );

            }

        },

        "special fee": async function (){

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address = privateAddress.getAddress();

            const privateAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address2 = privateAddress2.getAddress();

            const privateAddress3 = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;
            const address3 = privateAddress3.getAddress();

            const tx = new SimpleTransaction(this._scope, undefined, {

                vin: [ {
                        amount: 1500,
                        publicKey: privateAddress.publicKey,
                    }, {
                        amount: 666,
                        publicKey: privateAddress.publicKey,
                        tokenCurrency: Buffer.alloc(20),
                    }
                ],

                vout: [ {
                        amount: 500,
                        publicKeyHash: address2.publicKeyHash,
                    }, {
                        amount: 1000,
                        publicKeyHash: address3.publicKeyHash,
                    }, {
                        amount: 333,
                        publicKeyHash: address3.publicKeyHash,
                        tokenCurrency: Buffer.alloc(20),
                    }
                ],
            } );

            const feeOut = tx.fee();

            this.expect( typeof feeOut , "object");
            this.expect( feeOut.tokenCurrency, Buffer.alloc(20).toString('hex') );
            this.expect( feeOut.amount, 333);


            const out = await tx.signTransaction([ privateAddress, privateAddress ]);

            this.expect( typeof out === "object", true);
            this.expect( out[0].length, 65 );

            const verification = tx.verifyTransactionSignatures( );

            this.expect( verification, true );

        },

        "many inputs and many outputs": async function () {

            const amount = Math.floor( Math.random()*10000 + 1000 );
            const fee = Math.floor( Math.random()*1000 );

            const vin = this._scope.cryptography.testsTransactionsHelper.distributeAmountVout( amount + fee, Math.random()*10+5, );
            const vout = this._scope.cryptography.testsTransactionsHelper.distributeAmountVout( amount, Math.random()*10+5, );

            const tx = new SimpleTransaction(this._scope, undefined, {

                vin: vin.vout.map( (it, index) => ({
                    amount: it.amount,
                    publicKey: vin.outsPrivateKeys[index].publicKey,
                }) ),

                vout: vout.vout.map( (it, index) => ({
                    amount: it.amount,
                    publicKeyHash: it.address.publicKeyHash,
                }) ),

            });

            const feeOut = tx.fee();
            this.expect( typeof feeOut , "object");
            this.expect( feeOut.tokenCurrency, TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
            this.expect( feeOut.amount, fee);

            const out = await tx.signTransaction( vin.outsPrivateKeys );

            this.expect( typeof out === "object", true);
            this.expect( out[ vin.vout.length-1 ].length, 65 );

            const verification = tx.verifyTransactionSignatures( );

            this.expect( verification, true );

        },

    });

}