import EncryptedMessage from "../encrypted-message";
import ChatMessage from "../chat-message"

const {Exception} = global.kernel.helpers;

export default class EncryptedMessageCreator {

    constructor(scope){
        this._scope = scope;
    }

    async createEncryptedMessage( { senderPublicKey, text, destinationPublicKey  } ){

        const data = {
            version: 0,
            senderPublicKey: senderPublicKey,
            script: 0,
            data: Buffer.from( text, "ascii"),
        };

        const chatMessage = new ChatMessage( this._scope, undefined, data );

        //console.log("chatMessage", chatMessage);

        const roundTime = 5*60; //5 minutes

        const data2 = {
            version: 0,
            timestamp: Math.round ( new Date().getTime()/1000 / roundTime ) * roundTime,
            nonce: 0,
            destinationPublicKey: destinationPublicKey,
            encryptedData: Buffer.alloc(1),
            verifiedSignature: Buffer.alloc(65),
        };

        const encryptedMessage = new EncryptedMessage( this._scope, undefined, data2 );

        await encryptedMessage.encryptData( chatMessage.toBuffer() );

        return encryptedMessage;

    }

}