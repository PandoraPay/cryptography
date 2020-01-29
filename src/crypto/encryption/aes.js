const crypto = process.env.browser ? require('crypto-browserify') : require('crypto');

const {Exception} = global.kernel.helpers;

export default class AES{

    encrypt(input, password){

        if (!Buffer.isBuffer(input)) throw new Exception(this, "invalid input");

        const cipher = crypto.createCipher('aes-256-cbc', password);
        const crypted = Buffer.concat([cipher.update(input), cipher.final()]);

        return Buffer.from(crypted);

    }

    decrypt(input, password) {

        if (!Buffer.isBuffer(input)) throw new Exception(this, "invalid input");

        const decipher = crypto.createDecipher('aes-256-cbc', password);
        const decrypt = Buffer.concat([decipher.update(input), decipher.final()]);

        return Buffer.from(decrypt);

    }


}