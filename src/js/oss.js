// 导入ali-oss
import OSS from 'ali-oss' // 换成自己的bucket
import axios from 'axios'
import dayjs from 'dayjs'

/**
 * 配置信息
 */
const region = 'oss-accelerate' // 换成自己的region
// const accessKeyId = '1' // 换成自己的accessKeyId
// const accessKeySecret = '2' // 换成自己的accessKeySecret
// const stsToken = '3'
const bucket = 'ucjp'

let client = null

const getOSSToken = function () {
  return new Promise((resolve, reject) => {
    var time = localStorage.getItem('OSS_TIME')
    var valid = false
    // console.log('过期时间:', time)
    if (time && dayjs(time).isAfter(dayjs())) {
      valid = true
    }
    if (valid === true) {
      // console.log('oss token有效')
      if (!client) {
        client = new OSS({
          region: region,
          accessKeyId: localStorage.getItem('OSS_KEY'),
          accessKeySecret: localStorage.getItem('OSS_SECRET'),
          stsToken: localStorage.getItem('OSS_TOKEN'),
          bucket: bucket
        })
      }
      resolve()
    } else {
      let url = ''
      if (process.env.NODE_ENV === 'production') {
        url = 'https://jp.shareuc.com/api/osstoken'
      } else {
        url = '/shop/api/osstoken'
      }
      axios
        .get(url)
        .then(res => {
          console.log('获取 oss token:', res)
          if (res.status === 200) {
            localStorage.setItem('OSS_TIME', res.data.Expiration)
            localStorage.setItem('OSS_TOKEN', res.data.SecurityToken)
            localStorage.setItem('OSS_KEY', res.data.AccessKeyId)
            localStorage.setItem('OSS_SECRET', res.data.AccessKeySecret)

            client = new OSS({
              region: region,
              accessKeyId: res.data.AccessKeyId,
              accessKeySecret: res.data.AccessKeySecret,
              stsToken: res.data.SecurityToken,
              bucket: bucket
            })
            resolve()
          }
        })
        .catch(err => {
          reject(err)
        })
    }
  })
}

/**
 *
 * @param {上传是设置文件key 一般是文件名} obecjtKey
 */
const getOssFileUrl = function (obecjtKey) {
  if (!obecjtKey) return new Error('object key 必须传')
  // return 'https://' + bucket + '.' + region + '.aliyuncs.com/' + obecjtKey
  return 'https://ucjpacc.shareuc.com/' + obecjtKey
}

/**
 *
 * @param {上传是设置文件key , 一般为文件名称} objectKey
 * @param {文件file} file
 */

// 分片上传
const uploadFile = async function (file, objectKey, progress) {
  // console.log('阿里云上传', objectKey, file)
  await getOSSToken()
  return new Promise((resolve, reject) => {
    client
      .multipartUpload(objectKey, file, {
        parallel: 4,
        partSize: 1024 * 1024,
        progress: function (p, cpt, res) {
          if (progress) {
            progress(p)
          }
        }
      })
      .then(result => {
        resolve({
          code: 0,
          objectKey: objectKey,
          url: getOssFileUrl(objectKey),
          msg: 'ok'
        })
        // eslint-disable-next-line handle-callback-err
      })
      .catch(err => {
        console.error('上传出错了', err)
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ code: -1, url: '', objectKey: '', msg: '上传出错了' })
      })
  })
}

//  上传
// const uploadFile = async function (file, objectKey) {
//   // console.log('阿里云上传', objectKey, file)
//   await getOSSToken()
//   return new Promise((resolve, reject) => {
//     client.put(objectKey, file).then(result => {
//       resolve({
//         code: 0,
//         objectKey: objectKey,
//         url: getOssFileUrl(objectKey),
//         msg: 'ok'
//       })
//     // eslint-disable-next-line handle-callback-err
//     }).catch(err => {
//       console.error('上传出错了', err)
//       // eslint-disable-next-line prefer-promise-reject-errors
//       reject({ code: -1, url: '', objectKey: '', msg: '上传出错了' })
//     })
//   })
// }

// 下载
const downloadFile = function (key) {
  console.log(key)
  const url = client.signatureUrl(key)
  const Img = new Image()
  let dataURL = ''
  const fileName = key.substring(key.indexOf('_') + 1)
  Img.src = url
  Img.setAttribute('crossOrigin', 'Anonymous')
  Img.onload = function () {
    const canvas = document.createElement('canvas')
    const width = Img.width
    const height = Img.height
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(Img, 0, 0, width, height)
    dataURL = canvas.toDataURL('image/png')
    const eleLink = document.createElement('a')
    eleLink.download = fileName
    eleLink.style.display = 'none'
    eleLink.href = dataURL
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
  }
}

export default {
  install (Vue) {
    Vue.prototype.Oss = {
      uploadFile: uploadFile,
      downloadFile: downloadFile
    }
  }
}
