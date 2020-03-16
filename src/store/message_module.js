function getDate() {
    let date = new Date();
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

export const messageModule = {
    namespaced: true,
    state: {
        messages: []
    },
    mutations: {
        addMessage(state, message) {
            message.date = getDate();
            state.messages.push(message);
        },
        deleteMessage(state, message) {
            state.messages.map(m => {
                if(m.id === message.id) {
                    m.text = 'Deleted message';
                    m.deleted = true;
                }
            });
        },
        editMessage(state, message) {
            state.messages.map(m => {
                if(m.id === message.id) {
                    m.text = message.text;
                    m.date = getDate();
                    m.edited = true;
                }
            });
        },
    },
    actions: {
        sendText({commit}, message) {
            commit('addMessage', message);
            // eslint-disable-next-line no-unused-vars
            return new Promise((resolve, _) => {
                setTimeout(() => {
                    resolve(message)
                }, 1000);
            });
        },
        delete({commit}, message) {
            // eslint-disable-next-line no-unused-vars
            return new Promise((resolve, _) => {
                setTimeout(() => {
                    commit('deleteMessage', message);
                    resolve(message)
                }, 1000);
            });
        },
        edit({commit}, message) {
            // eslint-disable-next-line no-unused-vars
            return new Promise((resolve, _) => {
                setTimeout(() => {
                    commit('editMessage', message);
                    resolve(message)
                }, 1000);
            });
        }
    }
};
