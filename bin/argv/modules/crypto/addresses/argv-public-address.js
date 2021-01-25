module.exports = {

    networkByte: 0,

    networkPrefix: "PANDORAPAY",
    networkPrefixBuffer: Buffer.from("PANDORAPAY", 'ascii'), //length must be 10

    _initArgv() {
        this.networkPrefixLength = this.networkPrefixBuffer.length;
    }

}