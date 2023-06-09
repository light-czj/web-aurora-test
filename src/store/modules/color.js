const state = {
  list: [
  ]
}
const mutations = {
  addColor (state, color) {
    const index = state.list.findIndex(item => item.hex === color.hex)
    if (index > -1) {
      return
      // state.list.splice(index, 1)
    }
    if (state.list.length === 10) {
      // 删除最后一个，添加新的到第一个
      state.list.splice(state.list.length - 1, 1)
    }
    state.list.splice(0, 0, color)
    localStorage.setItem('COLOR_HISTORY', JSON.stringify(state.list))
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
