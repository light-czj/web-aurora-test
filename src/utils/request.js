import axios from 'axios'
// import store from '@/store'
import store from '@/store'

const request = axios.create({
  // 配置选项
  // baseURL,
  // timeout
})

// 请求拦截器
request.interceptors.request.use(function (config) {
  // const { user } = store.state
  // if (user && user.access_token) {
  //   config.headers.Authorization = user.access_token
  // }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(function (response) {
  return response
}, async function (error) {
  if (error.response) {
    console.error(error.response)
  } else if (error.request) {
    // 超时
    store.commit('setSnackbar', {
      active: true,
      msg: '请求超时, 请刷新重试',
      color: 'error',
      timeout: 2000
    })
    // Message.error('请求超时, 请刷新重试')
  } else {
    store.commit('setSnackbar', {
      active: true,
      msg: '请求失败',
      color: 'error',
      timeout: 2000
    })
    // Message.error(`请求失败: ${error.message}`)
  }
  return Promise.reject(error)
})

export default request
