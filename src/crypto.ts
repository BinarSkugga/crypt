// @ts-ignore
export const crypto = window.crypto || window.msCrypto;
const pako = require('pako');

enum SymmetricAlgorithms {
	AES_CBC = 'AES-CBC'
}

enum AsymmetricAlgorithms {
	ECDSA = 'ECDSA',
	ECDH = 'ECDH',
}

enum AsymmetricCurves {
	P_256 = 'P-256',
	P_384 = 'P-384',
	P_512 = 'P-512'
}

enum DigestAlgoritms {
	SHA_256 = 'SHA-256',
	SHA_512 = 'SHA-512'
}


export class EncryptedCommunicator {
	symAlgo: { name: SymmetricAlgorithms, length: number };
	asymAlgo: { name: AsymmetricAlgorithms, namedCurve: AsymmetricCurves };

	// @ts-ignore
	symKey: CryptoKey;
	// @ts-ignore
	asymKey: { public: CryptoKey, private: CryptoKey };

	constructor() {
		this.symAlgo = {name: SymmetricAlgorithms.AES_CBC, length: 256};
		this.asymAlgo = {name: AsymmetricAlgorithms.ECDH, namedCurve: AsymmetricCurves.P_384}
	}

	handshake(remotePublic: CryptoKey): Promise<EncryptedCommunicator> {
		return this.generateAsymmetricKey().then(keyPair => {
			this.asymKey = keyPair
			return this.deriveShared(remotePublic, this.asymKey.private).then(sharedKey => {
				this.symKey = sharedKey;
				return this;
			})
		});
	}

	str_ab(data: string) {
		let bytes = new Uint8Array(data.length);
		for (let iii = 0; iii < data.length; iii++)
			bytes[iii] = data.charCodeAt(iii);
		return bytes;
	}

	ab_str(data: ArrayBuffer) {
		let str = "";
		for (let iii = 0; iii < data.byteLength; iii++)
				// @ts-ignore
			str += String.fromCharCode(data[iii]);
		return str;
	}

	buf2hex(buffer: ArrayBuffer): string {
		return [...new Uint8Array (buffer)]
				.map(b => b.toString(16).padStart(2, "0"))
				.join("");
	}

	generateAsymmetricKey(): Promise<{ public: CryptoKey, private: CryptoKey }> {
		return <Promise<{ public: CryptoKey, private: CryptoKey }>>crypto.subtle.generateKey(this.asymAlgo, true, ['deriveKey'])
				.then(key => {
					key = <CryptoKeyPair>key;
					return {public: key.publicKey, private: key.privateKey};
				});
	}

	deriveShared(publicKey: CryptoKey, privateKey: CryptoKey): Promise<CryptoKey> {
		return <Promise<CryptoKey>>crypto.subtle.deriveKey(
				{name: this.asymAlgo.name, public: publicKey}, privateKey,
				this.symAlgo, false, ['encrypt', 'decrypt']);
	}

	exportKey(key: CryptoKey) {
		return crypto.subtle.exportKey('jwk', key);
	}

	symmetricEncrypt(data: string): Promise<string> {
		let ab = this.str_ab(data);
		return <Promise<string>> crypto.subtle.digest(DigestAlgoritms.SHA_256, ab).then(sha => {
			data += '::' + this.buf2hex(sha)
			ab = this.str_ab(data);
			let iv = crypto.getRandomValues(new Uint8Array(16))
			return crypto.subtle.encrypt({
				name: this.symAlgo.name,
				iv: iv
			}, this.symKey, ab).then(cipher => {
				let compressed = pako.deflate(new Uint8Array(cipher))
				return this.ab_str(iv) + this.ab_str(compressed);
			});
		});
	}

	symmetricDecrypt(data: string): Promise<string> {
		let iv = new Uint8Array(this.str_ab(data.substring(0, 16)));
		let ab = this.str_ab(data.substring(16));
		let uncompressed = pako.inflate(new Uint8Array(ab));
		return <Promise<string>>crypto.subtle.decrypt({
			name: this.symAlgo.name,
			iv: iv
		}, this.symKey, uncompressed.buffer).then(plain => {
			let brokenStr = this.ab_str(new Uint8Array(plain)).split('::');
			let sha = brokenStr[1];
			let message = brokenStr[0];
			return <Promise<string>> crypto.subtle.digest(DigestAlgoritms.SHA_256, this.str_ab(message)).then(sha2 => {
				if(this.buf2hex(sha2) === sha)
					return message;
				else
					return '{"error": "Message was compromised, please regenerate your keys."}'
			});
		});
	}
}