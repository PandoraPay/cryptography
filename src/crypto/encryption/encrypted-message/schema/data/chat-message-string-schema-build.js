const {StringSchemaBuild} = require('kernel').schemas.StringSchemaBuild;
const {Helper, EnumHelper, Exception} = require('kernel').helpers;

class ChatMessageStringSchemaBuild extends StringSchemaBuild {

    constructor( schema = {}) {

        super( Helper.merge({

            fields: {
                string: {
                    maxSize(){
                        return this._scope.argv.encryptedMessage.maxSize;
                    }
                }
            },

        }, schema, true ) );
    }

}

module.exports = {
    ChatMessageStringSchemaBuild,
    ChatMessageStringSchemaBuilt: new ChatMessageStringSchemaBuild(),
}