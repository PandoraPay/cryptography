const {describe} = global.kernel.tests;

export default async function run () {

    describe("Addresses Generator", {

        "generateAddressFromMnemonic check": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main, this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Testnet]){

                const address = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( );

                this.expect( Array.isArray(address.mnemonic), true);
                this.expect( address.mnemonic.length > 10, true);
                this.expect( typeof address.privateAddress, "object");

                const privateAddress = address.privateAddress;

                const publicAddress = privateAddress.getAddress(networkByte);
                this.expect(typeof publicAddress, "object");

                const addressBase58 = publicAddress.calculateAddress( );

                this.expect(typeof addressBase58,  "string");

            }

        },

        "checkAddressFromMnemonic check": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main, this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Testnet]){

                const address = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( );

                const publicAddress = address.privateAddress.getAddress(networkByte);
                const publicAddressString = publicAddress.calculateAddress();

                const address2 = this._scope.cryptography.addressValidator.validateAddress( publicAddressString );

                this.expect(publicAddress.publicKeyHash, address2.publicKeyHash );

            }

        }

    })



}