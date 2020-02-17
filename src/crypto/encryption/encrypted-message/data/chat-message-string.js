const {DBSchemaString} = global.kernel.marshal.db.samples;
const {Helper, EnumHelper, Exception} = global.kernel.helpers;

export default class ChatMessageString extends DBSchemaString{

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