const Protocol = global.kernel;

import Argv from "bin/argv/argv"
import Tests from "tests/tests/tests-index"

import CryptoSignature from "src/crypto/signatures/crypto-signature"
import AddressValidator from "src/addresses/address-generator/address-validator";
import AddressGenerator from "src/addresses/address-generator/address-generator"
import EncryptedMessage from "src/crypto/encryption/encrypted-message/encrypted-message"
import ChatMessage from "src/crypto/encryption/encrypted-message/chat-message"
import EncryptedMessageCreator from "src/crypto/encryption/encrypted-message/creator/encrypted-message-creator"
import EncryptedMessageValidator from "src/crypto/encryption/encrypted-message/validator/encrypted-message-validator"
import ChatMessageValidator from "src/crypto/encryption/encrypted-message/validator/chat-message-validator"

import AES from "src/crypto/encryption/aes"

import {ZSC} from "zetherjs"

export default class App extends Protocol.utils.App {

    setAdditionalEvents(){

        this.events.on("start/argv-set", () =>{

            this._scope.argv = Argv(this._scope.argv);

            this._scope.cryptography = {
                CryptoSignature,
                AddressValidator,
                AddressGenerator,
                AES,
                EncryptedMessage,
                ChatMessage,
                EncryptedMessageCreator,
                EncryptedMessageValidator,
                ChatMessageValidator,
                ZSC,
                ...this._scope.cryptography||{},
            };

        });

        this.events.on("start/tests-args-middleware", ()=>{

            this._scope.argv = Tests.argvTests(this._scope.argv);
            this._scope.tests.unshift( Tests.tests );

        });

        this.events.on("start/init-processed", async () => {

            if (!this.cryptography.aes) this.cryptography.aes = new this.cryptography.AES(this._scope);

            if (!this.cryptography.cryptoSignature) this.cryptography.cryptoSignature = new this.cryptography.CryptoSignature(this._scope);

            if (!this.cryptography.addressValidator) this.cryptography.addressValidator = new this.cryptography.AddressValidator(this._scope);
            if (!this.cryptography.addressGenerator) this.cryptography.addressGenerator = new this.cryptography.AddressGenerator(this._scope);

            if (!this.cryptography.encryptedMessageCreator) this.cryptography.encryptedMessageCreator = new this.cryptography.EncryptedMessageCreator(this._scope);
            if (!this.cryptography.encryptedMessageValidator) this.cryptography.encryptedMessageValidator = new this.cryptography.EncryptedMessageValidator(this._scope);
            if (!this.cryptography.chatMessageValidator) this.cryptography.chatMessageValidator = new this.cryptography.ChatMessageValidator(this._scope);

            if (!this.cryptography.zsc) this.cryptography.zsc = new this.cryptography.ZSC(this._scope);

            this._scope.logger.info(`Status`, `Crypto has been started`);
        });


    }

    get cryptography(){
        return this._scope.cryptography;
    }

}
