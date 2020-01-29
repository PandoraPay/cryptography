/**
 *
 * x25519 based on salsa
 *
 **/

import nacl from 'tweetnacl'
const {Exception, StringHelper, BufferHelper} = global.kernel.helpers;

export default class X25519Signature{

    static keyPairs(secretKey){

        let privateKey = nacl.sign.keyPair.fromSecretKey().secretKey;
        let publicKey = nacl.sign.keyPair.fromSecretKey().publicKey;

        if ( !Buffer.isBuffer(privateKey) ) privateKey = new Buffer(privateKey);
        if ( !Buffer.isBuffer(publicKey) ) publicKey = new Buffer(publicKey);

        return {
            privateKey: privateKey,
            publicKey: publicKey,
        };

    }

    static sign(message, privateKey, ){

        if (!Buffer.isBuffer(message) ) throw new Exception(this, "message is invalid");
        if (!Buffer.isBuffer(privateKey) ) throw new Exception(this, "privateKey is invalid");

        return nacl.sign.detached( message, privateKey );
    }

    static verify(message, signature, publicKey){

        if (!Buffer.isBuffer(message) ) throw new Exception(this, "message is invalid");
        if (!Buffer.isBuffer(signature) ) throw new Exception(this, "signature is invalid");
        if (!Buffer.isBuffer(publicKey) ) throw new Exception(this, "publicKey is invalid");

        return nacl.sign.detached.verify( message, signature, publicKey);
    }

}
