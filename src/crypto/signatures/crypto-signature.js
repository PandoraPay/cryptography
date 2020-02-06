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

        const encryptedData = EthCrypto.cipher.stringify(encrypted);

        console.log("encryptedData", encryptedData)

        return Buffer.from(encryptedData, "hex");

    }

    async decrypt(encrypted, privateKey){

        if (Buffer.isBuffer(encrypted)) encrypted = encrypted.toString("hex");
        if (Buffer.isBuffer(privateKey)) privateKey = privateKey.toString("hex");

        try{

            const data = EthCrypto.cipher.parse(encrypted);

            const decrypted = await EthCrypto.decryptWithPrivateKey(privateKey, data);

            console.log("decrypted", decrypted);

            const out = Buffer.from(decrypted, "hex");

            return out;

        }catch(err){
            console.error(err);
        }

    }



    async testEncryptDecrypt( text = "38123789127398127983712983712983721987321897ABCD871893721389217" ){

        const encrypted = await EthCrypto.encryptWithPublicKey(
            "030dddc2e1cb1f9c5c3463399f0b539e2f2a9d42678f596cef95ce301087c05836", // by encryping with bobs publicKey, only bob can decrypt the payload with his privateKey
            text // we have to stringify the payload before we can encrypt it
        );
        const encryptedString = EthCrypto.cipher.stringify(encrypted);

        console.log("encryptedString", encrypted, encryptedString);

        const encryptedObject = EthCrypto.cipher.parse(encryptedString);

        const decrypted = await EthCrypto.decryptWithPrivateKey(
            "6b463fdd6b15df6da6753fe8d1a5973b133c7a4aed77b38b145b11987cf27876",
            encryptedObject
        );

        console.log("testEncryptDecrypt", decrypted, text );

        return decrypted === text;

    }


}
