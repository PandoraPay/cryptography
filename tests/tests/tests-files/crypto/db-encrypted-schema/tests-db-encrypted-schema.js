const {BufferHelper} = global.kernel.helpers;

const {describe} = global.kernel.tests;

import DBEncryptedSchema from "src/crypto/encryption/db-encrypted-schema/db-encrypted-schema"

export default async function run () {

    describe("Encrypted Schema", {

        "encrypted schema password": async function () {

            const obj1 = new DBEncryptedSchema(this._scope);

            const secret = BufferHelper.generateRandomBuffer(32 );
            const password = BufferHelper.generateRandomBuffer(32 );

            obj1.setPlainTextValue(secret);

            this.expect( secret, obj1.decryptKey());

            obj1.encryptKey (password );

            this.expectError( it => obj1.decryptKey("Test"), secret );

            this.expect( secret, obj1.decryptKey( password ));

            this.expect( secret, obj1.decryptKey( ));

            const obj2 = new DBEncryptedSchema(this._scope);
            obj2.fromHex( obj1.toHex() );

            this.expectError( () => obj2.decryptKey("Test"), secret );
            this.expect( secret, obj2.decryptKey(password ));

            const password2 = BufferHelper.generateRandomBuffer(32 );
            obj2.changeEncryptionKey(password, password2);

            this.expect( obj1.value.equals(obj2.value), false);

            this.expect( obj1.decryptKey(password), obj2.decryptKey(password2 ));

        },

    });

}