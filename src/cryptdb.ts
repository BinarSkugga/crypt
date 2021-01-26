import {Database} from "./database";

export class CryptDB extends Database {
	createSchema(db: IDBDatabase): void {
		db.createObjectStore('KeyStore', {keyPath: 'id'})
	}
}