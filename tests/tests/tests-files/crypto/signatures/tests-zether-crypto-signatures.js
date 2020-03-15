const {BufferHelper} = global.kernel.helpers;

const {describe} = global.kernel.tests;

export default async function run () {


    describe("Zether Crypto signatures", {

        "key pairs random": function () {

            const key1 = this._scope.cryptography.zetherCryptoSignature.createKeyPairs();
            const key2 = this._scope.cryptography.zetherCryptoSignature.createKeyPairs();
            const key3 = this._scope.cryptography.zetherCryptoSignature.createKeyPairs();

            this.expect(key1.privateKey.equals(key2.privateKey), false );
            this.expect(key1.privateKey.equals(key3.privateKey), false );
            this.expect(key2.privateKey.equals(key3.privateKey), false );

            this.expect(key1.publicKey.equals(key2.publicKey), false );
            this.expect(key1.publicKey.equals(key3.publicKey), false );
            this.expect(key2.publicKey.equals(key3.publicKey), false );
        },

        "key pairs from secret": function () {

            const secret = BufferHelper.generateRandomBuffer(32);

            const key1 = this._scope.cryptography.zetherCryptoSignature.createKeyPairs(secret);
            const key2 = this._scope.cryptography.zetherCryptoSignature.createKeyPairs(secret);

            this.expect(key1.privateKey, key2.privateKey);
            this.expect(key1.publicKey, key2.publicKey);


        },

    });

}