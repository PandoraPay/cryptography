const Protocol = global.kernel;

import Argv from "bin/argv/argv"
import Tests from "tests/tests/tests-index"

import CryptoSignature from "src/crypto/signatures/crypto-signature"
import AddressValidator from "src/addresses/address-generator/address-validator";
import AddressGenerator from "src/addresses/address-generator/address-generator"

import AES from "src/crypto/encryption/aes"

export default class App extends Protocol.utils.App {

    setAdditionalEvents(){

        this.events.on("start/argv-set", () =>{

            this._scope.argv = Argv(this._scope.argv);

            this._scope.cryptography = {
                CryptoSignature,
                AddressValidator,
                AddressGenerator,
                AES,
                ...this._scope.cryptography||{},
            };

        });

        this.events.on("start/tests-args-middleware", ()=>{

            this._scope.argv = Tests.argvTests(this._scope.argv);
            this._scope.tests.unshift( Tests.tests );

        });

        this.events.on("start/init-processed", async () => {

            if (!this._scope.cryptography.aes) this._scope.cryptography.aes = new this._scope.cryptography.AES(this._scope);

            if (!this._scope.cryptography.cryptoSignature) this._scope.cryptography.cryptoSignature = new this._scope.cryptography.CryptoSignature(this._scope);

            if (!this._scope.cryptography.addressValidator) this._scope.cryptography.addressValidator = new this._scope.cryptography.AddressValidator(this._scope);
            if (!this._scope.cryptography.addressGenerator) this._scope.cryptography.addressGenerator = new this._scope.cryptography.AddressGenerator(this._scope);


            this._scope.logger.info(`Status`, `Crypto has been started`);
        });


    }

}
