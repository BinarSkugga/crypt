<template>
    <div id="app">
        <div class="messages">
            <v-message v-for="(message, i) in messages" v-bind:key="i"
                   :message="message" :previousMessage="previousMessage(message)" :sending="form.sending"
                   :selected="selected" :foreign="message.user !== form.user" @onSelect="onSelect" @onDelete="onDelete" @onEdit="onEdit">
            </v-message>
        </div>
        <el-form class="send-form" :model="form" @submit.native.prevent>
            <el-form-item>
                <el-input v-if="form.editing == null" placeholder="Aa"
                          v-model="form.message" minlength="1" maxlength="500" show-word-limit
                          ref="mainInput" @keyup.native.enter="submit()" @keyup.native.up="editLast()">
                    <el-button class="input-appended" type="primary"
                               slot="append" @click="submit()"
                               :disabled="isInputDisabled">
                        SEND
                    </el-button>
                </el-input>
                <el-input v-else placeholder="Aa" v-model="form.editing.text"
                          ref="mainInput" minlength="1" maxlength="500" show-word-limit
                          @keyup.native.enter="submitEdit()" @keyup.native.esc="onClear"
                          clearable @clear="onClear">
                    <el-button class="input-appended" type="primary"
                               slot="append" @click="submitEdit()"
                               :disabled="isInputDisabled">
                        EDIT
                    </el-button>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-row :gutter="15">
                    <el-col :span="12">
                        <el-input placeholder="Channel" v-model="form.channel"
                                  minlength="1" maxlength="24" show-word-limit>
                            <el-button class="input-appended" type="primary"
                                       icon="el-icon-refresh" slot="append" @click="generateChannel(24)"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="12">
                        <el-input placeholder="Username" v-model="form.user"
                                  minlength="1" maxlength="16" show-word-limit></el-input>
                    </el-col>
                </el-row>
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
                selected: -1,
                form: {
                    user: null,
                    channel: null,
                    message: '',
                    editing: null,
                    sending: {}
                }
            };
        },
        methods: {
            ...mapActions('message', ['sendText', 'delete', 'edit']),
            submit() {
                if (!this.isInputDisabled) {
                    this.form.sending[this.id] = true;

                    this.sendText({text: this.form.message, user: this.form.user}).then(message => {
                        delete this.form.sending[message.id];
                        this.form.sending = JSON.parse(JSON.stringify(this.form.sending));
                    });

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
                    let lastMessage = null;
                    this.messages.forEach(v => {
                       if(v.user === this.form.user) lastMessage = v;
                    });

                    if(lastMessage !== null && !lastMessage.deleted) {
                        this.selected = lastMessage.id;
                        this.onEdit(lastMessage);
                    }
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
                if(!message.deleted) {
                    this.form.message = '';
                    this.form.editing = JSON.parse(JSON.stringify(message));
                    this.$refs.mainInput.focus();
                }
            },
            onDelete(message) {
                this.form.sending[message.id] = true;
                this.selected = -1;
                this.delete(message).then(() => {
                    delete this.form.sending[message.id];
                    this.form.sending = JSON.parse(JSON.stringify(this.form.sending));
                });
            },
            generateChannel(length) {
                let channel = '';
                let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (let i = 0; i < length; i++)
                    channel += chars.charAt(Math.floor(Math.random() * chars.length));

                this.form.channel = channel;
            },
            previousMessage(current) {
                let index = -1;
                this.messages.forEach((v, i) => {
                    if(v.id === current.id) index = i - 1;
                });
                if(-1 < index < this.messages.length)
                    return this.messages[index];
                else
                    return null;
            }
        },
        computed: {
            ...mapState({
                messages: state => state.message.messages,
                id: state => state.message.id
            }),
            isInputDisabled() {
                let result = false;
                if(this.form.editing == null)
                    result = this.form.message.trim().length === 0 || this.form.user == null;
                else
                    result = this.form.editing.text.trim().length === 0 || this.form.user == null;

                if(!result) {
                    console.log('haha')
                }
                return result;
            }
        }
    }
</script>

<style scoped lang="scss">
    #app {
        width: 700px;
    }

    .messages {
        padding: 5px;
    }

    .send-form {
        margin-top: 15px;
    }
</style>
