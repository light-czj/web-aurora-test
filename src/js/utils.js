import store from '@/store'
export default {
  resizeBase64 (base64, width, height) {
    // eslint-disable-next-line promise/param-names
    return new Promise((resolve, rejct) => {
      var img = new Image()// 创建图片对象
      img.src = base64
      img.onload = function () {
        var canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        var ctx = canvas.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL())
      }
    })
  },
  clearBase64 (base64) {
    return new Promise((resolve, reject) => {
      var img = new Image()// 创建图片对象
      img.src = base64
      img.onload = function () {
        var c = document.createElement('canvas')// 创建处理画布对象
        var ctx = c.getContext('2d')
        c.width = img.width
        c.height = img.height
        ctx.drawImage(img, 0, 0)// 绘制
        var imgData = ctx.getImageData(0, 0, c.width, c.height).data// 读取图片数据
        var lOffset = c.width; var rOffset = 0; var tOffset = c.height; var bOffset = 0
        for (var i = 0; i < c.width; i++) {
          for (var j = 0; j < c.height; j++) {
            var pos = (i + c.width * j) * 4
            if (imgData[pos] === 255 || imgData[pos + 1] === 255 || imgData[pos + 2] === 255 || imgData[pos + 3] === 255) {
              bOffset = Math.max(j, bOffset) // 找到有色彩的最下端
              rOffset = Math.max(i, rOffset) // 找到有色彩的最右端
              tOffset = Math.min(j, tOffset) // 找到有色彩的最上端
              lOffset = Math.min(i, lOffset) // 找到有色彩的最左端
            }
          }
        }
        lOffset++
        rOffset++
        tOffset++
        bOffset++
        var x = document.createElement('canvas')// 创建处理后画布对象
        var w = rOffset - lOffset
        var h = bOffset - tOffset
        var size = Math.max(w, h)
        x.width = size
        x.height = size
        var xx = x.getContext('2d')
        if (w < size) {
          xx.drawImage(img, lOffset - (size - w) * 0.5, tOffset, size, size, 0, 0, size, size) // 绘制
        } else {
          xx.drawImage(img, lOffset, tOffset - (size - h) * 0.5, size, size, 0, 0, size, size) // 绘制
        }
        resolve(x.toDataURL()) // 得到最终裁剪出来的base64
      }
    })
  },
  getUrlKey: function (name) {
    // eslint-disable-next-line no-sparse-arrays
    return (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(decodeURIComponent(location.href)) || [, ''])[1].replace(/\+/g, '%20') || null
  },
  rgb2hex: function (r, g, b) {
    r = parseInt(r)
    g = parseInt(g)
    b = parseInt(b)
    var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    return hex
  },
  hex2rgb: function (hex) {
    const r = parseInt('0x' + hex.slice(1, 3))
    const g = parseInt('0x' + hex.slice(3, 5))
    const b = parseInt('0x' + hex.slice(5, 7))
    return [r, g, b]
  },
  changeImageColor: function async (src, r, g, b, suffix) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = src
      image.onload = function () {
        const newCanvas = document.createElement('canvas')
        const ctx = newCanvas.getContext('2d')
        newCanvas.width = image.width
        newCanvas.height = image.height
        ctx.drawImage(image, 0, 0, image.width, image.height)
        const imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height)
        for (let p = 0; p < imageData.data.length; p += 4) {
          if (imageData.data[p + 3] !== 0) {
            imageData.data[p + 0] = r
            imageData.data[p + 1] = g
            imageData.data[p + 2] = b
          }
        }
        ctx.putImageData(imageData, 0, 0)
        // eslint-disable-next-line no-unused-vars
        let dataUri = ''
        if (suffix === 'png') {
          dataUri = newCanvas.toDataURL('image/png')
        } else {
          dataUri = newCanvas.toDataURL('image/jpeg')
        }
        ctx.clearRect(0, 0, image.width, image.height)
        resolve(dataUri)
      }
    })
  },
  // 微信分享
  setOpenShare: function (title, desc, link, imgUrl) {
    const configAppMessage = {
      desc: desc,
      title: title,
      link: link,
      imgUrl: imgUrl
    }
    console.log('设置分享参数', link)

    // jssdk设置分享内容
    // wechat.wechatEvevt(['updateAppMessageShareData', 'updateTimelineShareData'], configAppMessage)

    if (store.state.ui.os.isMini) {
      console.log('是小程序')
      // 小程序
      // eslint-disable-next-line no-undef
      wx.miniProgram.postMessage({
        data: {
          cmd: 'share',
          data: configAppMessage
        }
      })
    } else if (store.state.ui.os.isWX) {
      console.log('是公众号')
      // 微信
      window.parent.postMessage({
        cmd: 'share',
        data: configAppMessage
      }, '*')
    } else {
      console.log('未知平台')
    }
  },
  parseQuery: function () {
    const res = {}

    const query = (location.href.split('?')[1] || '')
      .trim()
      .replace(/^(\?|#|&)/, '')

    if (!query) {
      return res
    }

    query.split('&').forEach(param => {
      const parts = param.replace(/\+/g, ' ').split('=')
      const key = decodeURIComponent(parts.shift())
      const val = parts.length > 0 ? decodeURIComponent(parts.join('=')) : null

      if (res[key] === undefined) {
        res[key] = val
      } else if (Array.isArray(res[key])) {
        res[key].push(val)
      } else {
        res[key] = [res[key], val]
      }
    })

    return res
  },
  /**
   * 获取平台语言
   */
  getLanguage: function () {
    return navigator.browserLanguage || navigator.language
  },

  /**
   * 修改img尺寸
   * @param img
   * @param size
   * @param suffix .jpeg/.png
   * @returns {string}
   */
  resizeImageToBase64: function (img, width, height, suffix = '.jpg') {
    // console.log(`resizeImage (${img.naturalWidth},${img.naturalHeight})=>(${size},${size})`)
    var canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    var ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)
    if (suffix === '.png') {
      return canvas.toDataURL('image/png', 1)
    } else {
      return canvas.toDataURL('image/jpeg', 1)
    }
  },

  /**
   * 获取后缀
   * @param filename
   * @returns {string}
   */
  getSuffix: function (filename) {
    var index1 = filename.lastIndexOf('.')
    if (index1 === -1) return null
    var index2 = filename.length
    var suffix = filename.substring(index1, index2).toLowerCase()
    return suffix
  },

  pointToLine: function (pointP, pointA, pointB) {
    var A = pointA.y - pointB.y
    var B = pointB.x - pointA.x
    var C = pointA.x * pointB.y - pointA.y * pointB.x
    // 代入点到直线距离公式
    var distance = 0
    if (pointP.x > (-(B * pointP.y + C) / A)) {
      // 点在线右边
      distance = (Math.abs(A * pointP.x + B * pointP.y + C)) / (Math.sqrt(A * A + B * B))
    } else {
      // 点在线左边
      distance = -(Math.abs(A * pointP.x + B * pointP.y + C)) / (Math.sqrt(A * A + B * B))
    }
    return distance
  },
  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @return {Number} angle
   */
  getAngle: function (p1, p2) {
    var x = p2.x - p1.x
    var y = p2.y - p1.y
    return Math.atan2(y, x) * 180 / Math.PI
  },
  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @return {Number} distance
   */
  getDistance: function (p1, p2) {
    var x = p2.x - p1.x
    var y = p2.y - p1.y
    return Math.sqrt((x * x) + (y * y))
  },
  createImg: function (file) {
    var img = document.createElement('img')
    var url = window.URL.createObjectURL(file)
    var revokeURL = function () {
      window.URL.revokeObjectURL(url)
    }
    img.addEventListener('load', revokeURL)
    img.addEventListener('error', revokeURL)
    img.src = url
    img.alt = file.name
    img.title = file.name
    console.log(img)
    return img
  },
  near2: function (n) {
    return Math.pow(2, Math.round(Math.log2(n)))
  },
  next2: function (n) {
    return Math.pow(2, Math.ceil(Math.log2(n) + 1))
  },
  nextHighestPowerOfTwo: function (x) {
    --x
    for (var i = 1; i < 32; i <<= 1) {
      x = x | x >> i
    }
    return x + 1
  },
  getPercent: function (num, total) {
    num = parseFloat(num)
    total = parseFloat(total)
    if (isNaN(num) || isNaN(total)) {
      return '-'
    }
    return total <= 0 ? '0%' : (Math.round(num / total * 10000) / 100.00) + '%'
  },
  // 生成从minNum到maxNum的随机数
  randomNum: function (minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10)
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
      // 或者 Math.floor(Math.random()*( maxNum - minNum + 1 ) + minNum );
      default:
        return 0
    }
  },
  // 生成从minNum到maxNum的随机偶数
  randomNum0: function (minNum, maxNum) {
    var random = -1
    while (random === -1) {
      var val = this.randomNum(minNum, maxNum)
      if (val % 2 === 0) {
        random = val
      }
    }
    return random
  },
  // 生成从minNum到maxNum的随机奇数
  randomNum1: function (minNum, maxNum) {
    var random = -1
    while (random === -1) {
      var val = this.randomNum(minNum, maxNum)
      if (val % 2 === 1) {
        random = val
      }
    }
    return random
  },
  setCookie: function (key, value, t) {
    if (t) {
      var oDate = new Date()
      oDate.setDate(oDate.getDate() + t)
      document.cookie = key + '=' + value + '; expires=' + oDate.toDateString()
    } else {
      document.cookie = key + '=' + escape(value) + '; path=/'
    }
  },
  getCookie: function (key) {
    var arr1 = document.cookie.split('; ')// 由于cookie是通过一个分号+空格的形式串联起来的，所以这里需要先按分号空格截断,变成[name=Jack,pwd=123456,age=22]数组类型；
    for (var i = 0; i < arr1.length; i++) {
      var arr2 = arr1[i].split('=')// 通过=截断，把name=Jack截断成[name,Jack]数组；
      if (arr2[0] === key) {
        return decodeURI(arr2[1])
      }
    }
  },
  removeCookie: function (key) {
    this.setCookie(key, '', -1) // 把cookie设置为过期
  },
  uperFirst: function (str) {
    return str.replace(str[0], str[0].toUpperCase())
  },
  randomWord: function (length) {
    var str = ''
    var arr = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
      'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    for (let i = 0; i < length; i++) {
      var pos = Math.round(Math.random() * (arr.length - 1))
      str += arr[pos]
    }
    return str
  },
  base64ToBlob (_data, type = 'image/jpeg') {
    _data = _data.split(',')[1]
    var binary = window.atob(_data)
    var len = binary.length
    var buffer = new ArrayBuffer(len)
    var view = new Uint8Array(buffer)
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i)
    }
    var blob = new Blob([view], { type })
    return blob
  },
  blobToBase64 (blob) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = (e) => {
        resolve(e.target.result)
      }
      // readAsDataURL
      fileReader.readAsDataURL(blob)
      fileReader.onerror = () => {
        reject(new Error('blobToBase64 error'))
      }
    })
  },
  img2Base64: function (img, fname) {
    var canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, img.width, img.height)
    var suffix = this.getSuffix(fname)
    if (suffix === '.png') {
      return canvas.toDataURL('image/png')
    } else {
      return canvas.toDataURL('image/jpeg')
    }
  },
  bytesToBase64: function (buffer) {
    var binary = ''
    var bytes = new Uint8Array(buffer)
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  },
  loadjs: function (src, callback) {
    var script = document.createElement('script')
    var head = document.getElementsByTagName('head')[0]
    script.type = 'text/javascript'
    script.charset = 'UTF-8'
    script.src = src
    if (script.addEventListener) {
      script.addEventListener('load', function () {
        callback()
      }, false)
    } else if (script.attachEvent) {
      script.attachEvent('onreadystatechange', function () {
        var target = window.event.srcElement
        if (target.readyState === 'loaded') {
          callback()
        }
      })
    }
    head.appendChild(script)
  }
}
