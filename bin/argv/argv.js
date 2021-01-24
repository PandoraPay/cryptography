const {Helper} = require('kernel').helpers;

const ArgvCrypto  = require("./modules/crypto/argv-crypto")
const ArgvTransactions  = require( "./modules/transactions/argv-transactions")
const ArgvEncryptedMessage  = require("./modules/encrypted-message/argv-encrypted-message")
const ArgvBlockchain  = require("./modules/blockchain/argv-blockchain")

/**
 *
 * Crypto: Ring, RingCT
 *
 */


module.exports = (argv) => Helper.merge( argv, {

    crypto: ArgvCrypto,
    transactions: ArgvTransactions,
    encryptedMessage: ArgvEncryptedMessage,
    blockchain: ArgvBlockchain,

});


