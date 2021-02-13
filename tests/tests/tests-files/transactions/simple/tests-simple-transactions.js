const {BufferHelper} = require('kernel').helpers;

const {describe} = require('kernel').tests;

const SimpleTxModel = require( "../../../../../src/transactions/models/tx/simple/simple-tx-model")
const TxTokenCurrencyTypeEnum = require( "../../../../../src/transactions/models/tx/base/schema/tokens/tx-token-currency-type-enum");

module.exports = async function run () {


    describe("Simple transactions", {

        "one input and one output": async function () {

            const privateKey = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address = privateKey.getAddress();

            const privateKey2 = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address2 = privateKey2.getAddress();

            const privateKey3 = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address3 = privateKey3.getAddress();

            for (const fee of [0, 200]){

                const extra = BufferHelper.generateRandomBuffer( Math.floor(Math.random()* 255) );

                const tx = new SimpleTxModel(this._scope, undefined, {

                    extra,

                    vin: [ {
                            amount: 1000,
                            publicKey: privateKey.publicKey,
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

                    this.expect( feeOut.tokenCurrency, TxTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
                    this.expect( feeOut.amount, fee);
                    this.expect( feeOut.amount, fee);

                } else {
                    this.expect( feeOut , undefined);
                }

                this.expect( tx.extra , extra);

                const out = await tx.signTransaction([ privateKey ]);

                this.expect( typeof out === "object", true);
                this.expect( out[0].length, 65 );

                const verification = tx.verifyTransactionSignatures( );

                this.expect( verification, true );

                const buffer = tx.toBuffer();
                const tx2 = new SimpleTxModel(this._scope, undefined, {

                    extra,

                    vin: [ {
                        amount: 50,
                        publicKey: privateKey.publicKey,
                    }],

                    vout: [ {
                        amount: 50,
                        publicKeyHash: address2.publicKeyHash,
                    }],


                } );

                tx2.fromBuffer(buffer);
                this.expect( tx2.toHex(), tx.toHex() );
                this.expect( tx2.hash(), tx.hash() );

            }

        },

        "special fee": async function (){

            const privateKey = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address = privateKey.getAddress();

            const privateKey2 = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address2 = privateKey2.getAddress();

            const privateKey3 = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address3 = privateKey3.getAddress();

            const privateKey4 = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            const address4 = privateKey4.getAddress();

            const extra = BufferHelper.generateRandomBuffer( Math.floor(Math.random()* 255) );

            const tx = new SimpleTxModel(this._scope, undefined, {

                extra,

                vin: [ {
                        amount: 1500,
                        publicKey: privateKey.publicKey,
                    }, {
                        amount: 666,
                        publicKey: privateKey2.publicKey,
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
                        publicKeyHash: address4.publicKeyHash,
                        tokenCurrency: Buffer.alloc(20),
                    }
                ],
            } );

            const feeOut = tx.fee();

            this.expect( typeof feeOut , "object");
            this.expect( feeOut.tokenCurrency, Buffer.alloc(20).toString('hex') );
            this.expect( feeOut.amount, 333);

            this.expect( tx.extra, extra );


            const out = await tx.signTransaction([ privateKey, privateKey2 ]);

            this.expect( typeof out === "object", true);
            this.expect( out[0].length, 65 );

            const verification = tx.verifyTransactionSignatures( );

            this.expect( verification, true );

            const out2 = await tx.signTransaction([ privateKey, privateKey3 ]);

            this.expect( typeof out2 === "object", true);
            this.expect( out2[0].length, 65 );

            this.expectError( () => tx.verifyTransactionSignatures( ))


        },

        "many inputs and many outputs": async function () {

            const amount = Math.floor( Math.random()*10000 + 1000 );
            const fee = Math.floor( Math.random()*1000 );

            const vin = this._scope.cryptography.testsTransactionsHelper.distributeAmountVout( amount + fee, Math.random()*10+5, );
            const vout = this._scope.cryptography.testsTransactionsHelper.distributeAmountVout( amount, Math.random()*10+5, );

            const extra = BufferHelper.generateRandomBuffer( Math.floor(Math.random()* 255) );

            const tx = new SimpleTxModel(this._scope, undefined, {

                extra,

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
            this.expect( feeOut.tokenCurrency, TxTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.id );
            this.expect( feeOut.amount, fee);

            this.expect( tx.extra, extra );

            const out = await tx.signTransaction( vin.outsPrivateKeys );

            this.expect( typeof out === "object", true);
            this.expect( out[ vin.vout.length-1 ].length, 65 );

            const verification = tx.verifyTransactionSignatures( );

            this.expect( verification, true );

        },

    });

}