const {Exception, EnumHelper, StringHelper, BufferHelper} = require('kernel').helpers;
const EncryptedMessageModel = require( "../encrypted-message-model")

module.exports = class EncryptedMessageValidator {

    constructor(scope){
        this._scope = scope;
    }

    _validateEncryptedMessageVersion(version){
        if (version === 0) return true;
    }

    getEncryptedMessageClass(input){


        if (typeof input === "string") {

            if (StringHelper.isHex(input))
                input = Buffer.from(input, "hex");
            else
                input = JSON.parse(input);

        }

        let version;

        if (Buffer.isBuffer(input )) version = input[0];
        else if ( input instanceof EncryptedMessageModel) version = input.version;
        else if ( typeof input === "object" ) version = input.version;

        if (this._validateEncryptedMessageVersion(version) ) return EncryptedMessageModel;

        throw new Exception(this, "EncryptedMessage couldn't be identified by version", {version, input});

    }

    validateEncryptedMessage(input){

        const encryptedChatClass = this.getEncryptedMessageClass( input );
        if (input instanceof encryptedChatClass) return input;
        return new encryptedChatClass( this._scope, undefined, input )

    }

    cloneEncryptedMessage(input){
        return this.validateEncryptedMessage(input);
    }

}