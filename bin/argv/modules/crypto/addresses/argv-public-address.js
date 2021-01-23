export default {

    publicAddressPrefixLength: 11,

    publicAddressNetworkByte_Main: 0,
    publicAddressPrefix_MainStr: "PANDORAPAY", //length must be 11
    publicAddressPrefix_Main: Buffer.from(this.publicAddressPrefix_MainStr, "ascii"),

    publicAddressNetworkByte_Testnet: 128,
    publicAddressPrefix_TestnetStr: "PANDORATEST",
    publicAddressPrefix_Testnet: Buffer.from( this.publicAddressPrefix_TestnetStr, "ascii"),

    isAddress(networkByte){
        return networkByte === this.publicAddressNetworkByte_Main || networkByte === this.publicAddressNetworkByte_Testnet;
    },

    getAddressPrefix(networkByte){
        if ( networkByte === this.publicAddressNetworkByte_Main ) return this.publicAddressPrefix_Main;
        if ( networkByte === this.publicAddressPrefix_Testnet ) return this.publicAddressPrefix_Testnet;
        throw "invalid network byte"
    },

    getAddressPrefixStr(networkByte){
        if ( networkByte === this.publicAddressNetworkByte_Main ) return this.publicAddressPrefix_MainStr;
        if ( networkByte === this.publicAddressPrefix_Testnet ) return this.publicAddressPrefix_TestnetStr;
        throw "invalid network byte"
    },

    isTestNetAddress(networkByte){
        return networkByte === this.publicAddressNetworkByte_Testnet;
    },

    isMainNetAddress(networkByte){
        return networkByte === this.publicAddressNetworkByte_Main;
    }

}