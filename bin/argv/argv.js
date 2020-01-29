const {Helper} = global.kernel.helpers;

import ArgvCrypto from "./modules/crypto/argv-crypto"
import ArgvTransactions from "./modules/transactions/argv-transactions"

/**
 *
 * Crypto: Ring, RingCT
 *
 */


export default (argv) => Helper.merge( argv, {

    crypto: ArgvCrypto,
    transactions: ArgvTransactions,

});


