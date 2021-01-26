import {SimpleFile} from "@/main";
import {EncryptedCommunicator} from "@/crypto";

export class Message {
	text: string;
	images: SimpleFile[];
	files: SimpleFile[];
	communicator: EncryptedCommunicator;

	constructor(communicator: EncryptedCommunicator, text: string = '', images: SimpleFile[] = [], files: SimpleFile[] = []) {
		this.text = text;
		this.images = images;
		this.files = files;
		this.communicator = communicator;
	}

	encrypt(): Promise<EncryptedMessage> {
		let json = JSON.stringify({text: this.text, images: this.images, files: this.files});
		return this.communicator.symmetricEncrypt(json).then(cipher => {
			return new EncryptedMessage(this.communicator, cipher);
		});
	}
}

export class EncryptedMessage {
	cipher: string;
	communicator: EncryptedCommunicator;

	constructor(communicator: EncryptedCommunicator, cipher: string = '') {
		this.cipher = cipher;
		this.communicator = communicator;
	}

	decrypt(): Promise<Message> {
		return this.communicator.symmetricDecrypt(this.cipher).then(raw => {
			let unjsoned = JSON.parse(raw);
			if(unjsoned.error)
				return new Message(this.communicator, unjsoned.error)
			return new Message(this.communicator, unjsoned.text, unjsoned.images, unjsoned.files);
		});
	}
}