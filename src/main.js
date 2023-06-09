import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueI18n from 'vue-i18n'
import VueClipboard from 'vue-clipboard2'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import Oss from './js/oss'
import VueQrcode from '@chenfengyuan/vue-qrcode'

import './styles/index.scss'

import 'swiper/css/swiper.min.css'
import 'swiper/js/swiper'

import 'vue-swatches/dist/vue-swatches.css'

Vue.component(VueQrcode.name, VueQrcode)
// 国际化
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: 'zh', // 语言标识, 通过切换locale的值来实现语言切换,this.$i18n.locale
  messages: {
    zh: require('./lang/zh'), // 中文语言包
    en: require('./lang/en'), // 英文语言包
    jp: require('./lang/jp') // 日文语言包
  }
})

VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)

Vue.use(VueAwesomeSwiper)

Vue.use(Oss)

if (process.env.NODE_ENV === 'production') {
  // 百度统计
  var hm = document.createElement('script')
  hm.src = 'https://hm.baidu.com/hm.js?9c39425fe7a2c3f2db21b592265c5a3c'
  var s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(hm, s)
}

Vue.config.productionTip = false

const vue = new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')

export default vue
