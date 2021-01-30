const {describe} = require('kernel').tests;
const PrivateKeyAddressModel = require("../../../../../src/addresses/address/private/private-key-address-model");

module.exports = async function run () {

    describe("Addresses Validator", {

        "check private keys": async function (){

            const privateAddress = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( ).privateAddress;

            this.expect( privateAddress.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateAddress( privateAddress ) instanceof PrivateKeyAddressModel, true);

            const privateAddress2 = this._scope.cryptography.addressValidator.validatePrivateAddress( privateAddress );

            this.expect( privateAddress2.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateAddress( privateAddress2 ) instanceof PrivateKeyAddressModel, true);

            const json = privateAddress2.toJSON();

            const privateAddress3 = this._scope.cryptography.addressValidator.validatePrivateAddress( json );

            this.expect( privateAddress3.validatePublicKey(), true);

            this.expect( this._scope.cryptography.addressValidator.validatePrivateAddress( privateAddress3 ) instanceof PrivateKeyAddressModel, true);

        },


    })



}