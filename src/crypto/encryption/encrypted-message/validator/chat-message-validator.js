const {Exception, EnumHelper, StringHelper, BufferHelper} = require('kernel').helpers;
const ChatMessageModel = require( "../schema/chat-message-schema-build")

module.exports = class ChatMessageValidator {

    constructor(scope){
        this._scope = scope;
    }

    _validateChatMessageVersion(version){
        if (version === 0) return true;
    }

    getChatMessageClass(input){

        if (typeof input === "string") {

            if (StringHelper.isHex(input))
                input = Buffer.from(input, "hex");
            else
                input = JSON.parse(input);

        }

        let version;

        if (Buffer.isBuffer(input )) version = input[0];
        else if ( input instanceof ChatMessageModel) version = input.version;
        else if ( typeof input === "object" ) version = input.version;

        if (this._validateChatMessageVersion(version) ) return ChatMessageModel;

        throw new Exception(this, "getChatMessageClass couldn't be identified by version", {version, input});

    }

    validateChatMessage(input){

        const chatMessageClass = this.getChatMessageClass( input );
        if (input instanceof chatMessageClass) return input;
        return new chatMessageClass( this._scope, undefined, input )

    }

    cloneChatMessage(input){
        return this.validateChatMessage(input);
    }

}