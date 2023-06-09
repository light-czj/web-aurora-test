import store from '@/store'
import axios from 'axios'

/**
 * 获取上传的token
 */
export const getUploadToken = () => {
  return new Promise((resolve, reject) => {
    var time = sessionStorage.getItem('UPLOAD_TOKEN_EXPIRE')
    var upToken = sessionStorage.getItem('UPLOAD_TOKEN')
    var valid = false
    var current = new Date().getTime()
    // console.log('当前时间:', current)
    // console.log('过期时间:', time)
    if (upToken && time && Number(time) > current) {
      valid = true
    }
    if (valid === true) {
      // console.log('剩余过期时间:', time - current)
      store.state.user.access_token = upToken
      console.log('upToken:', upToken)
      resolve()
    } else {
      console.log('upToken过期')
      var url = ''
      if (store.state.config.jp) {
        if (process.env.NODE_ENV === 'production') {
          url = 'https://jp.shareuc.com/index.php?route=api/customer/account'
        } else {
          url = '/shop/index.php?route=api/customer/account'
        }
      } else {
        url = 'https://youseeid.com/api/fileStorage'
      }
      axios.get(url).then(function (res) {
        let token = ''
        if (store.state.config.jp) {
          token = res.data.upload_token
        } else {
          token = res.data.data.access_token
        }
        store.state.user.access_token = token
        sessionStorage.setItem('UPLOAD_TOKEN_EXPIRE', new Date().getTime() + 3600000)
        sessionStorage.setItem('UPLOAD_TOKEN', token)
        console.log('get upToken success', token)
        resolve()
      }).catch((err) => {
        reject(err)
      })
    }
  })
}

export const getCartToken = () => {
  return new Promise((resolve, reject) => {
    var time = sessionStorage.getItem('CART_TOKEN_EXPIRE')
    var upToken = sessionStorage.getItem('CART_TOKEN')
    var valid = false
    var current = new Date().getTime()
    // console.log('当前时间:', current)
    // console.log('过期时间:', time)
    if (upToken && time && Number(time) > current) {
      valid = true
    }
    if (valid === true) {
      // console.log('剩余过期时间:', time - current)
      store.state.user.cart_token = upToken
      // console.log('cartToken:', upToken)
      resolve()
    } else {
      // console.log('cartToken过期')
      var data = {
        route: 'feed/rest_api/gettoken',
        grant_type: 'client_credentials'
      }
      var options = {
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: 'Basic c2hvcHBpbmdfb2F1dGhfY2xpZW50OnNob3BwaW5nX29hdXRoX3NlY3JldA=='
        }
      }
      axios.post('https://jp.shareuc.com/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials', JSON.stringify(data), options).then(function (res) {
        const token = res.data.data.access_token
        store.state.user.cart_token = token
        sessionStorage.setItem('CART_TOKEN_EXPIRE', new Date().getTime() + 2500000)
        sessionStorage.setItem('CART_TOKEN', token)
        console.log('get cartToken success', token)
        resolve()
      }).catch((err) => {
        reject(err)
      })
    }
  })
}
