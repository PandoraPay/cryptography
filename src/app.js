const Argv = require("../bin/argv/argv")
const Tests = require("../tests/tests/tests-index")

const CryptoSignature = require( "./crypto/signatures/crypto-signature")
const AddressValidator = require("./addresses/address-validator/address-validator");
const AddressGenerator = require("./addresses/address-generator/address-generator")
const EncryptedMessageModel = require("./crypto/encryption/encrypted-message/encrypted-message-model")
const ChatMessageModel = require("./crypto/encryption/encrypted-message/schema/chat-message-schema-build")
const EncryptedMessageCreator = require( "./crypto/encryption/encrypted-message/creator/encrypted-message-creator")
const EncryptedMessageValidator = require( "./crypto/encryption/encrypted-message/validator/encrypted-message-validator")
const ChatMessageValidator = require("./crypto/encryption/encrypted-message/validator/chat-message-validator")

const AES = require("./crypto/encryption/aes")

module.exports = class App extends PandoraLibrary.utils.App {

    setAdditionalEvents(){

        this.events.on("start/argv-set", () =>{

            this._scope.argv = Argv(this._scope.argv);

            this._scope.cryptography = {
                CryptoSignature,
                AddressValidator,
                AddressGenerator,
                AES,
                EncryptedMessageModel,
                ChatMessageModel,
                EncryptedMessageCreator,
                EncryptedMessageValidator,
                ChatMessageValidator,
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

            this._scope.logger.info(`Status`, `Crypto has been started`);
        });


    }

    get cryptography(){
        return this._scope.cryptography;
    }

}
