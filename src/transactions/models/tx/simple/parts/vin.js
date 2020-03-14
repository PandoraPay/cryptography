import TransactionTokenCurrencyTypeEnum from "../../base/tokens/transaction-token-currency-type-enum";

const {Helper, Exception, StringHelper, BufferHelper} = global.kernel.helpers;
const {DBSchema} = global.kernel.marshal.db;
const {CryptoHelper} = global.kernel.helpers.crypto;

export default class Vin extends DBSchema {

    constructor(scope, schema={}, data, type, creationOptions) {

        super(scope, Helper.merge({

            fields: {

                publicKey: {

                    type: "buffer",

                    fixedBytes: 33,

                    preprocessor(publicKey){
                        this._publicKeyHash = undefined;
                        this._address = undefined;
                        return publicKey;
                    },

                    position: 100,
                },

                amount: {

                    type: "number",

                    minSize: 1,

                    position: 101,
                },

                tokenCurrency: {

                    type: "buffer",
                    maxSize: 20,
                    minSize: 1,

                    default: TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer,

                    validation(value) {
                        return value.equals( TransactionTokenCurrencyTypeEnum.TX_TOKEN_CURRENCY_NATIVE_TYPE.idBuffer ) || (value.length === 20);
                    },

                    position : 102,
                },


                signature: {

                    type: "buffer",
                    fixedBytes: 65,

                    removeLeadingZeros: true, //it used useful when two inputs have the same publicKeyHash as the 2nd signature will be filled with zeros

                    position: 103,
                }

            },

            options: {
                hashing: {
                    enabled: true,
                    parentHashingPropagation: true,
                    fct: (b)=>b,
                },
            }

        }, schema, false), data, type, creationOptions);


    }

    get publicKeyHash(){

        if (!this._publicKeyHash)
            this._publicKeyHash = this._scope.cryptography.addressGenerator.generatePublicKeyHash( this.publicKey );

        return this._publicKeyHash;

    }

    get address(){

        if (!this._address)
            this._address = this._scope.cryptography.addressGenerator.generateAddressFromPublicKey( this.publicKey ).calculateAddress();

        return this._address;
    }

}

