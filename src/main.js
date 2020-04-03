// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

//引入reset.css    修改build/webpack.base.conf的第27行
import 'style/reset.css'
import 'style/iconfont.css'
import 'style/hanbao.css'
import 'style/login.css'
// 重置各种input边框的
// import 'style/border.css'

import router from './router'
import store from './store'
import axios from 'axios'
import ifLogin from './ifLogin'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// Vue.config.productionTip = false;
// console.log(process.env.NODE_ENV !== 'production');
// development是生产环境,production是产品环境
const isDebug_mode = process.env.NODE_ENV !== 'production';
Vue.config.debug = isDebug_mode;
Vue.config.devtools = isDebug_mode;
Vue.config.productionTip = isDebug_mode;

Vue.prototype.$axios = axios;
Vue.prototype.$ifLogin = ifLogin;
Vue.use(mavonEditor);

/*let fromPath = '';
router.afterEach((to,from,next) => {
  if (fromPath === '' || fromPath !== to.path) {
    fromPath = from.path;
    window.scrollTo(0,0);// window.scroll(0, 0);
    next();
  } else {next()}
});*/

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
