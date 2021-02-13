const {describe} = require('kernel').tests;
const PrivateKeyModel = require("../../../../../src/addresses/address/private-key/private-key-model");

module.exports = async function run () {

    describe("Addresses Validator", {

        "check private keys": async function (){

            const privateKey = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKey;
            this.expect(privateKey instanceof PrivateKeyModel, true);

            this.expect( privateKey.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKey ) instanceof PrivateKeyModel, true);

            const privateKey2 = this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKey );

            this.expect( privateKey2.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKey2 ) instanceof PrivateKeyModel, true);

            const json = privateKey2.toJSON();

            const privateKey3 = this._scope.cryptography.addressValidator.validatePrivateKeyAddress( json );

            this.expect( privateKey3.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKey3 ) instanceof PrivateKeyModel, true);

        },


    })



}