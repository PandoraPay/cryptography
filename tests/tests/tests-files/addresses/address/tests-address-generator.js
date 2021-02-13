const {describe} = require('kernel').tests;
const PrivateKeyModel = require("../../../../../src/addresses/address/private-key/private-key-model");
const AddressPublicKeyModel = require("../../../../../src/addresses/address/address-public-key/address-public-key-model");
const AddressModel = require("../../../../../src/addresses/address/address/address-model");

module.exports = async function run () {

    describe("Addresses Generator", {

        "generate address": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.networkByte]){

                const out = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( );

                this.expect( Array.isArray(out.mnemonic), true);
                this.expect( out.mnemonic.length > 10, true);
                this.expect( typeof out.privateKey, "object");
                this.expect( out.privateKey instanceof PrivateKeyModel, true);

                const privateKey = out.privateKey;

                const address = privateKey.getAddress(networkByte);
                this.expect(typeof address, "object");
                this.expect( address instanceof AddressModel, true);
                this.expect( address.networkByte, networkByte);

                const addressBase58 = address.calculateAddress( );
                this.expect(typeof addressBase58,  "string");
                this.expect(addressBase58.length, 44 );

                const addressPublicKey = privateKey.getAddressPublicKey(networkByte);
                this.expect(typeof addressPublicKey, "object");
                this.expect( addressPublicKey instanceof AddressPublicKeyModel, true);
                this.expect( addressPublicKey.networkByte, networkByte);

                const addressPublicKeyBase58 = addressPublicKey.calculateAddress( );
                this.expect(typeof addressPublicKeyBase58,  "string");
                this.expect(addressPublicKeyBase58.length, 61 );
            }

        },

        "validateAddress check": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.networkByte]){

                const {privateKey} = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( );

                const publicAddress = privateKey.getAddress(networkByte);
                const publicAddressString = publicAddress.calculateAddress();

                const publicAddress2 = this._scope.cryptography.addressValidator.validateAddress( publicAddressString );

                this.expect(publicAddress.publicKeyHash, publicAddress2.publicKeyHash );
                this.expect(publicAddress.calculateAddress( ), publicAddress2.calculateAddress( ) );

            }

        },

        "validateAddressPublicKey check": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.networkByte]){

                const {privateKey} = this._scope.cryptography.addressGenerator.generatePrivateKeyFromMnemonic( );

                const publicAddressPublicKey = privateKey.getAddressPublicKey(networkByte);
                const publicAddressPublicKeyString = publicAddressPublicKey.calculateAddress();

                const publicAddressPublicKey2 = this._scope.cryptography.addressValidator.validateAddressPublicKey( publicAddressPublicKeyString );

                this.expect(publicAddressPublicKey.publicKey, publicAddressPublicKey2.publicKey );
                this.expect(publicAddressPublicKey.calculateAddress( ), publicAddressPublicKey2.calculateAddress( ) );

            }

        },


    })



}