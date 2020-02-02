const {BufferHelper} = global.kernel.helpers;

const {describe} = global.kernel.tests;

export default async function run () {


    describe("Crypto signatures", {

        "encrypt": function () {

            const secret = BufferHelper.generateRandomBuffer(32);

            const key1 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const message = BufferHelper.generateRandomBuffer(32);

            const signature = this._scope.cryptography.cryptoSignature.sign(message, key1.privateKey);

            this.expect(Buffer.isBuffer(signature), true);
            this.expect(signature.length, 65);

            const key2 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const signature2 = this._scope.cryptography.cryptoSignature.sign(message, key2.privateKey);

            this.expect( signature, signature2);

        },

        "decrypt": function (){

            const secret = BufferHelper.generateRandomBuffer(32);

            const key1 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const message = BufferHelper.generateRandomBuffer(32);

            const signature = this._scope.cryptography.cryptoSignature.sign(message, key1.privateKey);

            const key2 = this._scope.cryptography.cryptoSignature.createKeyPairs(secret);

            const signature2 = this._scope.cryptography.cryptoSignature.sign(message, key2.privateKey);

            this.expect( signature, signature2);
            this.expect( this._scope.cryptography.cryptoSignature.verify( message, signature , key2.publicKey), true);
            this.expect( this._scope.cryptography.cryptoSignature.verify( message, signature2 , key1.publicKey), true);

            const message2 = Buffer.from(message);
            message2[10] = message2[10] === 0x02 ? 0x01 : 0x02;

            this.expect( this._scope.cryptography.cryptoSignature.verify( message2, signature , key1.publicKey), false);

            const publicKey2 = Buffer.from(key1.publicKey);
            publicKey2[10] = publicKey2[10] === 0x02 ? 0x01 : 0x02;

            this.expect( this._scope.cryptography.cryptoSignature.verify( message, signature , publicKey2), false);
            this.expect( this._scope.cryptography.cryptoSignature.verify( message2, signature , publicKey2), false);


        }

    });

}