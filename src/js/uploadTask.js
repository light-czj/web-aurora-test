import store from '@/store'
import localForage from '@/js/localForage'
import { getUploadToken } from '@/api/user.js'
import { createOrder, getAccessToken } from '@/api/order'
import { upload2ali, upload2qn } from '@/api/file'
import { cancelable } from 'cancelable-promise'
import utils from '@/js/utils'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

class UploadTask {
  constructor (pid, opid, order, isAddCart, size = '') {
    this.pid = pid
    this.opid = opid
    this.order = order
    this.isAddCart = isAddCart
    this.size = size
  }

  reset () {
    this.uploadName = ''
    this.needUpload = []
    this.totalCount = 0
    this.successCount = 0
    this.progress = 0
    this.order.progress = 0
    this.tasks = []
    this.designData = null
    this.fail = false
  }

  async start (uploadData) {
    // 步骤：1.需要上传的文件保存本地 2.上传
    try {
      this.uploadData = uploadData
      console.log(this.uploadData)
      // 重置变量
      this.reset()
      this.uploadName = this.order.name
      // const design = await localForage.getItem(this.uploadName + '.json')
      const design = this.uploadData[this.uploadName + '.json']
      this.designData = JSON.parse(design).design
      // 重置参数
      this.totalCount = 0
      this.successCount = 0
      this.tasks = []
      // 统计上传总数
      // json,缩略图
      this.totalCount++
      this.totalCount += Object.keys(this.designData.inprint).length
      // 上传3d效果图
      if (this.designData.ptype === 'gift') {
        this.totalCount += 4
      } else {
        this.totalCount += 1
      }
      // 生成订单++
      this.totalCount++
      // 统计导入的图片
      this.checkFiles()
      this.checkText()
      await getUploadToken()
      await this.startUpload()
      const created = await this.postOrder()
      this.order.completed = true
      this.order.created = created
      this.order.task = null
      console.log('上传成功')
      if (this.isAddCart) {
        store.commit('saveShopCart')
      }
    } catch (err) {
      console.error('上传失败', err)
      this.fail = true
      this.order.completed = false
      this.order.created = ''
      if (this.isAddCart) {
        store.commit('saveShopCart')
      }
      // todo: 删除上传失败的文件
    }
  }

  /**
   * 获取需要上传的图片
   */
  checkFiles () {
    var dic = {}
    for (var designArea in this.designData.inprint) {
      this.designData.inprint[designArea].forEach(item => {
        this.checkTexture(item.texture, dic)
        item.imagelist.forEach(image => {
          this.checkTexture(image.texture, dic)
        })
      })
    }
    for (var key in dic) {
      this.needUpload.push(key)
    }
    this.totalCount += this.needUpload.length
  }

  checkText () {
    for (var designArea in this.designData.inprint) {
      this.designData.inprint[designArea].forEach(item => {
        item.textlist.forEach(text => {
          if (text.image) {
            this.needUpload.push(text.image)
            this.totalCount++
          }
        })
      })
    }
  }

  checkTexture (texture, dic) {
    if (texture.startsWith('UCAppGallery')) {
      // eslint-disable-next-line no-prototype-builtins
      if (!dic.hasOwnProperty(texture)) {
        dic[texture] = ''
      }
    }
  }

  async startUpload () {
    await Promise.all([this.uploadCaptures(), this.uploadFiles(), this.uploadJson(), this.uploadCaptures3D()])
  }

  async uploadJson () {
    var upload = {
      info: store.state.design.shareuc.info,
      design: store.state.design.shareuc.designData
    }
    if (store.state.design.shareuc.designData.ptype === 'gift') {
      upload.design.lineColor = store.state.design.shareuc.lineColor
      upload.design.pantone = store.state.design.shareuc.pantone
    }
    var content = JSON.stringify(upload)

    const key = this.uploadName + '.json'
    console.log('uploadJson', key)

    if (store.state.config.jp) {
      const task = cancelable(upload2ali(Buffer.from(content), 'shareuc/' + key))
      this.tasks.push(task)
      const data = await task
      if (data.code === 0) {
        this.successCount++
        this.progress = 100 * this.successCount / this.totalCount
        this.order.progress = this.progress
      } else {
        throw new Error('upload oss fail')
      }
    } else {
      var fd = new FormData()
      fd.append('key', key)
      fd.append('token', store.state.user.access_token)
      fd.append('file', content)
      const task = cancelable(upload2qn(fd))
      this.tasks.push(task)
      await task
      this.successCount++
      this.progress = 100 * this.successCount / this.totalCount
      this.order.progress = this.progress
    }
  }

  uploadFiles () {
    const tasks = []
    for (let i = 0; i < this.needUpload.length; i++) {
      tasks.push(this.uploadFile(this.needUpload[i]))
    }
    return Promise.all(tasks)
  }

  async uploadFile (key) {
    // const cache = await localForage.getItem(key)
    let cache = this.uploadData[key]
    if (!cache) {
      cache = await localForage.getItem(key)
    }
    var suffix = utils.getSuffix(key)
    const blob = utils.base64ToBlob(cache, suffix === 'png' ? 'image/png' : 'image/jpeg')
    if (store.state.config.jp) {
      const task = cancelable(upload2ali(blob, 'shareuc/' + key))
      this.tasks.push(task)
      const data = await task
      if (data.code === 0) {
        this.successCount++
        this.progress = 100 * this.successCount / this.totalCount
        this.order.progress = this.progress
      } else {
        throw new Error('upload oss fail')
      }
    } else {
      var fd = new FormData()
      fd.append('key', key)
      fd.append('token', store.state.user.access_token)
      fd.append('file', blob)
      const task = cancelable(upload2qn(fd))
      this.tasks.push(task)
      await task
      this.successCount++
      this.progress = 100 * this.successCount / this.totalCount
      this.order.progress = this.progress
    }
  }

  async uploadCaptures () {
    const tasks = []
    for (var designArea in this.designData.inprint) {
      let key = ''
      if (designArea === 'umb') {
        key = this.uploadName + '.jpg'
      } else {
        key = this.uploadName + '_' + utils.uperFirst(designArea) + '.jpg'
      }
      tasks.push(this.uploadFile(key))
    }
    return Promise.all(tasks)
  }

  async uploadCaptures3D () {
    const tasks = []
    if (this.designData.ptype === 'gift') {
      for (let i = 0; i < 4; i++) {
        let key = ''
        if (i === 0) {
          key = this.uploadName + '_3d.png'
        } else {
          key = this.uploadName + `_3d_${i}.png`
        }
        tasks.push(this.uploadFile(key))
      }
    } else {
      const key = this.uploadName + '_3d.png'
      tasks.push(this.uploadFile(key))
    }
    return Promise.all(tasks)
  }

  async postOrder () {
    var orderJson = {}
    orderJson.name = this.uploadName
    orderJson.umb = this.pid
    if (this.opid) {
      orderJson.handle = this.opid.toString()
    }
    if (this.size !== '') {
      orderJson.color = this.size
    } else {
      orderJson.color = this.designData.handleColor
    }
    orderJson.ucolor = this.designData.umbColor
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
    // var data = JSON.stringify(orderJson)
    // localForage.setItem(this.uploadName, data)
    // console.log('生成订单:', data)
    const token = await getAccessToken()
    const formData = new FormData()
    formData.append('data', JSON.stringify(orderJson))
    formData.append('access_token', token)
    const { data: order } = await createOrder(formData)
    console.log('生成订单1', order.data)
    this.successCount++
    this.progress = 100 * this.successCount / this.totalCount
    this.order.progress = this.progress
    return order.data.order_id + '_' + order.data.order_code
  }

  cancel () {
    // todo: 删除缓存
    if (this.tasks) {
      this.tasks.forEach(task => {
        task.cancel()
      })
    }
    this.order.task = null
  }
}
export default UploadTask
