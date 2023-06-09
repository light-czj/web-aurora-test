/**
 * 文件上传
 */
import request from '@/utils/request'
import vue from '@/main.js'

export const upload2ali = (file, key, progress) => {
  return new Promise((resolve, reject) => {
    vue.Oss.uploadFile(file, key, progress).then(res => {
      resolve(res)
    }).catch((err) => {
      reject(err)
    })
  })
}

export const upload2qn = (data, progress) => {
  return request({
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data' },
    url: 'https://upload.qiniup.com',
    data,
    onUploadProgress: function (progressEvent) {
      if (progress) {
        progress(progressEvent.loaded / progressEvent.total)
      }
    }
  })
}
