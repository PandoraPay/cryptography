const {StringDBSchemaBuild} = require('kernel').schemas.StringDBSchemaBuild;
const {Helper, EnumHelper, Exception} = require('kernel').helpers;

class ChatMessageStringDBSchemaBuild extends StringDBSchemaBuild {

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
    ChatMessageStringDBSchemaBuild,
    ChatMessageStringDBSchemaBuilt: new ChatMessageStringDBSchemaBuild(),
}