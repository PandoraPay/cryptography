const {SchemaBuildString} = require('kernel').schema.SchemaBuildString;
const {Helper, EnumHelper, Exception} = require('kernel').helpers;

class SchemaBuildChatMessageString extends SchemaBuildString {

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
    SchemaBuildChatMessageString,
    SchemaBuiltChatMessageString: new SchemaBuildChatMessageString(),
}