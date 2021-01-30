const EncryptedMessageDBModel = require( "../encrypted-message-db-model");
const ChatMessage = require("../schema/chat-message-db-schema-build")

const {Exception} = require('kernel').helpers;

module.exports = class EncryptedMessageCreator {

    constructor(scope){
        this._scope = scope;
    }

    async createEncryptedMessage( { senderPublicKey, receiverPublicKey, data  } ){

        const chatMessage = new ChatMessage( this._scope, undefined, data );

        const roundTime = 5*60; //5 minutes

        const data2 = {
            version: 0,
            timestamp: Math.floor ( new Date().getTime()/1000 ),
            nonce: 0,
            senderPublicKey: senderPublicKey,
            receiverPublicKey: receiverPublicKey,
            senderEncryptedData: Buffer.alloc(1),
            receiverEncryptedData: Buffer.alloc(1),
        };

        const encryptedMessage = new EncryptedMessage( this._scope, undefined, data2 );

        const senderEncryptedData = await encryptedMessage.encryptData( chatMessage.toBuffer(), encryptedMessage.senderPublicKey );
        encryptedMessage.senderEncryptedData = senderEncryptedData;

        const receiverEncryptedData = await encryptedMessage.encryptData( chatMessage.toBuffer(), encryptedMessage.receiverPublicKey );
        encryptedMessage.receiverEncryptedData = receiverEncryptedData;

        return {
            chatMessage,
            encryptedMessage,
        };

    }

}