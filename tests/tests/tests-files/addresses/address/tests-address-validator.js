const {describe} = PandoraLibrary.tests;
const PrivateKeyModel = require("../../../../../src/addresses/address/private-key/private-key-model");

module.exports = async function run () {

    describe("Addresses Validator", {

        "check private keys": async function (){

            const privateKeyModel = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( ).privateKeyModel;
            this.expect(privateKeyModel instanceof PrivateKeyModel, true);

            this.expect( privateKeyModel.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKeyModel ) instanceof PrivateKeyModel, true);

            const privateKeyModel2 = this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKeyModel );

            this.expect( privateKeyModel2.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKeyModel2 ) instanceof PrivateKeyModel, true);

            const json = privateKeyModel2.toJSON();

            const privateKeyModel3 = this._scope.cryptography.addressValidator.validatePrivateKeyAddress( json );

            this.expect( privateKeyModel3.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateKeyAddress( privateKeyModel3 ) instanceof PrivateKeyModel, true);

        },


    })



}