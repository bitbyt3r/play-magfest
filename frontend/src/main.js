import Vue from 'vue'
import VueRouter from 'vue-router'
import VueWamp from 'vue-wamp'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueAnalytics from 'vue-analytics'

import Player from './Player.vue'
import Stream from './Stream.vue'
import App from './App.vue'
import GamePad from './components/Gamepad.vue'
import Menu from './Menu.vue'

Vue.config.productionTip = false
Vue.use(VueRouter);
Vue.use(VueWamp, {
    url: "wss://crossbar.hackafe.net:7778/ws",
    realm: "realm1",
});
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

const routes = [
  {path: "/", component: Menu},
  {path: "/play/:sessionID", component: Player, props: true},
  {path: "/stream", component: Stream},
  {path: "/gamepad", component: GamePad},
]

const router = new VueRouter({
  mode: 'history',
  routes
});

Vue.use(VueAnalytics, {
  id: 'UA-164741362-2',
  router
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

