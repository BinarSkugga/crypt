<template>
    <div class="message-box" :class="{foreign: foreign}">
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
            <span v-if="!foreign">
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
        props: ['message', 'sending', 'selected', 'foreign'],
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
        }
    }
</script>

<style scoped lang="scss">
    .message-box {
        cursor: default;

        & + .message-box {
            margin-top: 3px;
        }

        &.foreign {
            text-align: right;
        }

        .message-info {
            height: 0;
            opacity: 0;
            font-size: 13px;
            color: var(--color-info);
            transition: opacity 150ms, height 150ms, padding 150ms;

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
