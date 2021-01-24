export default {

    publicAddressPrefixLength: 10,

    publicAddressNetworkByte_Main: 0,
    publicAddressPrefix_MainStr: "PANDORAPAY", //length must be 10

    publicAddressNetworkByte_Testnet: 128,
    publicAddressPrefix_TestnetStr: "PANDORATST",

    isAddress(networkByte) {
        return networkByte === this.publicAddressNetworkByte_Main || networkByte === this.publicAddressNetworkByte_Testnet;
    },

    getAddressPrefix(networkByte) {
        if (networkByte === this.publicAddressNetworkByte_Main) return this.publicAddressPrefix_Main;
        if (networkByte === this.publicAddressNetworkByte_Testnet) return this.publicAddressPrefix_Testnet;
        throw "invalid network byte"
    },

    getAddressPrefixStr(networkByte) {
        if (networkByte === this.publicAddressNetworkByte_Main) return this.publicAddressPrefix_MainStr;
        if (networkByte === this.publicAddressNetworkByte_Testnet) return this.publicAddressPrefix_TestnetStr;
        throw "invalid network byte"
    },

    isTestNetAddress(networkByte) {
        return networkByte === this.publicAddressNetworkByte_Testnet;
    },

    isMainNetAddress(networkByte) {
        return networkByte === this.publicAddressNetworkByte_Main;
    },

    _initArgv() {
        if (this.publicAddressPrefix_MainStr.length !== this.publicAddressPrefixLength) throw "invalid main net string length";
        if (this.publicAddressPrefix_TestnetStr.length !== this.publicAddressPrefixLength) throw "invalid test net length";

        this.publicAddressPrefix_Testnet = Buffer.from(this.publicAddressPrefix_TestnetStr, "ascii");
        this.publicAddressPrefix_Main = Buffer.from(this.publicAddressPrefix_MainStr, "ascii");
    }

}