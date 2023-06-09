const state = {
  brandJson: null,
  fbxJson: null,
  sid: '0',
  loadJsonComplete: false
}
const mutations = {
  loadJsonComplete (state) {
    state.loadJsonComplete = true
    // console.log('json加载结束')
  },
  setFBXJson (state, val) {
    state.fbxJson = val
  },
  setBrandJson (state, val) {
    state.brandJson = val
  }
}
const actions = {

}
const getters = {
  getFontList (state) {
    if (state.brandJson) {
      return state.brandJson.fontList.map(item => item.name)
    } else {
      return []
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
