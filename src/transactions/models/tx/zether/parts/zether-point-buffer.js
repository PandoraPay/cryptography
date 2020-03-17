const {DBSchemaBuffer, DBSchemaString} = global.kernel.marshal.db.samples;

const {Helper,} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;

export default class ZetherPointBuffer extends DBSchemaBuffer {

    constructor(scope, schema = {},  data, type, creationOptions){

        super(scope, Helper.merge( {

            fields: {
                buffer: {
                    fixedBytes: 64,
                }
            },

        }, schema, false),  data, type, creationOptions);

    }

}
