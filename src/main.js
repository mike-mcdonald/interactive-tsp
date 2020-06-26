import Vue from 'vue';
import App from './App.vue';
import router from './router/index';
import store from './store/index';
import './registerServiceWorker';
import './worker-config';

Vue.config.productionTip = false;

router.afterEach((to, from) => {
  store.dispatch('clearMessages');
});

new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    document.dispatchEvent(new Event('render-event'));
  }
}).$mount('#app');
