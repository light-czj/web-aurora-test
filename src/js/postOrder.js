import store from '@/store'
import localForage from '@/js/localForage'
import { createOrder, getAccessToken } from '@/api/order'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

async function postOrder (pid, opid, designData, uploadName, size = '') {
  // console.log('生成订单2', designData, uploadName, size)
  var orderJson = {}
  orderJson.name = uploadName
  orderJson.umb = pid
  if (!orderJson.umb) {
    console.error('umb not exist', pid)
  }
  if (opid) {
    orderJson.handle = opid.toString()
  }
  if (size !== '') {
    orderJson.color = size
  } else {
    orderJson.color = designData.handleColor
  }
  orderJson.ucolor = designData.umbColor
  orderJson.quantity = 1
  orderJson.brand = store.state.config.brand
  if (store.state.ui.os.isLine) {
    orderJson.user = 'line_' + store.state.line.userId
  } else {
    orderJson.user = 'web'
  }
  orderJson.note = store.state.design.shareuc.info.designer
  orderJson.done = 1
  orderJson.time = dayjs().format('YYYY-MM-DD HH:mm:ss')
  // todo
  orderJson.code = uuidv4().substring(0, 4)
  var data = JSON.stringify(orderJson)
  localForage.setItem(uploadName, data)
  const token = await getAccessToken()
  const formData = new FormData()
  formData.append('data', JSON.stringify(orderJson))
  formData.append('access_token', token)
  const { data: order } = await createOrder(formData)
  console.log('生成订单2:', order)
  return order.data.order_id + '_' + order.data.order_code
}

export default postOrder
