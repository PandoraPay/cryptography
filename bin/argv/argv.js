const {Helper} = global.kernel.helpers;

import ArgvCrypto from "./modules/crypto/argv-crypto"
import ArgvTransactions from "./modules/transactions/argv-transactions"
import ArgvEncryptedMessage from "./modules/encrypted-message/argv-encrypted-message"

/**
 *
 * Crypto: Ring, RingCT
 *
 */


export default (argv) => Helper.merge( argv, {

    crypto: ArgvCrypto,
    transactions: ArgvTransactions,
    encryptedMessage: ArgvEncryptedMessage,

});


