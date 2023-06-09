/**
 * 文件上传
 */
import request from '@/utils/request'
import store from '@/store'

export const commitProduct = data => {
  return request({
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + store.state.user.cart_token
    },
    url: 'https://jp.shareuc.com/index.php?route=feed/rest_api/commit_product_remote',
    data
  })
}
