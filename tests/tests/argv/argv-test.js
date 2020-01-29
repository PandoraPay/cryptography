const {Helper} = global.kernel.helpers;

export default (argv) => Helper.merge( argv, {

    transactions:{
        ring:{
            mixins:{
                MIN_MIXINS: 3,
            }
        }
    }

})