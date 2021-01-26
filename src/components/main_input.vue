<template>
	<div class="p-grid p-pr-1">
		<input ref="imageInput" type="file" style="display: none;" accept="image/*" multiple @input="fileUpload($event, encodedImages)"/>
		<input ref="fileInput" type="file" style="display: none;" multiple @input="fileUpload($event, encodedFiles)"/>

		<div class="p-col-12 file-col"
			 :style="{height: (allFiles.length > 0 ? fileHeight + 10 : 0) + 'px', opacity: (allFiles.length > 0 ? 1:0)}">
			<div class="file-wrapper p-d-inline-block" v-for="(file, index) in allFiles">
				<img v-if="file.type === 'image'" :src="file.base64" :style="{height: fileHeight + 'px'}"
					 v-tooltip="file.name"/>
				<div v-else-if="fileExtentions.includes(file.ext)" class="file" :data-ext="file.ext" v-tooltip="file.name"></div>
				<div v-else class="file default" v-tooltip="file.name"></div>
				<span class="file-cancel" @click="removeFile(file)">x</span>
			</div>
		</div>
		<div class="p-col-fixed p-p-0 additional-col"
			 :style="{width: (!textFocused ? altWidth : 35) + 'px'}">
			<div class="p-p-3 t-overflow">
				<i class="pi pi-ellipsis-v p-ripple primary clickable-icon" v-ripple></i>
				<i class="pi pi-images p-ripple primary clickable-icon" v-ripple @click="openUploadDialog(imageInput)"></i>
				<i class="pi pi-link p-ripple primary clickable-icon" v-ripple @click="openUploadDialog(fileInput)"></i>
			</div>
		</div>
		<div class="p-col text-col">
			<div class="p-input-icon-right p-d-block">
				<TextArea :autoResize="true" rows="1" placeholder="Send a crypt..."
						  style="width: 100%;" v-model="text" @keypress.enter="send"
						  @focus="textFocused = true" @blur="textFocused = false">
				</TextArea>
				<i class="pi pi-send p-ripple primary clickable-icon input" @click="send" v-ripple></i>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref, computed} from 'vue'
import Ripple from 'primevue/ripple';
import Tooltip from 'primevue/tooltip';
import {SimpleFile, fileExtentions, cryptdb} from "@/main";
import {Message} from "@/message";
import {EncryptedCommunicator} from "@/crypto";

export default defineComponent({
	// @ts-ignore
	directives: {Ripple, Tooltip},
	props: {
		altWidth: {type: Number, default: 100},
		fileHeight: {type: Number, default: 45}
	},
	emits: ['send'],
	setup(props, {emit}) {
		const text = ref<string>('');
		const textFocused = ref<boolean>(false);

		const uploadingFiles = ref<boolean>(false);
		const imageInput = ref<HTMLInputElement>();
		const encodedImages = ref<SimpleFile[]>([]);
		const fileInput = ref<HTMLInputElement>();
		const encodedFiles = ref<SimpleFile[]>([]);

		return {
			text, textFocused, fileExtentions,
			uploadingFiles, imageInput, encodedImages, fileInput, encodedFiles,
			openUploadDialog: (input: HTMLInputElement) => {
				uploadingFiles.value = true;
				input.click();
			},
			removeFile(file: SimpleFile) {
				if(file.type === 'image' && !encodedFiles.value.includes(file))
					encodedImages.value = encodedImages.value.filter(i => i.base64 !== file.base64)
				else
					encodedFiles.value = encodedFiles.value.filter(i => i.base64 !== file.base64)
			},
			fileUpload: (e: InputEvent, recipient: SimpleFile[]) => {
				let element: HTMLInputElement = e.target as HTMLInputElement;
				let files: FileList = element.files as FileList;
				let uploadCount = 0;

				if(files.length === 0)
					uploadingFiles.value = false;
				else {
					Array.from(files).forEach(file => {
						let reader: FileReader = new FileReader();
						reader.onload = (e: ProgressEvent) => {
							let fr = <FileReader> e.target;
							let simpleFile: SimpleFile = {
								base64: <string> fr.result,
								name: file.name,
								size: file.size,
								type: file.type.split('/')[0],
								ext: file.name.includes('.') ? file.name.split('.').slice(-1)[0] : '?'
							}

							if(!recipient.includes(simpleFile))
								recipient.push(simpleFile);

							uploadCount++;
							if(uploadCount === files.length) {
								uploadingFiles.value = false;
							}
						}

						reader.readAsDataURL(file)
					});
				}
			},
			allFiles: computed<SimpleFile[]>(() => {
				return encodedImages.value.concat(encodedFiles.value);
			}),
			send: (e: KeyboardEvent) => {
				let tempec = new EncryptedCommunicator();
				tempec.generateAsymmetricKey().then(keyPair => {
					let remotePublic = keyPair.public;
					tempec.handshake(remotePublic).then(ec => {
						let txt = text.value.trim();
						let images = [...encodedImages.value];
						let files = [...encodedFiles.value];

						if (!e.shiftKey) {
							e.preventDefault();
							text.value = '';
							encodedImages.value = [];
							encodedFiles.value = [];

							let message: Message = new Message(ec);
							let hasContent = false;

							if(txt.length > 0) {
								message.text = txt;
								hasContent = true;
							}

							if(files.length > 0) {
								let to_rm: number[] = [];
								files.forEach((file, index) => {
									if(file.type === 'image') {
										images.push(file);
										to_rm.push(index);
									}
								});

								to_rm.forEach(ind => {
									files.splice(ind, 1);
								});

								message.files = files;
							}

							if(images.length > 0) {
								message.images = images;
								hasContent = true;
							}

							if(hasContent)
								emit('send', message.encrypt());
						}
					});
				});
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.clickable-icon {
	padding: 5px;
	font-weight: 600;
	border-radius: 50%;
	cursor: pointer;

	&.input {
		padding: 10px;
		margin-top: -20px;
		margin-right: -5px;
	}
}

.additional-col, .text-col {
	height: 50px;
}

.additional-col {
	transition: width 500ms;
	white-space: nowrap;
}

.file-col {
	padding: 0;
	transition: height 200ms, opacity 500ms;

	img {
		border-radius: 4px;
		&+img {
			margin-left: 5px;
		}
	}
	.file-wrapper {
		position: relative;
		padding: 5px;

		.file-cancel {
			opacity: 0;
			position: absolute;
			right: 3px;
			top: 3px;
			font-family: sans-serif;
			font-size: 10px;
			background-color: rgba(0, 0, 0, 0.6);
			color: white;
			padding: 3px 4px 5px;
			line-height: 5px;
			border-radius: 50%;
			cursor: pointer;
		}
		&:hover {
			.file-cancel {
				opacity: 1;
			}
		}
	}
}
</style>