import '@/assets/styles/main.scss';
import Vue from 'vue';
import App from './App';
import router from './router';

Vue.prototype.$ENV = require("getenv");
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
});