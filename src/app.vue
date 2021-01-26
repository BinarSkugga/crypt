<template>
	<main_input @send="onSend"></main_input>
	<div id="imgDump"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import main_input from "@/components/main_input.vue";
import {EncryptedMessage, Message} from "@/message";
import prettyBytes from "pretty-bytes";

export default defineComponent({
	components: {main_input},
	setup() {
		return {
			onSend: (encryptedMessagePromise: Promise<EncryptedMessage>) => {
				encryptedMessagePromise.then(em => {
					console.log('Cipher length: ', em.cipher.length);
					console.log('Cipher size: ', prettyBytes(new TextEncoder().encode(em.cipher).length));
					em.decrypt().then((message: Message) => {
						console.log(message);
					});
				});
			}
		}
	}
});
</script>

<style>
</style>
