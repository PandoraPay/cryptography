const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;

import Zether from "zetherjs"
const {BN} = global.kernel.utils;

export default class ZetherCryptoSignature {

    constructor(scope) {
        this._scope = scope;
    }

    createKeyPairs(secret){
        const privateKey = this.createPrivateKey(secret);
        const publicKey = this.createPublicKey(privateKey);
        return {
            privateKey,
            publicKey,
        }
    }

    createPrivateKey(secret){

        let x;
        if (secret){
            if (typeof secret === "string") secret = Buffer.from(secret, "hex");
            if (secret.length !== 32) throw "secret is not length 32";

            x = new BN( secret.toString("hex"), 16).toRed( Zether.bn128.q);
        }else {
            x = Zether.bn128.randomScalar();
        }

        return Zether.bn128.toBuffer(x);

    }

    createPublicKey(privateKey){

        if ( Buffer.isBuffer(privateKey)  ) privateKey = privateKey.toString("hex");

        if (typeof privateKey !== "string" || privateKey.length !== 64) throw new Exception(this, "Invalid Private Key to sign the transaction");

        const publicKey = Zether.utils.determinePublicKey( Zether.utils.BNFieldfromHex( '0x'+privateKey) );

        return Zether.bn128.serializeToBuffer( publicKey);
    }

}