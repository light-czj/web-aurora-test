/*eslint-disable*/
function Camera(video) {
  this.video = video // 必传参数
  this.canvas = document.createElement("canvas")
  this.ctx = this.canvas.getContext("2d")
  this.imgdata = null
  this.mode = 'face'
}

Camera.prototype.switch = function () {
  if (this.mode === 'face') {
    this.mode = 'environment'
  } else {
    this.mode = 'face'
  }
  this.open()
}

// 兼容方法（兼容的方法不是很全，如有需要请自行扩展）
Camera.prototype.init = function (constraints, success, error) {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    //最新的标准API
    navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error)
  } else if (navigator.webkitGetUserMedia) {
    //webkit核心浏览器
    navigator.webkitGetUserMedia(constraints, success, error)
  } else if (navigator.mozGetUserMedia) {
    //firfox浏览器
    navigator.mozGetUserMedia(constraints, success, error)
  } else if (navigator.getUserMedia) {
    //旧版API
    navigator.getUserMedia(constraints, success, error)
  }
}

Camera.prototype.open = function () {
  var $this = this
  var config = {
    //基础配置
    video: {
      facingMode: this.mode,
    },
  }
  if (
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
  ) {
    this.init(config, getStream, noStream)
  }
  function getStream(stream) {
    //成功回调
    this.video.srcObject = stream //在这时active属性的值为 true
    this.video.onerror = function () {
      stream.stop()
    }
    stream.onended = noStream
    var that = this.video
    this.video.onloadedmetadata = function () {
      if (stream.active) {
        //在这里需要做判断
        that.play()
      } else {
        $this.init(config, getStream, noStream)
      }
    }
  }
  function noStream(err) {
    //失败回调
    $this.init(config, getStream, noStream) // 重新调用
  }
  return this
}

// 输出base64照片数据
Camera.prototype.capture = function () {
  this.canvas.setAttribute("width", this.video.videoWidth);
  this.canvas.setAttribute("height", this.video.videoHeight);
  this.ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight)
  return this.canvas.toDataURL("image/png")
}

Camera.prototype.stop = function () {
  if (this.video) {
    this.video.srcObject.getVideoTracks().forEach((track) => {
      track.stop()
      this.ctx.clearRect(0, 0,this.ctx.width, this.ctx.height)
    })
  }
}

export default Camera