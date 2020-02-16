const {DBSchemaString} = global.kernel.marshal.db.samples;

export default class ChatMessageString extends DBSchemaString{

    constructor(scope, schema = {},  data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {
                string: {
                    maxSize: scope.encryptedMessage.maxSize
                }
            },

        }));
    }

}