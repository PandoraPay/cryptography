const crypto = process.env.browser ? require('crypto-browserify') : require('crypto');

const {Exception} = PandoraLibrary.helpers;

const IV_LENGTH = 16;

module.exports = class AES{

    encrypt(input, password){

        if (!Buffer.isBuffer(input)) throw new Exception(this, "invalid input");

        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv('aes-256-cbc', password, iv );
        const encrypted = Buffer.concat([iv, cipher.update(input), cipher.final()]);

        return encrypted;

    }

    decrypt(input, password) {

        if (!Buffer.isBuffer(input)) throw new Exception(this, "invalid input");

        const iv = Buffer.alloc(IV_LENGTH);
        input.copy(iv, 0, 0, IV_LENGTH);

        const source = Buffer.alloc(input.length - IV_LENGTH);
        input.copy(source, 0, IV_LENGTH);

        const decipher = crypto.createDecipheriv('aes-256-cbc', password, iv);
        const decrypt = Buffer.concat([decipher.update(source), decipher.final()]);

        return decrypt;

    }


}