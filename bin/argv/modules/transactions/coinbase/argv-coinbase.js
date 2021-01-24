module.exports = {

    coinDenomination : 10000,

    //100 blocks lockTime for new mined coinbase transactions
    unlockTime: 100,

    getBlockRewardAt(height){
        return 10 * this.coinDenomination;
    }

}