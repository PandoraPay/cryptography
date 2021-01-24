const {BufferHelper} = require('kernel').helpers;

const {describe} = require('kernel').tests;

module.exports = async function run () {


    describe("Crypto encryption", {

        "encrypt": async function () {

            const secret = BufferHelper.generateRandomBuffer(32);

            const key1 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const message = BufferHelper.generateRandomBuffer(1024);

            const encryption = await this._scope.cryptography.cryptoSignature.encrypt(message, key1.publicKey);

            this.expect(Buffer.isBuffer(encryption), true);
            this.expect(encryption.length > 1000, true);

            const key2 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const encryption2 = await this._scope.cryptography.cryptoSignature.encrypt(message, key2.publicKey);

            this.expect( key1.publicKey, key2.publicKey);
            this.expect( encryption.length, encryption2.length); //messages could be different

        },

        "decrypt": async function (){

            const secret = BufferHelper.generateRandomBuffer(32);

            const key1 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const message = BufferHelper.generateRandomBuffer(1024);

            const encryption = await this._scope.cryptography.cryptoSignature.encrypt(message, key1.publicKey);

            const key2 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const encryption2 = await this._scope.cryptography.cryptoSignature.encrypt(message, key2.publicKey);

            this.expect( encryption.length, encryption2.length); //messages could be different
            this.expect( await this._scope.cryptography.cryptoSignature.decrypt( encryption, key1.privateKey), message);
            this.expect( await this._scope.cryptography.cryptoSignature.decrypt( encryption2, key2.privateKey), message);

            const encryptionError = Buffer.from(message);
            encryptionError[10] = encryptionError[10] === 0x02 ? 0x01 : 0x02;

            this.expect( await this._scope.cryptography.cryptoSignature.decrypt( encryptionError, key1.privateKey), undefined );

            const privateKey2 = Buffer.from(key1.privateKey);
            privateKey2[10] = privateKey2[10] === 0x02 ? 0x01 : 0x02;

            this.expect( await this._scope.cryptography.cryptoSignature.decrypt( encryption, privateKey2 ), undefined);
            this.expect( await this._scope.cryptography.cryptoSignature.decrypt( encryption2, privateKey2), undefined );


        }

    });

}