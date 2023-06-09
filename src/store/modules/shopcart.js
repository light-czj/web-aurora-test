import Vue from 'vue'
import store from '@/store'

const state = {
  orders: {
  }
}
const mutations = {
  saveShopCart (state) {
    const norders = {}
    // 过滤task
    for (var type in state.orders) {
      norders[type] = []
      state.orders[type].forEach(order => {
        norders[type].push({
          name: order.name,
          created: order.created,
          count: order.count,
          status: order.status,
          price: order.price,
          completed: order.completed,
          customid: order.customid,
          customname: order.customname,
          amount: order.amount
        })
      })
    }
    localStorage.setItem('SHOPCART_' + store.state.config.brand, JSON.stringify(norders))
  },
  loadShopCart (state) {
    // 拷贝原来的数据存到新的key
    if (!localStorage.getItem('recover_from_shopcart')) {
      localStorage.setItem('recover_from_shopcart', true)
      const lastData = localStorage.getItem('SHOPCART')
      if (lastData) {
        localStorage.setItem('SHOPCART_' + store.state.config.brand, lastData)
      }
    }
    const data = localStorage.getItem('SHOPCART_' + store.state.config.brand)
    state.orders = JSON.parse(data || '{}')
  },
  addShopCart (state, params) {
    if (typeof state.orders[params.type] === 'undefined') {
      Vue.set(state.orders, params.type, [])
    }
    state.orders[params.type].unshift(params.order)
  },
  deleteShopCart (state, params) {
    for (var key in state.orders) {
      if (key === params.type) {
        state.orders[key].some((order, index) => {
          if (order.name === params.name) {
            state.orders[key].splice(index, 1)
            return true
          }
        })
      }
    }
  },
  clearShopCart (state, params) {
    for (var key in state.orders) {
      if (key === params.type) {
        state.orders[key] = []
      }
    }
  }
}
const actions = {

}
const getters = {

}

export default {
  state,
  mutations,
  actions,
  getters
}
