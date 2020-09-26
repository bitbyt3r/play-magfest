import Vue from 'vue'
import VueRouter from 'vue-router'
import Player from './Player.vue'
import Stream from './Stream.vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueRouter);

const routes = [
  {path: "/", component: Player},
  {path: "/stream", component: Stream}
]

const router = new VueRouter({
  routes
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

