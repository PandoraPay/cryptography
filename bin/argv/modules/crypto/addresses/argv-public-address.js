export default {

    publicAddressNetworkByte_Main: 0,
    publicAddressNetworkByte_Testnet: 128,


    isAddress(networkByte){
        return networkByte === this.publicAddressNetworkByte_Main || networkByte === this.publicAddressNetworkByte_Testnet;
    },

    isTestNetAddress(networkByte){
        return networkByte === this.publicAddressNetworkByte_Testnet;
    },

    isMainNetAddress(networkByte){
        return networkByte === this.publicAddressNetworkByte_Main;
    }

}