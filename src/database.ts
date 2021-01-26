const uuid = require('uuid');

interface TransactionCallable {
	(store: IDBObjectStore, db: Database): void;
}

export abstract class Database {
	db: string;

	constructor(db: string) {
		this.db = db
		let connection = indexedDB.open(this.db);
		connection.onupgradeneeded = () => {
			let db = connection.result;
			this.createSchema(db);
			db.close();
			console.log('Database created.')
		};
	}

	abstract createSchema(db: IDBDatabase): void;

	newId() {
		return uuid.v4();
	}

	transaction(table: string, fn: TransactionCallable): void {
		let connection = indexedDB.open(this.db);
		connection.onsuccess = () => {
			let db = connection.result;
			let tx = db.transaction(table, 'readwrite');
			let store = tx.objectStore(table);

			fn(store, this);

			tx.oncomplete = () => {
				db.close();
			}
		};
	}
}
