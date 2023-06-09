import exifr from 'exifr'
import localforage from 'localforage'
import utils from '@/js/utils'
import { getUploadToken } from '@/api/user'
import * as axios from 'axios'
import config from '@/config/urls'
import { upload2ali, upload2qn } from '@/api/file'
import { cancelable } from 'cancelable-promise'
import store from '@/store'
import loadImage from 'image-promise'
import PSD from 'psd.js'

class ConverterTask {
  constructor (data, component) {
    this.valideFileBase = ['.jpg', '.jpeg', '.png', '.avif', '.psd']
    this.validFileTypesApi = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.pdf', '.ai', '.heic']
    this.validFileTypesAli = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff']
    this.validFileTypesQiniu = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff']
    this.tasks = []
    this.data = data
    this.component = component
  }

  async start () {
    try {
      this.data.pixel = await this.getPixel(this.data.file)
      this.tasks.push(cancelable(this.inputChange(this.data.file)))
    } catch (err) {
      console.error(err)
      store.commit('setSnackbar', {
        active: true,
        msg: this.component.$t('lang.inputImageFail'),
        color: 'error',
        timeout: 2000
      })
      this.component.removeGallery(this.data)
    }
  }

  parsePSD (file) {
    var url = URL.createObjectURL(file)
    PSD.fromURL(url).then((psd) => {
      this.inputSRC(psd.image.toBase64())
      URL.revokeObjectURL(url)
    })
  }

  readFile (file) {
    var reader = new FileReader()
    reader.onload = (e) => {
      this.inputSRC(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  inputSRC (src) {
    // console.log(src)
    localforage.setItem(this.data.fname, src, (res) => {
      console.log(`localforage保存图片${this.data.fname}`)
    })
    if (this.data.isLogo) {
      this.component.$emit('addLogoBySRC', {
        src,
        texName: this.data.fname,
        callback: (texture) => {
          if (texture == null) {
            store.commit('setSnackbar', {
              active: true,
              msg: this.component.$t('lang.inputImageFail'),
              color: 'error',
              timeout: 2000
            })
            this.component.removeGallery(this.data)
          }
        }
      })
    } else {
      this.component.$emit('changePatchTexture', {
        isFile: true,
        src: src,
        texName: this.data.fname,
        texHeight: 0,
        realSizeY: 0,
        pixel: this.data.pixel,
        callback: (texture) => {
          // 压缩128小图
          var image = new Image()
          image.crossOrigin = 'anonymous'
          image.src = src
          loadImage(image).then(() => {
            this.data.small = utils.resizeImageToBase64(image, 128, 128 * image.height / image.width, utils.getSuffix(this.data.fname))
          })
          this.data.src = src
          this.data.progress = 100
          this.data.w = texture.origWidth
          this.data.h = texture.origHeight
          this.data.sizeX = Math.round(texture.origWidth / this.data.pixel * 2.54 * 10)
          this.data.startX = Math.round(texture.origWidth / this.data.pixel * 2.54 * 10)
          this.data.sizeY = Math.round(texture.origHeight / this.data.pixel * 2.54 * 10)
          this.data.startY = Math.round(texture.origHeight / this.data.pixel * 2.54 * 10)
        }
      })
    }
  }

  async getPixel (file) {
    // 获取文件信息
    let pixel = 72
    try {
      const info = await exifr.parse(file)
      if (info && typeof info.XResolution !== 'undefined') {
        pixel = info.XResolution
      }
      // console.log('文件信息', info)
    } catch (error) {
      console.log('读取图片信息失败', error)
    }
    return pixel
  }

  isFileValid (file) {
    if (typeof file === 'undefined') return false
    // 判断格式是否支持
    var suffix = utils.getSuffix(file.name)
    console.log('导入格式:', suffix)
    const types = store.state.config.jp ? this.validFileTypesAli : this.validFileTypesQiniu
    if (this.valideFileBase.indexOf(suffix) === -1 && this.validFileTypesApi.indexOf(suffix) === -1 && types.indexOf(suffix) === -1) {
      console.error('不支持的文件格式')
      store.commit('setSnackbar', {
        active: true,
        msg: this.component.$t('lang.invalidType'),
        color: 'error',
        timeout: 2000
      })
      this.component.removeGallery(this.data)
      return false
    }
    // 判断大小是否超过30m
    if (file.size > 30 * 1024 * 1024) {
      console.error('超过30M')
      store.commit('setSnackbar', {
        active: true,
        msg: this.component.$t('lang.invalidSize'),
        color: 'error',
        timeout: 2000
      })
      this.component.removeGallery(this.data)
      return false
    }
    if (file.size > 20 * 1024 * 1024 && this.validFileTypesApi.indexOf(suffix) === -1 && this.valideFileBase.indexOf(suffix) === -1) {
      store.commit('setSnackbar', {
        active: true,
        msg: this.component.$t('lang.invalidType'),
        color: 'error',
        timeout: 2000
      })
      this.component.removeGallery(this.data)
      return false
    }
    return true
  }

  async inputChange (file) {
    const this_ = this
    const valid = this.isFileValid(file)
    // eslint-disable-next-line no-useless-return
    if (!valid) return
    const taskToken = cancelable(getUploadToken())
    this.tasks.push(taskToken)
    await taskToken
    var suffix = utils.getSuffix(file.name)
    if (this.valideFileBase.indexOf(suffix) > -1) {
      console.log('1.不需要转换')
      if (suffix === '.psd') {
        this.parsePSD(file)
      } else {
        this.readFile(file)
      }
      return
    }
    // 处理图片
    var api = false
    // 云服务器转换不了的使用api转换
    if (store.state.config.jp && this.validFileTypesAli.indexOf(suffix) === -1) {
      api = true
    }
    if (!store.state.config.jp && this.validFileTypesQiniu.indexOf(suffix) === -1) {
      api = true
    }
    // 大于20M，用服务器转换
    if (file.size >= 20 * 1024 * 1024) {
      api = true
    }
    // 上传到云服务器
    await this.uploadFile(this.data.fname, file, progress => {
      this_.data.progress = Math.round(progress * 50)
    })
    let url = ''
    let fname = ''
    let small = ''
    let source = null
    if (!api) {
      if (store.state.config.jp) {
        if (store.state.ui.os.isPC) {
          url = store.state.config.urls.downUrl + 'source/' + this.data.fname + '?x-oss-process=image/format,jpg/resize,w_1024'
        } else {
          url = store.state.config.urls.downUrl + 'source/' + this.data.fname + '?x-oss-process=image/format,jpg/resize,w_512'
        }
        small = store.state.config.urls.downUrl + 'source/' + this.data.fname + '?x-oss-process=image/format,jpg/resize,w_128'
      } else {
        if (store.state.ui.os.isPC) {
          url = store.state.config.urls.downUrl + 'source/' + this.data.fname + '?imageMogr2/thumbnail/1024x/format/jpg'
        } else {
          url = store.state.config.urls.downUrl + 'source/' + this.data.fname + '?imageMogr2/thumbnail/512x/format/jpg'
        }
        small = store.state.config.urls.downUrl + 'source/' + this.data.fname + '?imageMogr2/thumbnail/128x/format/jpg'
      }
      const type = this.data.isLogo ? 'png' : 'jpeg'
      source = 'source/' + this.data.fname
      fname = this.data.fname.replace(suffix, '.' + type)
      console.log('2.使用云存储转换:', url)
    } else {
      // 3.使用API转换
      let temp = ''
      if (store.state.config.jp) {
        temp = store.state.config.urls.downUrl.replace('https', 'http') + 'source/' + this.data.fname
      } else {
        temp = store.state.config.urls.downUrl + 'source/' + this.data.fname
      }
      const type = this.data.isLogo ? 'png' : 'jpeg'
      source = 'source/' + this.data.fname
      fname = this.data.fname.replace(suffix, '.' + type)
      if (store.state.ui.os.isPC) {
        url = config.imgApi + `?width=1024&type=${type}&url=` + temp
      } else {
        url = config.imgApi + `?width=512&type=${type}&url=` + temp
      }
      small = config.imgApi + `?width=128&type=${type}&url=` + temp
      console.log('3.使用API转换:', url)
    }
    if (source) {
      this.data.source = source
    }
    this.data.fname = fname
    this.data.small = small
    // 监视进度
    axios.get(url, {
      onDownloadProgress (progress) {
        this_.data.progress = 50 + Math.round(progress.loaded / progress.total * 50)
      }
    }).then((res) => {
      if (res.status === 200) {
        // console.log('图片下载成功:', res)
        if (this.data.isLogo) {
          this.component.$emit('addLogoBySRC', {
            src: url,
            texName: fname,
            callback: (texture) => {
              if (texture == null) {
                store.commit('setSnackbar', {
                  active: true,
                  msg: this.component.$t('lang.inputImageFail'),
                  color: 'error',
                  timeout: 2000
                })
                this.component.removeGallery(this.data)
              }
            }
          })
        } else {
          this.component.$emit('changePatchTexture', {
            isFile: true,
            source: source,
            src: url,
            texName: fname,
            texHeight: 0,
            realSizeY: 0,
            pixel: this.data.pixel,
            callback: (texture) => {
              if (texture == null) {
                store.commit('setSnackbar', {
                  active: true,
                  msg: this.component.$t('lang.inputImageFail'),
                  color: 'error',
                  timeout: 2000
                })
                this.component.removeGallery(this.data)
                return
              }
              // 保存1024图片到本地
              localforage.setItem(fname, texture.baseTexture.resource.url)
              this.data.url = url
              this.data.src = url
              this.data.w = texture.origWidth
              this.data.h = texture.origHeight
              this.data.sizeX = Math.round(this.data.w / this.data.pixel * 2.54)
              this.data.startX = Math.round(this.data.w / this.data.pixel * 2.54)
              this.data.sizeY = Math.round(this.data.h / this.data.pixel * 2.54)
              this.data.startY = Math.round(this.data.h / this.data.pixel * 2.54)
            }
          })
        }
      } else {
        store.commit('setSnackbar', {
          active: true,
          msg: this.component.$t('lang.inputImageFail'),
          color: 'error',
          timeout: 2000
        })
        this.component.removeGallery(this.data)
      }
    })
  }

  async uploadFile (key, blob, progress) {
    if (store.state.config.jp) {
      const task = cancelable(upload2ali(blob, 'shareuc/source/' + key, progress))
      this.tasks.push(task)
      const data = await task
      if (data.code === 0) {
      } else {
        throw new Error('upload oss fail')
      }
    } else {
      var fd = new FormData()
      fd.append('key', key)
      fd.append('token', store.state.user.access_token)
      fd.append('file', blob)
      const task = cancelable(upload2qn(fd, progress))
      this.tasks.push(task)
      await task
    }
  }

  cancel () {
    this.tasks.forEach(task => {
      task.cancel()
    })
    this.data.task = null
  }
}
export default ConverterTask
