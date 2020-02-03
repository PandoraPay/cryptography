const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;

import EthCrypto from 'eth-crypto';
import bn128 from "src/utils/crypto-utils/bn128";
const {BN} = global.kernel.utils;

export default class CryptoSignature {

    constructor(scope){
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

            x = new BN( secret.toString("hex"), 16).toRed(bn128.q);
        }else {
            x = bn128.randomScalar();
        }

        return Buffer.from( bn128.bytes(x).slice(2), "hex");

    }

    createPublicKey(privateKey){

        if ( Buffer.isBuffer(privateKey)  ) privateKey = privateKey.toString("hex");

        if (typeof privateKey !== "string" || privateKey.length !== 64) throw new Exception(this, "Invalid Private Key to sign the transaction");

        const publicKey = EthCrypto.publicKeyByPrivateKey( privateKey );

        const compressed = EthCrypto.publicKey.compress(publicKey);
        return Buffer.from( compressed, "hex");
    }

    sign( message, privateKey){

        if (Buffer.isBuffer(message)) message = message.toString("hex");
        if (Buffer.isBuffer(privateKey)) privateKey = privateKey.toString("hex");

        if ( typeof message !== "string" || message.length === 0) throw new Exception(this, "Invalid Message to sign the transaction");
        if ( typeof privateKey !== "string" || privateKey.length !== 64 ) throw new Exception(this, "Invalid Private Key to sign the transaction");

        if (message.length !== 64) message = CryptoHelper.keccak256(message).toString("hex");

        const signature = EthCrypto.sign(
            privateKey,
            message,
        );

        return Buffer.from(signature.substr(2), "hex");

    }

    verifyUsingAddress ( message, signature, publicKey, publicAddress ){

        try{

            publicAddress = this._scope.cryptography.addressValidator.validateAddress( publicAddress );
            const publicAddress2 = this._scope.cryptography.addressGenerator.generateAddressFromPublicKey( publicKey, publicKey.networkByte );

            if (publicAddress2.publicKeyHash.equals(publicAddress.publicKeyHash)) throw "Public Key are not matched";

        } catch (err){
            return false;
        }

        return this.verify(  message, signature, publicKey );

    }

    verify( message, signature, publicKey ){

        if (Buffer.isBuffer(signature)) signature = signature.toString("hex");
        if (Buffer.isBuffer(publicKey)) publicKey = publicKey.toString("hex");
        if (Buffer.isBuffer(message)) message = message.toString("hex");

        try{

            if (message.length !== 64) message = CryptoHelper.keccak256(message).toString("hex");

            const signer = EthCrypto.recoverPublicKey(
                signature,
                message,
            );

            const signerCompressed = EthCrypto.publicKey.compress(signer);

            if (publicKey === signerCompressed) return true;

        }catch(err){
            //console.error(err);
        }

        return false;
    }

    async encrypt(message, publicKey){

        if (Buffer.isBuffer(publicKey)) publicKey = publicKey.toString("hex");
        if (Buffer.isBuffer(message)) message = message.toString("hex");

        const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, message);

        const data = EthCrypto.cipher.stringify(encrypted);

        return Buffer.from(data, "hex");

    }

    async decrypt(encrypted, privateKey){

        if (Buffer.isBuffer(encrypted)) encrypted = encrypted.toString("hex");
        if (Buffer.isBuffer(privateKey)) privateKey = privateKey.toString("hex");

        try{

            const data = EthCrypto.cipher.parse(encrypted);

            const decrypted = await EthCrypto.decryptWithPrivateKey(privateKey, data);

            const out = Buffer.from(decrypted, "hex");

            return out;

        }catch(err){
            //console.error(err);
        }

    }

}
