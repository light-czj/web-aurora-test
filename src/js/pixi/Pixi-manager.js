import * as PIXI from 'pixi.js'
import * as THREE from 'three'
import Hammer from 'hammerjs'
import PIXILoaderUmb from './Pixi-loader-umb'
import PIXILoaderMask from './Pixi-loader-mask'
import PIXILoaderScarf from './Pixi-loader-scarf'
import PIXILoaderGift from './Pixi-loader-gift'
import PIXILoaderImage from './Pixi-loader-image'
import PIXILoaderText from './Pixi-loader-text'
import { loadTexture } from './Pixi-loader-texture'
import store from '@/store'
import moment from 'dayjs'
import localForage from '@/js/localForage'
import { loadFont } from '@/js/font'

const MAX_STEP = 20 // 最大步数
let this_ = null
class PIXIManager {
  constructor (element, comp) {
    this_ = this
    this.elementRoot = element // 根节点
    this.component = comp
    this.width = element.clientWidth // 根节点宽
    this.height = element.clientHeight // 根节点高
    this.canvasSize = Math.min(element.clientWidth, element.clientHeight) // 宽高最小值
    this.product = null
    this.apps = {}
    this.containers = {}
    this.canvases = {}
    this.output = 1024 // 输出图片的像素 1024 * 1024判断宽高最小边是否小于2000
    this.designArea = 'umb' // 当前设计的部位
    this.diameter = 0
    this.suffix = 'mm'
    this.selected = null // 当前选中的logo、文字、背景
    this.selectedBG = null // 当前选中的背景
    this.elementDownload = null
    this.historyList = []
    this.historyIndex = -1
    this.lastRotation = 0
    this.startRotation = 0
    this.lockRotate = true
    this.canDrag = true

    this.initial()
  }

  // 初始化
  initial () {
    // 适配chrome86及以后的版本
    PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false

    // 清缓存
    PIXI.utils.clearTextureCache()

    // console.log('初始化pixi')
  }

  // 生成设计区域
  createDesignArea (designArea) {
    // console.log('生成设计区域', designArea)
    var canvas = document.createElement('canvas')
    this.elementRoot.appendChild(canvas)
    this.canvases[designArea] = canvas
    store.commit('setTexture', {
      type: designArea,
      texture: new THREE.CanvasTexture(canvas)
    })
    const app = new PIXI.Application({
      view: canvas,
      width: this.output,
      height: this.output,
      transparent: true,
      antialias: false
    })
    this.apps[designArea] = app

    var hammer = new Hammer.Manager(app.view)
    var pinch = new Hammer.Pinch()
    var rotate = new Hammer.Rotate()
    pinch.recognizeWith(rotate)
    hammer.add(pinch)
    hammer.add(rotate)
    hammer.on('pinchstart pinchin pinchout pinchend', this.onPinch)
    hammer.on('rotatestart rotatemove rotateend', this.onRotate)

    app.view.addEventListener('wheel', e => {
      this.wheelChange(e)
    })

    const container = new PIXI.Container()
    app.stage.addChild(container)
    container.width = this.output
    container.height = this.output
    container.pivot.x = this.output / 2
    container.pivot.y = this.output / 2
    container.position.set(this.output / 2, this.output / 2)
    this.containers[designArea] = container

    // console.log('生成局部:', designArea)

    this.setCanvasSize(designArea)
  }

  // 捏合手势
  onPinch (e) {
    // console.log('监听捏合')
    e.preventDefault()
    if (e.type === 'pinchstart') {
      this_.canDrag = false
      this_.selectedBG.initScale = this_.selectedBG.entity.ZV
    }
    if (e.type === 'pinchend') {
      this_.canDrag = true
      this_.endZoom()
    }
    if (typeof this_.selectedBG.initScale === 'undefined') {
      this_.selectedBG.initScale = this_.selectedBG.entity.ZV
    }
    var value = this_.litFuncClamp(this_.selectedBG.initScale * e.scale, 0.2, 6)
    this_.changeZoom(value)
  }

  // 旋转手势
  onRotate (e) {
    // console.log('监听旋转', this_.selectedBG)
    e.preventDefault()
    if (e.type === 'rotatestart') {
      this_.canDrag = false
      this_.lastRotation = this_.selectedBG.angle
      this_.startRotation = e.rotation
      this_.lockRotate = true
    }
    if (e.type === 'rotateend') {
      this_.canDrag = true
      this_.endRotate()
    }
    if (e.type === 'rotatemove') {
      const step = this_.startRotation - e.rotation
      if (Math.abs(step) > 20) {
        this_.lockRotate = false
      }
      if (this_.lockRotate) return
      const value = this_.lastRotation - (step - 20)
      this_.changeRotate(value)
    }
  }

  litFuncClamp (val, min, max) {
    return Math.min(Math.max(min, val), max)
  }

  // 滚轮
  wheelChange (e) {
    if (!this.selectedBG) return
    var delta = e.deltaY / 1000
    if (e.altKey === true) {
      let rotate = store.state.ui.rotation + delta * 100
      if (rotate < 0) {
        rotate += 360
      }
      rotate = rotate % 360
      this.changeRotate(rotate)
    } else {
      const zoom = this.litFuncClamp(store.state.ui.zoom - delta, 0.2, 6)
      this.changeZoom(zoom)
    }
  }

  /**
   * 生成2d
   */
  async load (designData, product) {
    if (store.state.design.shareuc.loading2d) {
      console.log('加载2d中')
      return
    }
    this.reset()
    store.state.design.shareuc.loading2d = true

    this.selected = null
    this.selectedBG = null
    this.designData = designData
    this.product = product

    this.elementRoot.style.zIndex = '-1'
    store.state.ui.loading = true
    await this.createPatches()
    this.elementRoot.style.zIndex = '0'
    store.state.ui.loading = false
    store.state.design.shareuc.loading2d = false
    // console.log('pixi load', this.designData)
  }

  async loadItems (designArea, container) {
    const patches = this.designData.inprint[designArea]
    if (patches && patches.length > 0) {
      for (const entity of patches[0].imagelist) {
        var base64 = await localForage.getItem(entity.texture)
        var texture = await loadTexture(base64, entity.texture)
        await PIXILoaderImage.load({
          manager: this,
          texture,
          texName: entity.texture,
          entity,
          container
        })
      }
      for (const entity of patches[0].textlist) {
        await PIXILoaderText.load({
          manager: this,
          entity,
          container
        })
      }
    }
  }

  // 生成面片
  async createPatches () {
    this.product.designArea.forEach(designArea => {
      if (typeof this.designData.inprint[designArea] === 'undefined') {
        store.commit('createDesignArea', designArea)
      }
    })
    if (this.designData.ptype === 'umb') {
      await PIXILoaderUmb.load(this)
    } else if (this.designData.ptype === 'mask') {
      await PIXILoaderMask.load(this)
    } else if (this.designData.ptype === 'scarf') {
      await PIXILoaderScarf.load(this)
    } else if (this.designData.ptype === 'gift') {
      await PIXILoaderGift.load(this)
    }
    this.switchDesignArea({
      designArea: this.designArea,
      resetHistory: false
    })
  }

  // 设置局部参数
  setCanvasSize (designArea) {
    // console.log('设置局部参数', designArea)
    var canvas = this.canvases[designArea]
    let scale = 1
    if (this.product.size2D) {
      scale = this.product.size2D[designArea] || 1
      if (!store.state.ui.os.isPC && this.designData.ptype === 'scarf') {
        scale *= 0.88
      }
    }
    var ratio = this.canvasSize / this.output
    var marginTop = (this.height - this.canvasSize) * 0.5 + 'px'
    var marginLeft = (this.width - this.canvasSize) * 0.5 + 'px'
    if (store.state.ui.os.isPC) {
      canvas.style.cssText = `margin-left: ${marginLeft};width: ${this.output}px;height: ${this.output}px;position: absolute;margin-top: ${marginTop};transform: scale(${ratio});transform-origin: 0 0 0;`
    } else {
      canvas.style.cssText = `margin-left: ${marginLeft};width: ${this.output}px;height: ${this.output}px;position: absolute;margin-top: ${marginTop};transform: scale(${ratio});transform-origin: 0 0 0;`
    }

    canvas.parentElement.style.transform = `scale(${scale})`
  }

  clear2d () {
    for (var key in this.containers) {
      this.clearDesignArea(key)
    }
    // console.log('清空2d')
  }

  // 清空局部
  clearDesignArea (key) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.containers.hasOwnProperty(key)) {
      this.containers[key].removeChildren(0, this.containers[key].children.length)
      // console.log('清空局部', key)
    }
  }

  getOrCreateContainer (designArea) {
    // eslint-disable-next-line no-prototype-builtins
    if (!this.canvases.hasOwnProperty(designArea)) {
      this.createDesignArea(designArea)
    }
    return this.containers[designArea]
  }

  // 切换设计区域
  switchDesignArea (params) {
    store.state.ui.isZoomIn = false
    this.designArea = params.designArea
    store.state.design.shareuc.designArea = params.designArea
    this.setCanvasSize(this.designArea)
    for (var key in this.canvases) {
      this.canvases[key].style.display =
        key === params.designArea ? 'initial' : 'none'
    }
    // 重置容器旋转
    this.containers[params.designArea].angle = 0
    // 切换选中的背景
    // console.log('切换设计区域', params.designArea, this.containers[params.designArea].patch)
    PIXILoaderText.hideTextHighlight()
    PIXILoaderImage.hideImageHighlight()
    this.select(this.containers[params.designArea].patch)
    this.component.showTextPanel(false)

    // 重置history
    if (params.resetHistory) {
      this.clearHistory()
    }
    if (this.historyIndex === -1) {
      // 保存第一次数据
      this.saveDesign()
    }
    // console.log('切换局部', params.designArea, this.historyIndex, this.historyList.length)
  }

  capture (shouldReturn = false) {
    // console.log('刷新贴图')
    this.beforeCapture()
    for (const designArea in store.state.design.textures) {
      // 拍照重置容器旋转
      if (this.containers[designArea]) {
        this.containers[designArea].angle = 0
      }
      store.state.design.textures[designArea].needsUpdate = true
    }
    if (shouldReturn) {
      this.apps[this.designArea].render()
      return this.apps[this.designArea].view.toDataURL()
      // return this.apps.umb.renderer.plugins.extract.base64(this.apps.umb.stage)
    }
    // var texName = 'share_' + store.state.brand + '_' + moment().format('YYYYMMDDHHmmss') + utils.randomWord(5)
    // store.commit('setShareImg', texName)
  }

  selectAlbum (params) {
    // console.log('selectAlbum', params)
    if (!params.isLogo) {
      this.changePatchTexture(params)
    } else {
      this.addLogoBySRC({
        src: params.src,
        texName: params.texName
      })
    }
  }

  async addLogoBySRC (params) {
    PIXILoaderImage.hideImageHighlight()
    var texture = await loadTexture(params.src, params.texName)
    if (params.callback) {
      params.callback(texture)
    }
    if (texture == null) return
    PIXILoaderImage.load({
      manager: this,
      texture,
      texName: params.texName,
      entity: null
    })
    this.saveDesign()
  }

  async addText (entity = null) {
    PIXILoaderText.hideTextHighlight()
    PIXILoaderImage.hideImageHighlight()
    store.state.ui.loading = true
    this.selected = await PIXILoaderText.load({
      manager: this,
      entity
    })
    store.state.ui.loading = false
    this.saveDesign()
  }

  async confirmFileSize () {
    await this.changePatchTexture(this.textureParams, true)
  }

  async changePatchTexture (params, ignoreSize = false) {
    // console.log('changePatchTexture', params, ignoreSize)
    if (this.selectedBG === null) {
      console.log('this.selectedBG === null')
      return
    }
    var texture = await loadTexture(params.src, params.texName)
    if (params.callback) {
      params.callback(texture)
    }
    if (texture == null) return
    this.selectedBG.entity.dirty = true
    this.selectedBG.tint = '0xFFFFFF'
    this.selectedBG.texture = texture
    this.selectedBG.entity.source = params.source
    this.selectedBG.texture.texName = params.texName
    store.state.ui.zoom = 1
    this.selectedBG.entity.ZV = 1
    this.selectedBG.entity.texture = params.texName
    this.setPatchTextureRealSize({
      patch: this.selectedBG,
      texture: texture,
      realSizeY: params.realSizeY,
      pixel: params.pixel,
      SV: 0,
      designArea: this.designArea,
      originInfo: params.originInfo
    })
    this.selectedBG.entity.pantone = ''
    this.selectedBG.entity.X = 0
    this.selectedBG.entity.Y = 0
    this.selectedBG.entity.AV = 0
    this.selectedBG.angle = 0
    if (this.containers[this.designArea].tillingList) {
      this.containers[this.designArea].tillingList.forEach(item => {
        if (item._tag !== this.selectedBG._tag) return
        item.texture = texture
        item.tint = '0xFFFFFF'
        item.tilePosition.x = this.selectedBG.tilePosition.x
        item.tilePosition.y = this.selectedBG.tilePosition.y
        item.tileScale.set(
          this.selectedBG.tileScale.x * item.entity.mirror,
          this.selectedBG.tileScale.y
        )
        item.entity.texture = params.texName
        item.entity.pantone = ''
        item.entity.X = 0
        item.entity.Y = 0
        item.entity.SV = this.selectedBG.entity.SV
        item.entity.AV = 0
        item.entity.ZV = 1
        item.angle = 0
        item.entity.source = params.source
        item.entity.quality = this.selectedBG.entity.quality
      })
    }

    if (!store.state.design.shareuc.loading2d) {
      this.saveDesign()
    }
  }

  async changeLogoColor (color) {
    PIXILoaderImage.changeLogoColor(color)
    // const color = '#' + data[1]
    // console.log('color', color)
  }

  changePatchColor (data) {
    console.log('changePatchColor', data)
    if (!this.selectedBG) return
    let color = ''
    let pantone = ''
    // 是数组
    console.log(Object.prototype.toString(data))
    if (!Object.keys(data).includes('color')) {
      color = data[1]
      pantone = data[0]
      store.commit('addColor', {
        hex: color,
        pantone,
        rgb: [data[2], data[3], data[4]],
        data
      })
      if (typeof color === 'string' && color.indexOf('#') > -1) {
        color = color.replace('#', '')
      }
    } else {
      color = data.color.replace('#', '')
      pantone = data.pantone
      store.commit('addColor', {
        hex: color,
        pantone,
        rgb: '',
        data
      })
    }
    console.log('改变颜色', color, pantone)
    store.state.design.shareuc.lastColor = '#' + color
    var texture = PIXI.Texture.from(require('@/assets/images/white.png'))
    var texName = 'color~' + color
    texture.texName = texName
    texture.pantone = pantone
    this.selectedBG.texture = texture
    this.selectedBG.tint = '0x' + color
    this.selectedBG.entity.texture = texName
    this.selectedBG.entity.pantone = pantone
    if (this.designArea === 'umb') {
      this.containers[this.designArea].tillingList.forEach(item => {
        if (item._tag !== this.selectedBG._tag) return
        item.texture = texture
        item.tint = '0x' + color
        item.entity.texture = texName
        item.entity.pantone = pantone
      })
    }
    this.saveDesign()
    // 图片质量为100
    store.state.design.shareuc.quality = 100
    this.selectedBG.entity.quality = 100
  }

  // 设置贴图参数
  setPatchTextureRealSize (params) {
    const patch = params.patch
    const texture = params.texture
    let realSizeY = params.realSizeY
    const pixel = params.pixel
    let SV = params.SV
    const designArea = params.designArea
    patch.texture = texture
    var w = this.output
    var h = this.output
    if (realSizeY === 0) {
      // 像素转厘米
      realSizeY = (texture.origHeight / pixel) * 2.54
    }
    if (SV === 0) {
      if (texture.texName && texture.texName.startsWith('UCApp')) {
        SV = 1
      } else {
        SV = this.getSV(realSizeY, pixel, designArea)
      }
    }
    patch.entity.SV = SV
    var scale = patch.entity.SV * patch.entity.ZV
    // console.log(`realSizeY=${realSizeY} pixel=${pixel} designArea=${designArea} SV=${SV}`)
    patch.texture.baseTexture.setSize(
      (1024 * texture.origWidth) / texture.origHeight,
      1024
    )
    patch.tileScale.set(
      (patch.entity.mirror * scale * this.output) / 1024,
      (scale * this.output) / 1024
    )
    patch.tilePosition.x =
      ((w / 2) * scale * texture.origWidth) / texture.origHeight
    patch.tilePosition.y = (h / 2) * scale
    // console.log(`x=${patch.tilePosition.x} y=${patch.tilePosition.y}`)

    patch.entity.realSizeY = realSizeY
    patch.entity.pixel = pixel

    this.getImageQuality(patch, params.originInfo)
  }

  getImageQuality (patch, originInfo = null) {
    if (!patch) return
    // console.log('质量', patch.entity.texture, originInfo)
    // 1.导入图片
    if (patch.entity.texture.indexOf('UCApp') > -1) {
      let h = patch.texture.origHeight
      if (originInfo) {
        h = originInfo.h
      }
      // 高度撑满，所以考虑 原图高
      // oss通过?x-oss-process=image/info获取原图尺寸
      // todo: api暂无法获取
      let ret = parseInt(h / (patch.entity.ZV * patch.entity.SV) / 2000 * 100)
      if (ret > 100) {
        ret = 100
      }
      store.state.design.shareuc.quality = ret
      patch.entity.quality = ret
      if (patch.entity.source) {
        const suffix = patch.entity.source.split('.')[1]
        // ai pdf不考虑质量
        if (['ai', 'pdf'].indexOf(suffix) > -1) {
          store.state.design.shareuc.quality = 100
          patch.entity.quality = 100
        }
      }
    } else {
      // 2. 纯色或者图库，质量固定为100
      store.state.design.shareuc.quality = 100
      patch.entity.quality = 100
    }
  }

  getSV (realSizeY, pixel, designArea) {
    var cos = 1
    if (this.designData.ptype === 'umb' && designArea === 'umb') {
      cos = Math.cos(((Math.PI / 180) * 360) / this.product.ks / 2)
    }
    const realSize = this.getRealSize(designArea)
    // console.log(`getSV designArea=${designArea} realSizeY=${realSizeY} realSize=${realSize} cos=${cos}`)
    var temp = realSizeY / (realSize / cos)
    return temp
  }

  getRealSize (designArea) {
    var realSize = 0
    if (this.designData.ptype === 'umb') {
      if (designArea === 'umb') {
        realSize = this.product.realSize[designArea] * 100 * 2
      } else {
        realSize = this.product.realSize[designArea] * 100
      }
    } else if (this.designData.ptype === 'mask') {
      realSize = this.product.realSize[designArea] * 100
    } else if (this.designData.ptype === 'scarf') {
      realSize = this.product.realSize[designArea] * 100
    } else if (this.designData.ptype === 'bag') {
      realSize = this.product.realSize[designArea] * 100
    } else if (this.designData.ptype === 'gift') {
      realSize = this.product.realSize[designArea] * 100
    }
    return realSize
  }

  setMask (value) {
    for (var key in this.containers) {
      if (this.containers[key].children.length > 0) {
        this.containers[key].getChildAt(2).visible = value
      }
    }
    if (this.scarfMask) {
      this.scarfMask.visible = value
    }
  }

  delay (time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  beforeCapture () {
    if (this.selected && this.selected._type === 'text') {
      this.component.showTextPanel(false)
      PIXILoaderText.hideTextHighlight()
    }
    if (this.selected && this.selected._type === 'image') {
      PIXILoaderImage.hideImageHighlight()
    }

    for (var key in this.containers) {
      if (this.containers[key].children.length > 0) {
        this.containers[key].getChildAt(2).visible = false
      }
    }

    if (this.scarfMask) {
      this.scarfMask.visible = true
    }

    // await this.delay(300)
  }

  afterCapture () {
    // if (this.selected._type === 'text') {
    //   this.component.showTextPanel(true)
    //   PIXILoaderText.setTextHighlight(true)
    // }
    for (var key in this.containers) {
      if (this.containers[key].children.length > 0) {
        this.containers[key].getChildAt(2).visible = true
      }
    }
  }

  downloadImages () {
    this.beforeCapture()
    if (!this.elementDownload) {
      this.elementDownload = document.createElement('a')
    }
    this.product.designArea.forEach(item => {
      const base64 = this.apps[item].renderer.plugins.extract.base64(
        this.apps[item].stage
      )
      const name = moment().format('YYYYMMDDHHmmss')
      this.elementDownload.href = base64
      this.elementDownload.download = name + '_' + item
      this.elementDownload.click()
    })
    this.afterCapture()
  }

  changeZoom (val) {
    if (val < 0.1) val = 0.1
    store.state.ui.zoom = val
    if (this.selected._type === 'umb') {
      PIXILoaderUmb.zoom(val)
    } else if (this.selected._type === 'mask') {
      PIXILoaderMask.zoom(val)
    } else if (this.selected._type === 'scarf') {
      PIXILoaderScarf.zoom(val)
    } else if (this.selected._type === 'image') {
      PIXILoaderImage.zoom(val)
    } else if (this.selected._type === 'text') {
      PIXILoaderText.zoom(val)
    } else if (this.selected._type === 'gift') {
      PIXILoaderGift.zoom(val)
    }
  }

  endZoom () {
    // console.log('pixi end zoom')
    if (!this.selected) return
    if (this.selected._type === 'umb') {
      PIXILoaderUmb.endZoom()
    } else if (this.selected._type === 'mask') {
      PIXILoaderMask.endZoom()
    } else if (this.selected._type === 'scarf') {
      PIXILoaderScarf.endZoom()
    } else if (this.selected._type === 'image') {
      PIXILoaderImage.endZoom()
    } else if (this.selected._type === 'text') {
      PIXILoaderText.endZoom()
    } else if (this.selected._type === 'gift') {
      PIXILoaderGift.endZoom()
    }
  }

  changeRotate (val) {
    // console.log('changeRotate', val)
    if (!this.selected) return
    store.state.ui.rotation = val
    if (this.selected._type === 'umb') {
      PIXILoaderUmb.rotate(val)
    } else if (this.selected._type === 'mask') {
      PIXILoaderMask.rotate(val)
    } else if (this.selected._type === 'scarf') {
      PIXILoaderScarf.rotate(val)
    } else if (this.selected._type === 'image') {
      PIXILoaderImage.rotate(val)
    } else if (this.selected._type === 'text') {
      PIXILoaderText.rotate(val)
    } else if (this.selected._type === 'gift') {
      PIXILoaderGift.rotate(val)
    }
  }

  endRotate () {
    // console.log('pixi end rotate')
    if (!this.selected) return
    if (this.selected._type === 'umb') {
      PIXILoaderUmb.endRotate()
    } else if (this.selected._type === 'mask') {
      PIXILoaderMask.endRotate()
    } else if (this.selected._type === 'scarf') {
      PIXILoaderScarf.endRotate()
    } else if (this.selected._type === 'image') {
      PIXILoaderImage.endRotate()
    } else if (this.selected._type === 'text') {
      PIXILoaderText.endRotate()
    } else if (this.selected._type === 'gift') {
      PIXILoaderGift.endRotate()
    }
  }

  changeText (val) {
    // console.log('changeText', val)
    PIXILoaderText.changeText(val)
  }

  changeTextColor (val) {
    // console.log('changeTextColor', val)
    PIXILoaderText.changeTextColor(val)
  }

  showTextPanel (val) {
    this.component.showTextPanel(val)
  }

  removeImage () {
    PIXILoaderImage.remove()
  }

  downItemBefore () {
    PIXILoaderText.hideTextHighlight()
    PIXILoaderImage.hideImageHighlight()
  }

  downItem () {
    if (this.selected._type === 'text') {
      this.component.showTextPanel(true)
    } else if (this.selected._type === 'image') {
      if (store.state.ui.tab === 'tab-5') {
        store.state.design.shareuc.activeSticker = true
      }
      this.component.showTextPanel(false)
    } else {
      if (store.state.ui.tab === 'tab-5') {
        store.state.design.shareuc.activeSticker = false
      }
      this.component.showTextPanel(false)
    }
  }

  changeEdgeColor (val) {
    PIXILoaderScarf.changeEdgeColor(val)
  }

  select (obj) {
    // console.log('选中', obj)
    this.selected = obj
    if (!this.selected) return

    store.state.design.shareuc.lastColor = ''

    // 设置滑动条的值
    if (this.selected._type === 'text') {
      // 隐藏遮罩
      if (store.state.design.shareuc.designData.ptype === 'scarf') {
        this.setMask(false)
      }
      store.state.ui.zoom = this.selected.entity.size
      store.state.ui.rotation = ((-this.selected.entity.rotationZ - this.selected.parent.angle) % 360 + 360) % 360
      store.state.ui.textColor = this.selected.entity.fontcolor
      store.state.ui.inputText = this.selected.entity.content
    } else if (this.selected._type === 'image') {
      store.state.ui.zoom = this.selected.entity.size
      store.state.ui.rotation = ((-this.selected.entity.rotationX - this.selected.parent.angle + 90) % 360 + 360) % 360
      store.state.ui.imageColor = this.selected.entity.color
    } else {
      store.state.ui.zoom = this.selected.entity.ZV
      store.state.ui.rotation = this.selected.entity.AV
      // console.log('选中', obj.entity.texture)
      if (obj && obj.entity && obj.entity.texture && obj.entity.texture.indexOf('color~') > -1) {
        store.state.design.shareuc.lastColor = obj.entity.texture.replace('color~', '#')
      }
      this.selectedBG = obj
      // 显示遮罩
      this.setMask(true)
      store.state.design.shareuc.quality = this.selectedBG.entity.quality
    }
  }

  saveDesign () {
    if (
      store.state.brand.brandJson.setting.history &&
      store.state.brand.brandJson.setting.history.value
    ) {
    } else {
      return
    }
    if (this.historyIndex + 1 < this.historyList.length) {
      // 删除后面的所有元素
      this.historyList.splice(
        this.historyIndex + 1,
        this.historyList.length - (this.historyIndex + 1)
      )
    }
    if (this.historyList.length === MAX_STEP) {
      // 删除最后一项
      this.historyList.splice(-1, 1)
      const history = JSON.parse(JSON.stringify(this.designData))
      this.historyList.push(history)
    } else {
      const history = JSON.parse(JSON.stringify(this.designData))
      this.historyList.push(history)
      this.historyIndex++
    }
    console.log('saveDesign', this.historyIndex, this.historyList.length)
    // console.log(this.historyList)
    store.state.ui.canUndo = this.historyIndex > 0
    store.state.ui.canRedo = this.historyList.length - this.historyIndex > 1
  }

  async undo () {
    if (
      store.state.brand.brandJson.setting.history &&
      store.state.brand.brandJson.setting.history.value
    ) {
    } else {
      return
    }
    if (this.historyIndex >= 1) {
      this.historyIndex--
      this.clear2d()
      const history = this.historyList[this.historyIndex]
      await this.load(JSON.parse(JSON.stringify(history)), this.product)
      PIXILoaderText.hideTextHighlight()
      PIXILoaderImage.hideImageHighlight()
    }
    console.log('undo', this.historyIndex, this.historyList.length)
    store.state.ui.canUndo = this.historyIndex > 0
    store.state.ui.canRedo = this.historyList.length - this.historyIndex > 1
  }

  async redo () {
    if (
      store.state.brand.brandJson.setting.history &&
      store.state.brand.brandJson.setting.history.value
    ) {
    } else {
      return
    }
    if (this.historyIndex < this.historyList.length - 1) {
      this.historyIndex++
      this.clear2d()
      const history = this.historyList[this.historyIndex]
      await this.load(JSON.parse(JSON.stringify(history)), this.product)
      PIXILoaderText.hideTextHighlight()
      PIXILoaderImage.hideImageHighlight()
    }
    console.log('redo', this.historyIndex, this.historyList.length)
    store.state.ui.canUndo = this.historyIndex > 0
    store.state.ui.canRedo = this.historyList.length - this.historyIndex > 1
  }

  reset () {
    // console.log('pixi-manager reset')
    this.clear2d()
    store.state.design.shareuc.isSleeveDesigned = false
    this.designArea = 'umb'
  }

  clearDesign () {
    this.designData.inprint = {}
  }

  clearHistory () {
    this.historyIndex = -1
    this.historyList = []
    store.state.ui.canUndo = false
    store.state.ui.canRedo = false
  }

  async selectFont (font) {
    console.log('修改字体', font)
    // 修改font
    this.selected.entity.font = font
    store.state.ui.loading = true
    await loadFont(font)
    store.state.ui.loading = false
    this.selected.style.fontFamily = font
    // 删除当前字体
    // this.selected.parent.visible = false
    // 添加字体
    // this.addText(this.selected.entity)
  }

  getLastColor () {
    console.log('getLastColor', window.vue.$store.state.ui.colorType)
    if (window.vue.$store.state.ui.colorType === 'edge') {
      PIXILoaderScarf.getLastColor()
    } else if (window.vue.$store.state.ui.colorType === 'umb') {
      if (this.selected.entity.texture.indexOf('color~') === -1) {
        store.state.design.shareuc.lastColor = ''
      } else {
        store.state.design.shareuc.lastColor = this.selected.entity.texture.replace('color~', '#')
      }
    }
  }

  // 放大片
  zoomIn (index = 0) {
    // 1.设置canvas的transform和transform-origin属性
    // 2.隐藏其他面片
    const canvas = this.canvases[this.designArea]
    if (canvas) {
      var ratio = this.canvasSize * 2 / this.output
      var marginTop = (this.height - this.canvasSize * 2) * 0.5 - this.canvasSize * 0.5 + 'px'
      var marginLeft = (this.width - this.canvasSize * 2) * 0.5 + 'px'
      canvas.style.transform = `scale(${ratio})`
      canvas.style.marginTop = marginTop
      canvas.style.marginLeft = marginLeft
    }
    PIXILoaderGift.rotateContainer(index)
    this.select(this.containers[this.designArea].getChildAt(0).getChildAt(index).getChildAt(1))
  }

  zoomOut () {
    this.switchDesignArea({
      designArea: this.designArea
    })
  }
}

export default PIXIManager
