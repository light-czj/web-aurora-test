import request from '@/utils/request'
import store from '@/store'
import utils from '@/js/utils'

export const loadFBXJson = () => {
  var url = ''
  if (store.state.config.localJson) {
    url = `/fbx_${store.state.config.brand}${store.state.config.jsonVersion}.json`
  } else {
    url = `${store.state.config.urls.jsonUrl}fbx_${store.state.config.brand}${store.state.config.jsonVersion}.json?` + utils.randomWord(3)
  }
  return request({
    method: 'GET',
    url
  })
}

export const loadBrandJson = () => {
  var url = ''
  if (store.state.config.localJson) {
    url = `/${store.state.config.brand}${store.state.config.jsonVersion}.json`
  } else {
    url = `${store.state.config.urls.jsonUrl}${store.state.config.brand}${store.state.config.jsonVersion}.json?` + utils.randomWord(3)
  }
  return request({
    method: 'GET',
    url
  })
}
