import store from '@/store'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ThreeLoaderUmb from './Three-loader-umb'
import ThreeLoaderMask from './Three-loader-mask'
import ThreeLoaderScarf from './Three-loader-scarf'
import ThreeLoaderGift from './Three-loader-gift'
import moment from 'dayjs'
import TWEEN from '@tweenjs/tween.js'
import utils from '@/js/utils'

class ThreeManager {
  // eslint-disable-next-line no-useless-constructor
  constructor (element) {
    this.elementRoot = element
    this.width = parseFloat(getComputedStyle(element).width)
    this.height = parseFloat(getComputedStyle(element).height)
    this.elementRoot.style.width = this.width + 'px'
    this.elementRoot.style.height = this.height + 'px'
    this.manager = null
    this.materials = {}
    this.designData = null
    this.product = null
    this.option = null
    this.matCloth = null
    this.matLine = null
    this.matInside = null
    this.matInsideBelt = null
    this.matHook = null

    this.scene = null
    this.renderer = null
    this.camera = null
    this.elementDownload = null

    if (store.state.ui.os.isPC) {
      this.controlY = 50
    } else {
      this.controlY = 60
    }

    this.initial()
  }

  animate () {
    const this_ = this
    requestAnimationFrame(function () {
      this_.animate()
    })
    this_.renderer.render(this_.scene, this_.camera)
  }

  initial () {
    this.scene = new THREE.Scene()
    if (process.env.NODE_ENV === 'development') {
      // three.js调试
      window.THREE = THREE
      window.scene = this.scene
    }

    this.matCloth = new THREE.MeshPhongMaterial()
    this.matCloth.side = THREE.DoubleSide
    this.matCloth.vertexColors = THREE.NoColors
    this.matCloth.color = new THREE.Color('#EFEFD0')

    this.matLine = new THREE.MeshPhongMaterial()
    this.matLine.side = THREE.DoubleSide
    this.matLine.vertexColors = THREE.NoColors
    this.matLine.map = THREE.TextureLoader('https://uc.shareuc.com/app/tex/line_01.png')
    this.matLine.color = new THREE.Color('#ffffff')

    this.matHook = new THREE.MeshPhongMaterial()
    this.matHook.side = THREE.DoubleSide
    this.matHook.vertexColors = THREE.NoColors
    this.matHook.color = new THREE.Color('#ffffff')

    this.matInside = new THREE.MeshPhongMaterial()
    this.matInside.side = THREE.DoubleSide
    this.matInside.vertexColors = THREE.NoColors
    this.matInside.color = new THREE.Color('#333333')

    this.matInsideBelt = new THREE.MeshPhongMaterial()
    this.matInsideBelt.side = THREE.DoubleSide
    this.matInsideBelt.vertexColors = THREE.NoColors
    this.matInsideBelt.color = new THREE.Color('#000000')

    this.matHandle = new THREE.MeshPhongMaterial()
    this.matHandle.side = THREE.DoubleSide
    this.matHandle.vertexColors = THREE.NoColors

    this.manager = new THREE.LoadingManager()

    const alight = new THREE.AmbientLight(0xffffff, 0.74)
    alight.name = 'light'
    this.scene.add(alight)

    const pLight = new THREE.PointLight(0xffffff, 0.25)
    pLight.name = 'light'
    pLight.position.set(0, 0, 500)
    this.scene.add(pLight)

    const pLight2 = new THREE.PointLight(0xffffff, 0.25)
    pLight2.name = 'light'
    pLight2.position.set(0, 0, -500)
    this.scene.add(pLight2)

    const pLight3 = new THREE.PointLight(0xffffff, 0.2)
    pLight3.name = 'light'
    pLight3.position.set(0, 0, 0)
    this.scene.add(pLight3)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: 'highp',
      preserveDrawingBuffer: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.elementRoot.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      this.controlY,
      this.width / this.height,
      1,
      1000
    )
    this.camera.position.z = 1

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.maxPolarAngle = 4
    this.controls.minDistance = 20
    this.controls.maxDistance = 100
    this.controls.enablePan = false
    this.controls.update()

    this.animate()

    // console.log('初始化three')
  }

  async load (designData, product, option, reload = false, rotation, scale, position) {
    // 重置相机
    this.controls.target.set(0, 57, 0)
    this.camera.position.set(4, this.controlY, 90)
    this.controls.update()

    this.designData = designData
    this.product = product
    this.option = option
    store.state.ui.loading = true
    if (designData.ptype === 'umb') {
      this.controls.maxPolarAngle = 4
      this.controls.minPolarAngle = 0
      if (!this.loaderUmb) {
        this.loaderUmb = new ThreeLoaderUmb(this)
      }
      await this.loaderUmb.load()
    } else if (designData.ptype === 'mask') {
      this.controls.maxPolarAngle = 1.45
      this.controls.minPolarAngle = 1.45
      if (!this.loaderMask) {
        this.loaderMask = new ThreeLoaderMask(this)
      }
      await this.loaderMask.load()
    } else if (designData.ptype === 'scarf') {
      this.controls.maxPolarAngle = 1.45
      this.controls.minPolarAngle = 1.45
      if (!this.loaderScarf) {
        this.loaderScarf = new ThreeLoaderScarf(this)
      }
      await this.loaderScarf.load(reload, rotation, scale, position)
    } else if (designData.ptype === 'gift') {
      this.controls.maxPolarAngle = 4
      this.controls.minPolarAngle = 0
      if (!this.loaderGift) {
        this.loaderGift = new ThreeLoaderGift(this)
      }
      await this.loaderGift.load(reload, rotation, scale, position)
    }
    this.controls.target.set(0, this.controlY, 0)
    this.camera.position.set(4, this.controlY, 90)
    this.controls.update()
    store.state.ui.loading = false
    // console.log('three load')
  }

  setCameraPosition (type) {
    console.log('setCameraPosition', type)
    if (type === 'umb') {
      this.controls.target.set(0, this.controlY, 0)
      this.camera.position.set(4, this.controlY, 90)
      this.controls.update()
    } else if (type === 'hook') {
      // console.log('相机位置', this.camera.position)
      this.controls.target.set(0, this.controlY, 0)
      this.camera.position.set(65.25, 50.76, -62.1)
      this.controls.update()
    } else if (type === 'inside') {
      // console.log('相机位置', this.camera.position)
      this.controls.target.set(0, this.controlY, 0)
      this.camera.position.set(0.01, -40.07, 1.53)
      this.controls.update()
    } else if (type === 'fold') {
      this.controls.target.set(0, this.controlY, 0)
      this.camera.position.set(4, this.controlY, 90)
      this.controls.update()
    } else if (type === 'handle') {
      console.log('执行动画')
      this.controls.target.set(0, this.controlY, 0)
      this.camera.position.set(4, this.controlY, 90)
      this.controls.update()
      var coords = {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      }
      let tweenPos = null
      if (store.state.ui.os.isPC) {
        tweenPos = { x: 0.888, y: this.controlY, z: 19.8 }
      } else {
        tweenPos = { x: 1.853, y: this.controlY, z: 41.7 }
      }
      this.tween = new TWEEN.Tween(coords)
        .to(tweenPos, 3000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          this.camera.position.set(coords.x, coords.y, coords.z)
        })
        .start()
    }
  }

  getMaterial (designArea) {
    // console.log('getMaterial ', designArea)
    // eslint-disable-next-line no-prototype-builtins
    if (!this.materials.hasOwnProperty(designArea)) {
      const material = new THREE.MeshPhongMaterial()
      material.side = THREE.DoubleSide
      material.vertexColors = THREE.NoColors
      material.map = store.state.design.textures[designArea]
      this.materials[designArea] = material
    }
    return this.materials[designArea]
  }

  setMatsTextures (texName) {
    this.product.designArea.forEach(item => {
      const mat = this.getMaterial(item)
      const temp = item === 'umb' ? '' : '_' + utils.uperFirst(item)
      const url = `${store.state.config.urls.uploadUrl}${texName + temp}.jpg`
      // console.log('setTexture', item, url)
      mat.map = new THREE.TextureLoader().load(url)
    })
  }

  downloadImages () {
    if (!this.elementDownload) {
      this.elementDownload = document.createElement('a')
    }
    const base64 = this.renderer.domElement.toDataURL('image/png', 1.0)
    const name = moment().format('YYYYMMDDHHmmss')
    this.elementDownload.href = base64
    this.elementDownload.download = name + '_3d'
    this.elementDownload.click()
  }

  changeClothColor (val) {
    console.log('设置衣服颜色', val)
    this.matCloth.color = new THREE.Color(val.replace('0x', '#'))
  }

  capture () {
    return this.renderer.domElement.toDataURL('image/png', 1)
  }

  getLineColor () {
    window.vue.$store.state.design.shareuc.lastColor = window.vue.$store.state.design.shareuc.lineColor
  }

  changeLineColor (val) {
    window.vue.$store.state.design.shareuc.lineColor = val
    this.matLine.color.setHex(val.replace('#', '0x'))
  }

  setModel (active) {
    this.loaderScarf.setModel(active)
  }

  changeHookColor (val) {
    console.log('魔术贴颜色', val)
    window.vue.$store.state.design.shareuc.designData.hookColor = val
    // this.matHook.color.setHex(val.replace('#', '0x'))
    if (val === '#000000') {
      this.matHook.map = new THREE.TextureLoader().load('https://ucjpacc.shareuc.com/app/tex/Velcro_v1.jpg')
    } else {
      this.matHook.map = new THREE.TextureLoader().load('https://ucjpacc.shareuc.com/app/tex/Velcro_white_v1.png')
    }
    this.matHook.map.flipY = true
    this.matHook.map.wrapS = THREE.RepeatWrapping
    this.matHook.map.wrapT = THREE.RepeatWrapping
  }

  changeInsideColor (val) {
    console.log('内里颜色', val)
    window.vue.$store.state.design.shareuc.designData.insideColor = val
    if (val === '#000000') {
      this.matInside.color.setHex('0x333333')
      this.matInsideBelt.color.setHex('0x000000')
    } else {
      this.matInside.color.setHex('0xffffff')
      this.matInsideBelt.color.setHex('0xDEDEDE')
    }
  }

  toggleHook (val) {
    this.loaderGift.toggleHook(val)
  }
}

export default ThreeManager
