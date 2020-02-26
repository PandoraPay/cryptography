const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;
const {CryptoHelper} = global.kernel.helpers.crypto;

/**
 * This is used to store the private key
 */

export default class PrivateKeyAddress extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                /**
                 * EdDSA ed25519
                 */
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

        if (!value) value = this.publicKey;

        const pubKey = this._scope.cryptography.cryptoSignature.createPublicKey( this.privateKey );

        return value.equals(pubKey);
    }

    /**
     * Get delegate stake private key
     */
    getDelegateStakePrivateAddress(delegateNonce){

        if (typeof delegateNonce !== "number") throw new Exception(this, "DelegateNonce is missing");

        const privateKey = this.privateKey;
        const publicKey = this.publicKey;

        let delegateNonceHex = delegateNonce.toString(16);
        if (delegateNonceHex.length % 2 === 1) delegateNonceHex = "0"+delegateNonceHex;

        const concat = Buffer.concat([
            Buffer.from("PRIV"),
            privateKey,
            publicKey,
            Buffer.from("DELEGATE"),
        ]);

        let delegatePrivateKey = CryptoHelper.dkeccak256( concat );                                  //dkeccak256( PRIV + privateKey + publicKey + DELEGATE )
        delegatePrivateKey = delegatePrivateKey.toString("hex") + delegateNonceHex;                  //delegatePrivateKey + delegateNonceHex

        delegatePrivateKey = CryptoHelper.dkeccak256(delegatePrivateKey);                            //dkeccak256( delegatePrivateKey )


        const concat2 = Buffer.concat([
            Buffer.from("STAKE"),
            delegatePrivateKey,
            Buffer.from("SECRET")
        ]);

        delegatePrivateKey = CryptoHelper.dsha256( concat2 );                                       //dsha256( STAKE + delegatePrivateKey + SECRET)

        // dsha256( STAKE + dkeccak256( dkeccak256( PRIV + privateKey + publicKey + DELEGATE) + NONCE ) + SECRET )

        const delegatePrivateAddress = new PrivateKeyAddress( this._scope, undefined, {
            privateKey: delegatePrivateKey,
        } );

        return delegatePrivateAddress;
    }

    /**
     * Get Node delegator stake private key
     */
    getDelegatorStakePrivateAddress(publicKey){

        if (typeof publicKey === "string" && Helper.isHex(publicKey) ) publicKey = Buffer.from(publicKey, "hex");

        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 33) throw new Exception(this, "PublicKey is invalid");

        const myPrivateKey = this.privateKey;
        const myPublicKey = this.publicKey;

        const concat = Buffer.concat([
            Buffer.from("DELEGATOR"),
            myPrivateKey,
            myPublicKey,
            Buffer.from("DELEGATE"),
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

        // dsha256( DELEGATE + dkeccak256( (  dsha256( dkeccak256( DELEGATOR + myPrivateKey + myPublicKey + DELEGATE ) ) + publicKey)  ) + VALUE )

        const delegatePrivateAddress = new PrivateKeyAddress( this._scope, undefined, {
            privateKey: delegatePrivateKey,
        } );

        return delegatePrivateAddress;
    }

}
