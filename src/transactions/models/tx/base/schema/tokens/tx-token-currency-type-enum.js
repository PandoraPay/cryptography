//THEY MUST BE IN HEX

module.exports = {

    /**
     * NATIVE CURRENCY
     */
    TX_TOKEN_CURRENCY_NATIVE_TYPE: {

        id: "",
        idBuffer: Buffer.alloc(0),

        idLong: Buffer.alloc(20).toString('hex'),
        idBufferLong: Buffer.alloc(20),

        name: "PANDORA",
        ticker: "PBOX", //must be uppercase
        description: "Native token",

    },

    _name: "TxTokenCurrencyTypeEnum",


}