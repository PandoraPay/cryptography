const {DBSchemaBuild} = PandoraLibrary.db;
const {Helper, Exception} = PandoraLibrary.helpers;
const {CryptoHelper} = PandoraLibrary.helpers.crypto;

const TxScriptTypeEnum = require("./tx-script-type-enum")
const TxTypeEnum = require( "./tx-type-enum")

class BaseTxSchemaBuild extends DBSchemaBuild {

    constructor(schema) {

        super( Helper.merge({

            fields: {

                version: {

                    type: "number",

                    default: TxTypeEnum.PUBLIC_TRANSACTION,

                    validation(value){
                        return value === TxTypeEnum.PUBLIC_TRANSACTION;
                    },

                    position: 100,

                },

                scriptVersion:{
                    type: "number",

                    default: TxScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION,

                    validation(value){
                        return value === TxScriptTypeEnum.TX_SCRIPT_SIMPLE_TRANSACTION;
                    },

                    position: 101,
                },

                networkByte: {

                    type: "number",

                    default() {
                        return this._scope.argv.crypto.addresses.publicAddress.networkByte;
                    },

                    validation(networkByte){

                        if ( this._scope.argv.crypto.addresses.publicAddress.networkByte !== networkByte )
                            throw new Exception(this, "network byte is invalid");

                        return true;
                    },

                    position: 102,
                },

                unlockTime: {

                    type: "number",

                    default: 0,

                    position: 103,
                },

                extra: {
                    type: "buffer",
                    minSize:0,
                    maxSize: 512,

                    position: 104,
                },

            },

        }, schema, true));
    }

}

module.exports = {
    BaseTxSchemaBuild,
    BaseTxSchemaBuilt : new BaseTxSchemaBuild(),
}