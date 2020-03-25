const {describe} = global.kernel.tests;

export default async function run () {

    describe("Addresses Generator", {

        "generate address": async function (){

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

        "validateAddress check": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main, this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Testnet]){

                const address = this._scope.cryptography.addressGenerator.generateAddressFromMnemonic( );

                const publicAddress = address.privateAddress.getAddress(networkByte);
                const publicAddressString = publicAddress.calculateAddress();

                const publicAddress2 = this._scope.cryptography.addressValidator.validateAddress( publicAddressString );

                this.expect(publicAddress.publicKeyHash, publicAddress2.publicKeyHash );
                this.expect(publicAddress.calculateAddress( ), publicAddress2.calculateAddress( ) );

            }

        },

        "generate zether address": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main, this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Testnet]){

                const address = this._scope.cryptography.zetherAddressGenerator.generateZetherAddressFromMnemonic( );

                this.expect( Array.isArray(address.mnemonic), true);
                this.expect( address.mnemonic.length > 10, true);
                this.expect( typeof address.privateAddress, "object");

                const zetherPrivateAddress = address.privateAddress;

                const zetherPublicAddress = zetherPrivateAddress.getZetherAddress(false, networkByte);
                this.expect(typeof zetherPublicAddress, "object");

                const zetherPublicAddressRegistration = zetherPrivateAddress.getZetherAddress(true, networkByte);
                this.expect(typeof zetherPublicAddressRegistration, "object");

                this.expect(zetherPublicAddress.publicKey, zetherPublicAddressRegistration.publicKey);

                this.expect(zetherPublicAddressRegistration.registration.registered, 1);
                this.expect(zetherPublicAddressRegistration.registration.s.equals(Buffer.alloc(32)), false);
                this.expect(zetherPublicAddressRegistration.registration.c.equals(Buffer.alloc(32)), false);

                const addressBase58 = zetherPublicAddress.calculateAddress( );
                this.expect(typeof addressBase58,  "string");

                const addressBase58Registration = zetherPublicAddressRegistration.calculateAddress( );
                this.expect(typeof addressBase58Registration,  "string");

                this.expect(addressBase58Registration.length > addressBase58.length,  true);

            }

        },

        "validate zether address": async function (){

            for (const networkByte of [this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main, this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Testnet]){

                const address = this._scope.cryptography.zetherAddressGenerator.generateZetherAddressFromMnemonic( );
                const zetherPrivateAddress = address.privateAddress;

                const zetherPublicAddress = zetherPrivateAddress.getZetherAddress(false, networkByte);
                const zetherPublicAddressString = zetherPublicAddress.calculateAddress();

                const zetherPublicAddress2 = this._scope.cryptography.zetherAddressValidator.validateZetherAddress( zetherPublicAddressString );

                this.expect(zetherPublicAddress.publicKey, zetherPublicAddress2.publicKey );
                this.expect(zetherPublicAddress.calculateAddress( ), zetherPublicAddress2.calculateAddress( ) );


                const zetherPublicAddressRegistration = zetherPrivateAddress.getZetherAddress(true, networkByte);
                const zetherPublicAddressRegistrationString = zetherPublicAddressRegistration.calculateAddress();

                const zetherPublicAddressRegistration2 = this._scope.cryptography.zetherAddressValidator.validateZetherAddress( zetherPublicAddressRegistrationString );

                this.expect(zetherPublicAddressRegistration.publicKey, zetherPublicAddressRegistration2.publicKey );
                this.expect(zetherPublicAddressRegistration.calculateAddress( ), zetherPublicAddressRegistration2.calculateAddress( ) );

            }

        },

    })



}