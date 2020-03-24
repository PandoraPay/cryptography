const {Helper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;
const {CryptoHelper} = global.kernel.helpers.crypto;
const {Exception, Base58, StringHelper, BufferReader} = global.kernel.helpers;
const {BN} = global.kernel.utils;
import Zether from "zetherjs"

/**
 * This is used to store the Zether private key
 */

export default class ZetherPrivateKeyAddress extends DBSchema {

    constructor(scope, schema = {}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                privateKey: {
                    type: "buffer",
                    fixedBytes: 32,

                    default() {
                        return this._scope.cryptography.zetherCryptoSignature.createPrivateKey();
                    },

                    preprocessor(privateKey) {
                        this.__data.publicKey = this._scope.cryptography.zetherCryptoSignature.createPublicKey(privateKey);
                        return privateKey;
                    },

                    position: 100,
                },


                /**
                 * Public Keys are available
                 */

                publicKey: {

                    type: "buffer",
                    fixedBytes: 64,

                    skipMarshal: true,
                    skipSaving: true,

                    default() {
                        return this._scope.cryptography.zetherCryptoSignature.createPublicKey(this.privateKey);
                    },

                    validation(value) {
                        const pubKey = this._scope.cryptography.zetherCryptoSignature.createPublicKey(this.privateKey);
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
    getZetherAddress( registration = false, networkByte ){

        return this._scope.cryptography.zetherAddressGenerator.generateZetherAddressFromPublicKey( this.publicKey, registration ? this.getZetherRegistration() : undefined, networkByte);

    }

    validateZetherPublicKey(value){

        const pubKey = this._scope.cryptography.zetherCryptoSignature.createPublicKey( this.privateKey );
        return value.equals(pubKey);

    }

    getZetherRegistration(){

        const [c, s] = this._scope.cryptography.Zether.utils.sign( this._scope.argv.transactions.zether.zscAddress, this.zetherKeyPair(), this._zetherRegistrationSecret() );
        return {
            c: this._scope.cryptography.Zether.bn128.toBuffer(c),
            s: this._scope.cryptography.Zether.bn128.toBuffer(s),
        }

    }

    zetherKeyPair(){

        return {
            x: Zether.utils.BNFieldfromHex(this.privateKey),
            y: Zether.bn128.unserializeFromBuffer(this.publicKey),
        }
    }

    _zetherRegistrationSecret(){

        const privateKey = CryptoHelper.dkeccak256(this.privateKey);

        const concat = Buffer.concat([
            Buffer.from("REGISTRATION"),
            privateKey,
            Buffer.from("SECRET"),
        ]);

        let zetherRegistrationSecret = CryptoHelper.dkeccak256( concat );                                  //dkeccak256( PRIV + privateKey + publicKey + DELEGATE )

        const concat2 = Buffer.concat([
            Buffer.from("ZETHER"),
            zetherRegistrationSecret,
            Buffer.from("KEY")
        ]);

        zetherRegistrationSecret = CryptoHelper.dsha256( concat2 );
        return zetherRegistrationSecret;
    }

}