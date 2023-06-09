import Vue from 'vue'
import Vuex from 'vuex'
import config from './modules/config' // 配置相关
import ui from './modules/ui' // ui相关
import design from './modules/design' // 设计数据
import brand from './modules/brand' // 品牌数据
import user from './modules/user' // 用户相关
import shopcart from './modules/shopcart' // 购物车
import album from './modules/album' // 导入图片
import color from './modules/color' // 颜色使用记录
import skin from './modules/skin'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    config,
    ui,
    design,
    brand,
    user,
    shopcart,
    album,
    color,
    skin
  },
  mutations: {
  },
  actions: {
  },
  getters: {
  }
})
