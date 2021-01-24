const {Helper} = require('kernel').helpers;
const {DBSchema} = require('kernel').marshal.db;
const {CryptoHelper} = require('kernel').helpers.crypto;
const {Exception, Base58, StringHelper, BufferReader} = require('kernel').helpers;

/**
 * This is used to store the private key
 */

module.exports = class PrivateKeyAddress extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                privateKey:{
                    type: "buffer",
                    fixedBytes: 32,

                    default(){
                        return this._scope.cryptography.cryptoSignature.createPrivateKey();
                    },

                    preprocessor(privateKey){
                        this.__data.publicKey = this._scope.cryptography.cryptoSignature.createPublicKey( privateKey );
                        return privateKey;
                    },

                    position: 100,
                },


                /**
                 * Public Keys are available
                 */

                publicKey:{

                    type: "buffer",
                    fixedBytes: 33,

                    skipMarshal: true,
                    skipSaving: true,

                    default(){
                        return this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
                    },

                    validation(value){
                        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
                        return value.equals(pubKey);
                    },

                    position: 101,
                },

            }

        }, schema, false), data, type, creationOptions);

    }

    /**
     * returns a publicAddress
     */
    getAddress(networkByte ){

        return this._scope.cryptography.addressGenerator.generateAddressFromPublicKey( this.publicKey, networkByte);

    }

    validatePublicKey(value){

        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );
        return this.publicKey.equals(pubKey);
    }

    /**
     * Get delegate stake private key
     *
     * dsha256( STAKE + dkeccak256( dkeccak256( PRIV + privateKey + DELEGATE) + NONCE ) + SECRET )
     *
     */
    getDelegateStakePrivateAddress(delegateNonce){

        if (typeof delegateNonce !== "number") throw new Exception(this, "DelegateNonce is missing");

        const privateKey = CryptoHelper.dkeccak256(this.privateKey);

        let delegateNonceHex = delegateNonce.toString(16);
        if (delegateNonceHex.length % 2 === 1) delegateNonceHex = "0"+delegateNonceHex;

        const concat = Buffer.concat([
            Buffer.from("PRIV"),
            privateKey,
            Buffer.from("DELEGATE"),
        ]);

        let delegatePrivateKey = CryptoHelper.dkeccak256( concat );                                  //dkeccak256( PRIV + privateKey +  DELEGATE )
        delegatePrivateKey = delegatePrivateKey.toString("hex") + delegateNonceHex;                  //delegatePrivateKey + delegateNonceHex

        delegatePrivateKey = CryptoHelper.dkeccak256(delegatePrivateKey);                            //dkeccak256( delegatePrivateKey )


        const concat2 = Buffer.concat([
            Buffer.from("STAKE"),
            delegatePrivateKey,
            Buffer.from("SECRET")
        ]);

        delegatePrivateKey = CryptoHelper.dsha256( concat2 );                                       //dsha256( STAKE + delegatePrivateKey + SECRET)

        const delegatePrivateAddress = new PrivateKeyAddress( this._scope, undefined, {
            privateKey: delegatePrivateKey,
        } );

        return delegatePrivateAddress;
    }

    /**
     * Get Node delegator stake private key
     *
     * dsha256( DELEGATE + dkeccak256( (  dsha256( dkeccak256( DELEGATOR + myPrivateKey + myPublicKey + DELEGATE ) ) + publicKey)  ) + VALUE )
     *
     */
    getDelegatorStakePrivateAddress(publicKey){

        if (typeof publicKey === "string" && StringHelper.isHex(publicKey) ) publicKey = Buffer.from(publicKey, "hex");

        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33) throw new Exception(this, "PublicKey is invalid");

        const myPrivateKey = CryptoHelper.dkeccak256(this.privateKey);
        const myPublicKey = this.publicKey;

        const concat = Buffer.concat([
            Buffer.from("DELEGATOR"),
            myPrivateKey,
            myPublicKey,
            Buffer.from("KEY"),
        ]);

        let delegatePrivateKey = CryptoHelper.dkeccak256( concat );                                         //dkeccak256( DELEGATOR + myPrivateKey + myPublicKey + DELEGATE )
        delegatePrivateKey = CryptoHelper.dsha256(delegatePrivateKey);                                      //dsha256( delegatePrivateKey )

        delegatePrivateKey = delegatePrivateKey.toString("hex") + publicKey.toString("hex");       //delegatePrivateKey + publicKey

        delegatePrivateKey = CryptoHelper.dkeccak256(delegatePrivateKey);                                   //dkeccak256( delegatePrivateKey )

        const concat2 = Buffer.concat([
            Buffer.from("DELEGATE"),
            delegatePrivateKey,
            Buffer.from("VALUE")
        ]);

        delegatePrivateKey = CryptoHelper.dsha256( concat2 );                                               //dsha256(DELEGATE + delegatePrivateKey + VALUE)

        const delegatePrivateAddress = new PrivateKeyAddress( this._scope, undefined, {
            privateKey: delegatePrivateKey,
        } );

        return delegatePrivateAddress;
    }

}
