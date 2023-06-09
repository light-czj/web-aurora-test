/**
* 订单相关请求模块
*/
import request from '@/utils/request'
import store from '@/store'
import dayjs from 'dayjs'
import axios from 'axios'

export const createOrder = data => {
  return request({
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data' },
    url: store.state.config.urls.orderUrl + 'api/order/create',
    data
  })
}

export const getAccessToken = function () {
  return new Promise((resolve, reject) => {
    var time = localStorage.getItem('ACCESS_TOKEN_TIME')
    var valid = false
    // console.log('过期时间:', time)
    if (time && dayjs(time).isAfter(dayjs())) {
      valid = true
    }
    if (valid === true) {
      resolve(localStorage.getItem('ACCESS_TOKEN'))
    } else {
      const url = 'https://cms.shareuc.com/api/auth/access_token?service=order.create,order.generation,order.info,order.confirm&user_id=39&secret_key=2cdd6hYtMsPyapV1aWNC7mWUN3C7GANvryUqk6GA9r3C8a9qsM5uYbE1Z7K6e7'
      axios.get(url).then(({ data }) => {
        console.log('获取 access token:', data)
        if (data.code === 20000) {
          localStorage.setItem('ACCESS_TOKEN', data.data.access_token)
          localStorage.setItem('ACCESS_TOKEN_TIME', dayjs().add(290, 'second'))
          resolve(data.data.access_token)
        }
      }).catch((err) => {
        reject(err)
      })
    }
  })
}
