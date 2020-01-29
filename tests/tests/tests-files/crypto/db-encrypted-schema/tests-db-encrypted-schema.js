const {BufferHelper} = global.kernel.helpers;

const {describe} = global.kernel.tests;

import DBEncryptedSchema from "src/crypto/encryption/db-encrypted-schema/db-encrypted-schema"

export default async function run () {

    describe("Encrypted Schema", {

        "encrypted schema string password": async function () {

            const obj1 = new DBEncryptedSchema(this._scope);

            const secret = BufferHelper.generateRandomBuffer(32 );
            const password = "Password1";

            obj1.setPlainTextValue(secret);

            this.expect( secret, obj1.decryptKey("Test"));

            obj1.encryptKey (password );

            this.expectError( it => obj1.decryptKey("Test"), secret );

            this.expect( secret, obj1.decryptKey(password ));

            this.expect( secret, obj1.decryptKey( ));

            const obj2 = new DBEncryptedSchema(this._scope);
            obj2.fromHex( obj1.toHex() );

            this.expectError( () => obj2.decryptKey("Test"), secret );
            this.expect( secret, obj2.decryptKey(password ));

            const password2 = "Password2";
            obj2.changeEncryptionKey(password, password2);

            this.expect( obj1.value.equals(obj2.value), false);

            this.expect( obj1.decryptKey(password), obj2.decryptKey(password2 ));

        },

        "encrypted schema buffer password": async function () {

            const obj1 = new DBEncryptedSchema(this._scope);

            const secret = BufferHelper.generateRandomBuffer(32);
            const password = BufferHelper.generateRandomBuffer(32).toString("hex");

            obj1.setPlainTextValue(secret);

            this.expect( secret, obj1.decryptKey("Test"));

            obj1.encryptKey(password );

            this.expectError( it => obj1.decryptKey("Test"), secret );
            this.expect( secret, obj1.decryptKey(password ));

            const obj2 = new DBEncryptedSchema(this._scope);
            let json = obj1.toJSON();
            obj2.fromJSON( json );

            this.expectError( it => obj2.decryptKey("Test"), secret );
            this.expect( secret, await obj2.decryptKey(password ));

        }

    });

}