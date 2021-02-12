const {ChatMessageSchemaBuilt} = require('./chat-message-schema-build')
const {DBModel} = require('kernel').db;

module.exports = class EncryptedMessageModel extends DBModel {

    constructor(scope, schema = ChatMessageSchemaBuilt, data, type, creationOptions) {
        super(scope, schema, data, type, creationOptions);
    }

}