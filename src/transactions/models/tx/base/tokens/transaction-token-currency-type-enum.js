//THEY MUST BE IN HEX

export default {

    /**
     * NATIVE CURRENCY
     */
    TX_TOKEN_CURRENCY_NATIVE_TYPE: {

        id: "00",

        publicKeys: ()=>{
            return [];
        }

    },

    /**
     *
     * BACKED CURRENCY BY US
     * LATER ON WE CAN USE ANOTHER STATE TO STORE ALL TOKENS
     *
     */

    TX_TOKEN_CURRENCY_US_TYPE: {
        id: "01",

        publicKeys: (height, scope) => {

            return [  ]

        },

    },

    TX_TOKEN_CURRENCY_EU_TYPE: {
        id: "02",

        publicKeys: (height, scope) => {

        }

    },

    TX_TOKEN_CURRENCY_RO_TYPE: {
        id: "03",

        publicKeys: (height, scope) => {

        }

    },

    _name: "TransactionTokenCurrencyTypeEnum",


}