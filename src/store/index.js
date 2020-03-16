import Vue from 'vue'
import Vuex from 'vuex'
import {messageModule} from "@/store/message_module";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    message: messageModule,
  }
})
