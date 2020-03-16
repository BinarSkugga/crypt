import Vue from 'vue'
import app from './app.vue'
import store from './store'

import ElementUI from 'element-ui'
import '@/css/theme/index.css';
import '@/css/theme/var.css';
import '@/css/main.scss';

Vue.config.productionTip = false;
Vue.use(ElementUI);

new Vue({
  store,
  render: h => h(app)
}).$mount('#app');
