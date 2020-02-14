const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {CryptoHelper} = global.kernel.helpers.crypto;

import EthCrypto from 'eth-crypto';
import bn128 from "src/utils/crypto-utils/bn128";
const {BN} = global.kernel.utils;
const ecies = require("eth-ecies");

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

        if ( Buffer.isBuffer(publicKey) ) publicKey = publicKey.toString("hex");
        publicKey = EthCrypto.publicKey.decompress( publicKey);

        if ( typeof publicKey === "string" && StringHelper.isHex( publicKey )) publicKey = Buffer.from(publicKey, "hex");
        if ( typeof message === "string" ) message = Buffer.from(message, "ascii");

        try{
            const encryptedMsg = ecies.encrypt( publicKey, message );
            return encryptedMsg;
        }catch(err){
            //console.error(err);
        }

    }

    async decrypt(encrypted, privateKey){

        if ( typeof encrypted === "string" && StringHelper.isHex( encrypted )) encrypted = Buffer.from(encrypted, "hex");
        if ( typeof privateKey === "string" && StringHelper.isHex( privateKey )) privateKey = Buffer.from(privateKey, "hex");

        try{

            const plaintext = ecies.decrypt( privateKey, encrypted );
            return plaintext;

        }catch(err){
            //console.error(err);
        }


    }



    async testEncryptDecrypt( ){

        const secret = BufferHelper.generateRandomBuffer(32);

        const key1 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

        const message = BufferHelper.generateRandomBuffer(1024);

        const encryption = await this.encrypt(message, key1.publicKey);

        const message2 = await this.decrypt( encryption, key1.privateKey);

        return message.equals(message2);
    }


}
