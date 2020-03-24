const {Exception, StringHelper, ArrayHelper, BufferHelper, BufferReader, Base58} = global.kernel.helpers;
const {Logger} = global.kernel;

import ZetherPrivateKeyAddress from "../address/private/zether-private-key-address";
import ZetherAddress from "../address/public/zether-address";

/**
 * Enables Hierarchical Deterministic Wallets
 */

export default class ZetherAddressGenerator{

    constructor(scope){

        this._scope = scope;

    }

    generateZetherAddressFromPublicKey(publicKey, registration, networkByte = this._scope.argv.crypto.addresses.publicAddress.publicAddressNetworkByte_Main){

        if (typeof publicKey === "string" && StringHelper.isHex(publicKey)) publicKey = Buffer.from(publicKey, "hex");
        if (!Buffer.isBuffer(publicKey) || publicKey.length !== 64 ) throw new Exception(this, "PublicKey is invalid");

        return new ZetherAddress(this._scope, undefined, {
            networkByte,
            publicKey,
            registration: registration ? {
                registered: 1,
                c: registration.c,
                s: registration.s,
            } : undefined,
        })

    }

    generateZetherPrivateAddressFromPrivateKey( privateKey ){

        return new ZetherPrivateKeyAddress( this._scope, undefined, {
            privateKey,
        } );

    }

}

