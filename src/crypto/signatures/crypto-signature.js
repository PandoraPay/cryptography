const {Exception, StringHelper, BufferHelper, BufferReader} = require('kernel').helpers;
const EthCrypto = require( 'eth-crypto' );
const {BN} = require('kernel').utils;
const eccrypto = require( 'eccrypto' ); //eth-crypto uses  eccrypto
const { ecdsaRecover, publicKeyConvert } = require('secp256k1');
const Buffer04 = Buffer.from("04", 'hex');

module.exports = class CryptoSignature {

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
            if (!Buffer.isBuffer(secret)) throw "secret is not a buffer";
            if (secret.length !== 32) throw "secret is not length 32";

            x = secret;
        }else
            x = BufferHelper.generateRandomBuffer(32);

        return x;
    }

    createPublicKey(privateKey){

        if (!Buffer.isBuffer(privateKey)) throw "secret is not a buffer";
        if (privateKey.length !== 32) throw "secret is not a buffer";

        const publicKey = EthCrypto.publicKeyByPrivateKey( privateKey.toString('hex') );

        const compressed = EthCrypto.publicKey.compress(publicKey);

        return Buffer.from( compressed, "hex");
    }

    sign( message, privateKey){

        if (!Buffer.isBuffer(message)) throw "message is not a buffer";
        if (!Buffer.isBuffer(privateKey)) throw "privateKey is not a buffer";
        if (privateKey.length !== 32) throw "privateKey is invalid";
        if (message.length !== 32) throw "Invalid Message to sign the transaction";

        const signature = EthCrypto.sign(
            privateKey.toString("hex"),
            message.toString("hex"),
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

        try{

            if (!Buffer.isBuffer(message)) throw "message is not a buffer";
            if (!Buffer.isBuffer(signature)) throw "signature is not a buffer";
            if (!Buffer.isBuffer(publicKey)) throw "publicKey is not a buffer";
            if (message.length !== 32) throw "Invalid Message to verify the transaction";

            const sigOnly = Buffer.alloc(signature.length-1);
            signature.copy( sigOnly,   0, 0,        signature.length-1 );

            const signer = ecdsaRecover(
                sigOnly,
                signature[signature.length-1] === 0x1c ? 1 : 0,
                message,
                false
            )

            const signerCompressed = publicKeyConvert( signer.length === 32 ? Buffer.concat([ Buffer04, signer] ) : signer );

            if (publicKey.equals( signerCompressed) )
                return true;

        }catch(err){
            //console.error(err);
        }

        return false;
    }

    async encrypt(message, publicKey){

        try{
            const encryptedMsg = await eccrypto.encrypt( publicKey, message );
            return Buffer.concat([encryptedMsg.iv, encryptedMsg.ephemPublicKey, encryptedMsg.mac, encryptedMsg.ciphertext ]);
        }catch(err){
            //console.error(err);
        }

    }

    async decrypt(encrypted, privateKey){

        try{

            const iv = Buffer.alloc(16);
            encrypted.copy( iv,   0, 0,        16 );

            const ephemPublicKey = Buffer.alloc(65);
            encrypted.copy( ephemPublicKey,   0, 16,        16+65 );

            const mac = Buffer.alloc(32);
            encrypted.copy( mac,   0, 16+65,        16+65+32 );

            const ciphertext = Buffer.alloc(encrypted.length - 16 - 65 - 32);
            encrypted.copy( ciphertext,   0, 16+65+32 );

            const decrypted = await eccrypto.decrypt( privateKey, {
                iv,
                ephemPublicKey,
                mac,
                ciphertext,
            } );

            return decrypted;

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
