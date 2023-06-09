import urls from '@/config/urls'

const state = {
  version: process.env.VUE_APP_VERSION,
  localJson: false,
  brand: 'gmo',
  dir: 'shop',
  jp: true,
  jsonVersion: '_v10',
  urls: {}
}
const mutations = {
  setUrls (state) {
    if (state.jp) {
      state.urls.shopDomain = urls.shopDomain_jp
      state.urls.domain = urls.domain_jp
      state.urls.appUrlIOS = urls.appUrlIOS
      state.urls.appUrlAndroid = urls.appUrlAndroid_jp
      state.urls.upUrl = urls.upUrl_jp
      state.urls.downUrl = urls.downUrl_jp
      state.urls.assetsUrl = urls.assetsUrl_jp
      state.urls.jsonUrl = urls.assetsUrl_jp + 'web/json/'
      state.urls.fbxUrl = urls.assetsUrl_jp + 'app/fbx/'
      state.urls.spriteUrl = urls.assetsUrl_jp + 'app/sprite/'
      state.urls.galleryUrl = urls.assetsUrl_jp + 'app/'
      state.urls.textureUrl = urls.assetsUrl_jp + 'app/texture/'
      state.urls.orderUrl = urls.shareucOrder_jp
      state.urls.taskUrl = urls.taskUrl_jp
    } else {
      state.urls.shopDomain = urls.shopDomain
      state.urls.domain = urls.domain
      state.urls.assetsUrl = urls.assetsUrl
      state.urls.appUrlIOS = urls.appUrlIOS
      state.urls.appUrlAndroid = urls.appUrlAndroid
      state.urls.upUrl = urls.upUrl
      state.urls.downUrl = urls.downUrl
      state.urls.jsonUrl = urls.assetsUrl + 'web/json/'
      state.urls.fbxUrl = urls.assetsUrl + 'app/model/'
      state.urls.spriteUrl = urls.assetsUrl + 'app/sprite/'
      state.urls.galleryUrl = urls.assetsUrl
      state.urls.textureUrl = urls.assetsUrl + 'app/texture/'
      state.urls.orderUrl = urls.shareucOrder
      state.urls.taskUrl = urls.taskUrl
    }
  }
}
const actions = {}
const getters = {}

export default {
  state,
  mutations,
  actions,
  getters
}
