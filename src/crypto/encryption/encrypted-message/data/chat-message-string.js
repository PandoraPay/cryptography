const {DBSchemaString} = require('kernel').marshal.db.samples;
const {Helper, EnumHelper, Exception} = require('kernel').helpers;

module.exports = class ChatMessageString extends DBSchemaString{

    constructor(scope, schema = {},  data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {
                string: {
                    maxSize: scope.argv.encryptedMessage.maxSize
                }
            },

        }, schema, false ), data, type, creationOptions);
    }

}