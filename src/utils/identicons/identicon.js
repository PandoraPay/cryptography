import CreateIdenticon from "./create-identicon"

const BUFFER_SIZE = 200; //saving last identicons

class Identicon {

    constructor(){

        this._lastIdenticons = {};
        this._lastIdenticonsArray = [];

    }

    createIdenticon(address){

        let identicon;

        if (!this._lastIdenticons[address]){

            identicon = CreateIdenticon(address);
            this._lastIdenticons[address] = identicon;

        } else {

            identicon = this._lastIdenticons[address];

            const position = this._lastIdenticonsArray.indexOf(identicon);

            this._lastIdenticonsArray.splice(position, 1);

        }

        this._lastIdenticonsArray.push(address);
        if (this._lastIdenticonsArray.length > BUFFER_SIZE) {

            for (let i=0; i < this._lastIdenticonsArray.length - BUFFER_SIZE; i++)
                delete this._lastIdenticons[ this._lastIdenticonsArray[i] ];

            this._lastIdenticonsArray = this._lastIdenticonsArray.slice( this._lastIdenticonsArray.length - BUFFER_SIZE, this._lastIdenticonsArray.length);
        }


        return identicon;

    }

}

export default new Identicon();