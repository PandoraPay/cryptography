const {Exception, EnumHelper, StringHelper, BufferHelper} = global.kernel.helpers;
import EncryptedMessage from "./../encrypted-message"

export default class EncryptedMessageValidator {

    constructor(scope){
        this._scope = scope;
    }

    validateEncryptedMessage(version){
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
        else if ( input instanceof ExchangeOffer) version = input.version;
        else if ( typeof input === "object" ) version = input.version;

        if (this.validateEncryptedMessage(version) ) return EncryptedMessage;

        throw new Exception(this, "EncryptedMessage couldn't be identified by version", version);

    }

    validateEncryptedMessage(input){

        const exchangeOfferClass = this.getEncryptedMessageClass( input );
        return new exchangeOfferClass( this._scope, undefined, input )

    }

    cloneEncryptedMessage(input){
        return this.validateEncryptedMessage(input);
    }

}