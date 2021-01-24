const {Helper} = require('kernel').helpers;

module.exports = (argv) => Helper.merge( argv, {

    transactions:{
        ring:{
            mixins:{
                MIN_MIXINS: 3,
            }
        }
    }

})