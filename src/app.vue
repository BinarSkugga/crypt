<template>
    <div id="app">
        <v-message v-for="(message, i) in messages" v-bind:key="i"
                   :message="message" :sending="form.sending" :selected="selected" :foreign="false"
                   @onSelect="onSelect" @onDelete="onDelete" @onEdit="onEdit"></v-message>
        <el-form class="send-form" :model="form" @submit.native.prevent>
            <el-form-item>
                <el-input v-if="form.editing == null" placeholder="Aa" v-model="form.message"
                          ref="mainInput" @keyup.native.enter="submit()"
                            @keyup.native.up="editLast()">
                    <el-button class="input-appended" type="primary"
                               slot="append" @click="submit()"
                               :disabled="form.message.trim().length === 0">
                        SEND
                    </el-button>
                </el-input>
                <el-input v-else placeholder="Aa" v-model="form.editing.text" ref="mainInput"
                          @keyup.native.enter="submitEdit()" @keyup.native.esc="onClear"
                          clearable @clear="onClear">
                    <el-button class="input-appended" type="primary"
                               slot="append" @click="submitEdit()"
                               :disabled="form.editing.text.trim().length === 0">
                        EDIT
                    </el-button>
                </el-input>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import {mapActions, mapState} from 'vuex'
    import message from '@/components/message'

    export default {
        name: 'app',
        components: {
            'v-message': message
        },
        data: function () {
            return {
                id: 0,
                selected: -1,
                form: {
                    message: '',
                    editing: null,
                    sending: {}
                }
            };
        },
        methods: {
            ...mapActions('message', ['sendText', 'delete', 'edit']),
            submit() {
                if (this.form.message.trim().length > 0) {
                    this.form.sending[this.id] = true;

                    this.sendText({text: this.form.message, id: this.id}).then(message => {
                        delete this.form.sending[message.id];
                        this.form.sending = JSON.parse(JSON.stringify(this.form.sending));
                    });

                    this.id += 1;
                    this.form.message = '';
                }
            },
            submitEdit() {
                let message = this.form.editing;
                this.form.sending[message.id] = true;
                this.edit(message).then(() => {
                    delete this.form.sending[message.id];
                    this.form.sending = JSON.parse(JSON.stringify(this.form.sending));
                });
                this.form.editing = null;
                this.selected = -1;
            },
            editLast() {
                if(this.messages && this.messages.length > 0) {
                    let lastMessage = this.messages[this.messages.length - 1];
                    this.selected = lastMessage.id;
                    this.onEdit(lastMessage);
                }
            },
            onClear() {
                this.form.editing = null;
                this.selected = -1
            },
            onSelect(message) {
                if (this.selected === message.id) this.selected = -1;
                else this.selected = message.id;
            },
            onEdit(message) {
                this.form.message = '';
                this.form.editing = JSON.parse(JSON.stringify(message));
                this.$refs.mainInput.focus();
            },
            onDelete(message) {
                this.form.sending[message.id] = true;
                this.selected = -1;
                this.delete(message).then(() => {
                    delete this.form.sending[message.id];
                    this.form.sending = JSON.parse(JSON.stringify(this.form.sending));
                });
            }
        },
        computed: {
            ...mapState({
                messages: state => state.message.messages
            })
        }
    }
</script>

<style scoped lang="scss">
    .send-form {
        margin-top: 15px;
    }
</style>
