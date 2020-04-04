<template>
    <div class="message-box" :class="{foreign: foreign}">
        <span v-if="showUser" class="user-label">{{message.user}}</span>
        <el-tag v-if="!message.deleted" :type="foreign ? 'info' : 'primary'"
                effect="dark" v-loading="sending[message.id]" @click="onSelect(message)">
            {{message.text}}
        </el-tag>
        <el-tag v-else type="info" effect="plain">
            {{message.text}}
        </el-tag>
        <div class="message-info" :class="{active: (selected === message.id)}">
            {{new Date(message.date).toLocaleString()}}
            <span v-if="message.edited"> (Edited) </span>
            <span v-if="!foreign && !message.deleted">
                <b>&middot; </b>
                <span class="message-edit" @click="onEdit(message)">Edit</span>
                <b> &middot; </b>
                <span class="message-delete" @click="onDelete(message)">Delete</span>
            </span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'message',
        props: ['message', 'sending', 'selected', 'foreign', 'previousMessage'],
        methods: {
            onSelect(message) {
                this.$emit('onSelect', message)
            },
            onEdit(message) {
                this.$emit('onEdit', message)
            },
            onDelete(message) {
                this.$emit('onDelete', message)
            }
        },
        computed: {
            showUser() {
                if(this.previousMessage == null) return true;
                if(!this.foreign) return false;

                let timeDiff = (new Date(this.message.date).getTime() - new Date(this.previousMessage.date).getTime()) / 1000;
                return timeDiff > 60 * 15 || this.message.user !== this.previousMessage.user;
            }
        }
    }
</script>

<style scoped lang="scss">
    .message-box {
        cursor: default;
        text-align: right;

        & + .message-box {
            margin-top: 3px;
        }

        &.foreign {
            text-align: left;
            .message-info, .el-tag {
                margin-right: 0;
                margin-left: 10px;
            }
        }

        .user-label {
            display: block;
            color: var(--color-info);
            margin-top: 15px;
            margin-bottom: 5px;
        }

        .message-info {
            height: 0;
            opacity: 0;
            font-size: 13px;
            color: var(--color-info);
            transition: opacity 150ms, height 150ms, padding 150ms;
            margin-left: 10px;

            &.active {
                height: 12px;
                opacity: 1;
                padding: 5px 5px 10px 5px;
            }

            .message-edit, .message-delete {
                &:hover {
                    cursor: pointer;
                    text-decoration: underline;
                }
            }

            .message-edit {
                color: var(--color-warning);
            }

            .message-delete {
                color: var(--color-danger);
            }
        }

        &:last-of-type .message-info.active {
            padding-bottom: 0;
        }

        .el-tag {
            font-size: 15px;
            max-width: 50%;
            height: auto;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            margin-left: 10px;

            ::v-deep .el-loading-mask {
                border-radius: 3px;
                background-color: rgba(255, 255, 255, 0.8);

                .circular {
                    width: 20px;

                    .path {
                        stroke-width: 3;
                    }
                }
            }
        }
    }
</style>
