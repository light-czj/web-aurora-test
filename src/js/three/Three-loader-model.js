import store from '@/store'
import utils from '@/js/utils'
import loadImage from 'image-promise'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

class ThreeLoaderModel {
  constructor (ma) {
    this.manager = ma
    this.shouldUV2 = false
  }

  setRotation (obj, r, scale, position, offset) {
    if (typeof offset === 'undefined') {
      offset = {
        x: 0,
        y: 0,
        z: 0
      }
    }
    // 手机端的收伞和伞套y轴加偏移
    if (!store.state.ui.os.isPC && this.manager.designData.ptype === 'umb' && ['fold', 'sleeve'].indexOf(this.manager.designData.type3d) > -1) {
      offset.y += 10
      // console.log('手机端的收伞和伞套y轴加偏移')
    }
    var rotation = [0, 0, 0]
    if (r && r !== '') {
      rotation = r.split(',')
    }
    obj.rotation.set(
      (Math.PI / 180) * rotation[0],
      (Math.PI / 180) * rotation[1],
      (Math.PI / 180) * rotation[2]
    )

    obj.scale.set(scale, scale, scale)

    var pos = [0, 0, 0]
    if (position && position !== '') {
      pos = position.split(',').map(item => parseFloat(item))
    }
    obj.position.set(pos[0] + offset.x, pos[1] + offset.y, pos[2] + offset.z)
  }

  load (pid, isProduct, uv2, params, reload = false, scale = 1) {
    this.shouldUV2 = uv2
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (pid === '') {
        resolve(null)
        return
      }
      if (!store.state.brand.loadJsonComplete) {
        resolve(null)
        return
      }
      var fbxItem = null
      store.state.brand.fbxJson.list.some(item => {
        if (item.id === pid) {
          fbxItem = item
          return true
        }
      })
      if (!fbxItem) {
        console.error('找不到', pid)
        resolve(null)
        return
      }
      this.fbxItem = fbxItem
      // console.log('fbxItem=', fbxItem)
      const suffix = fbxItem.suffix || '.fbx'
      var modelName = fbxItem.id
      if (this.shouldUV2) {
        modelName = fbxItem.id + '_uv2'
      }
      modelName += suffix
      const findObj = this.manager.scene.getObjectByName(modelName)
      if (findObj !== undefined) {
        if (!reload) {
          this.setMatSide()
          this.setRotation(findObj, fbxItem.rotation, fbxItem.scale * scale, fbxItem.position, fbxItem.offset)
          resolve(findObj)
          return
        } else {
          this.setMatSide()
          await this.setNodes(findObj, suffix)
          this.setRotation(findObj, fbxItem.rotation, fbxItem.scale * scale, fbxItem.position, fbxItem.offset)
          resolve(findObj)
          return
        }
      }
      let loader = null
      if (suffix === '.fbx') {
        loader = new FBXLoader(this.manager.manager)
      } else if (suffix === '.glb') {
        loader = new GLTFLoader(this.manager.manager)
      } else {
        resolve(null)
        return
      }
      var urlModel = store.state.config.urls.fbxUrl + fbxItem.model + suffix

      // console.log('loadFBX', urlModel)

      // console.log('addChild', urlModel)
      var onProgress = function (xhr) {
        // if (xhr.lengthComputable) {
        //   var percentComplete = xhr.loaded / xhr.total * 100
        //   console.log(Math.round(percentComplete, 2) + '% downloaded')
        // }
      }
      var onError = function (xhr) {
        reject(xhr)
      }
      loader.load(
        urlModel,
        async obj => {
          let object = null
          if (suffix === '.fbx') {
            object = obj
          } else if (suffix === '.glb') {
            object = obj.scene
          }
          // 模型已经存在，不重复加载
          if (this.manager.scene.getObjectByName(modelName) !== undefined) {
            this.setMatSide()
            return
          }
          store.state.brand.fbxJson.list.some(item => {
            if (item.id === pid) {
              fbxItem = item
              return true
            }
          })
          object._type = '3d'
          object.name = modelName
          object.scaleRatio = fbxItem.scaleRatio || 1

          this.setRotation(object, fbxItem.rotation, fbxItem.scale * scale, fbxItem.position, fbxItem.offset)
          // eslint-disable-next-line no-prototype-builtins
          if (params && params.hasOwnProperty('position')) {
            object.position.set(
              params.position.x,
              params.position.y,
              params.position.z
            )
          }
          // 隐藏，加载完成后统一显示
          object.visible = false
          this.manager.scene.add(object)
          await this.setNodes(object, suffix)
          this.setMatSide()
          // console.log('add to scene:', modelName)
          resolve(object)
        },
        onProgress,
        onError
      )
    })
  }

  setMatSide () {
    // 阳伞
    // console.log('判断阳伞', this.manager.product.umbtype)
    if (this.manager.product.umbtype === 'sun') {
      this.manager.getMaterial('umb').side = THREE.FrontSide
    } else {
      this.manager.getMaterial('umb').side = THREE.DoubleSide
    }
  }

  async setNodes (object, modelSuffix = '.fbx') {
    for (let i = 0; i < object.children.length; i++) {
      const child = object.children[i]
      for (let j = 0; j < this.fbxItem.nodes.length; j++) {
        const node = this.fbxItem.nodes[j]
        if (node.node === child.name) {
          await this.setNode(child, node, modelSuffix)
        }
      }
    }
  }

  async setNode (item, node, modelSuffix = '.fbx', exist = false) {
    // 隐藏
    item._tag = node.tag
    if (node.active === 'false') {
      if (node.tag) {
        item.scale.set(0, 0, 0)
      } else {
        item.visible = false
        return
      }
    }
    if (
      node.node.endsWith('_metal') ||
      node.name === 'metal' ||
      node.node.endsWith('metal_common')
    ) {
      item.name = 'metal'
      item.material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.7,
        roughness: 0.1,
        clearcoat: 0.05,
        clearcoatRoughness: 0.05
      })
    } else {
      item.material = new THREE.MeshPhongMaterial()
    }
    // region 设置位置
    if (typeof node.position !== 'undefined' && node.position !== '') {
      var position = node.position.split(',')
      item.position.set(
        Number(position[0]),
        Number(position[1]),
        Number(position[2])
      )
    }
    // endregion
    // region 设置贴图
    if (node.name && node.name.toLowerCase() === 'umb') {
      if (this.manager.product.umbtype === 'sun') {
        var innerSide = item.clone()
        innerSide.name = 'print_innerSide'
        innerSide.material = new THREE.MeshPhongMaterial()
        innerSide.material.side = THREE.BackSide
        innerSide.material.color.setRGB(0.16, 0.16, 0.16)
        // innerSide.position.set(0, 0, 0)
        item.parent.add(innerSide)
      } else if (
        this.manager.designData &&
        this.manager.designData.type3d === 'open' &&
        this.manager.designData.type === 'color' &&
        typeof this.manager.designData.umbColor !== 'undefined'
      ) {
        // eslint-disable-next-line no-redeclare
        var innerSide = item.clone()
        innerSide.name = 'print_innerSide'
        innerSide.material = this.manager.getMaterial('umb')
        innerSide.material.color = new THREE.Color(
          this.manager.designData.umbColor
        )
        innerSide.position.set(0, 0, 0)
        item.parent.add(innerSide)
      }
      const uv2 = item.geometry.attributes['uv' + this.fbxItem.uvIndex || '2']
      // console.log('uv2', item.geometry.attributes, fbxItem.uvIndex)
      if (
        this.shouldUV2 &&
        typeof uv2 !== 'undefined'
      ) {
        item.geometry.attributes.uv = uv2
      }
    } else if (node.name === 'Cloth') {
      item.name = node.name
      item.material = this.manager.matCloth
    } else if (node.name === 'hair') {
      item.material = new THREE.MeshLambertMaterial()
      item.depthWrite = false
    } else if (node.name === 'eye') {
      item.shininess = 999
      item.opacity = 0.15
      item.vertexColors = true
    } else if (node.name.toLowerCase() === 'handle') {
      item.material = this.manager.matHandle
      item.name = 'handle'
    } else if (node.name.toLowerCase() === 'line') {
      item.material = this.manager.matLine
      item.name = 'line'
    } else if (node.name.toLowerCase() === 'hook') {
      item.material = this.manager.matHook
      item.name = 'hook'
    } else if (node.name.toLowerCase() === 'inside') {
      item.material = this.manager.matInside
      item.name = 'inside'
    } else if (node.name.toLowerCase() === 'insidebelt') {
      item.material = this.manager.matInsideBelt
      item.name = 'insidebelt'
    } else {
      // region 设置颜色
      if (
        item.name !== 'metal' &&
        typeof node.color !== 'undefined' &&
        node.color !== ''
      ) {
        item.material.color.setHex('0x' + node.color.substring(0, 6))
      }
      // endregion
    }

    // eslint-disable-next-line no-prototype-builtins
    if (
      node.name &&
      node.name !== '' &&
      this.manager.product.designArea.indexOf(node.name.toLowerCase()) > -1
    ) {
      item.name = node.name.toLowerCase()
      item.material = this.manager.getMaterial(node.name.toLowerCase())
      item.material.color = new THREE.Color('#ffffff')
      if (item.material.map) {
        item.material.map.flipY = modelSuffix === '.fbx'
      }
    }

    // endregion
    // region 设置网络贴图
    // console.log('设置网路贴图', node.node, node.tex)
    if (node.tex && node.tex !== '') {
      // eslint-disable-next-line no-redeclare
      var suffix = utils.getSuffix(node.tex)
      // eslint-disable-next-line no-redeclare
      var url = store.state.config.urls.assetsUrl + 'app/tex/' + node.tex
      if (!suffix) {
        url += '.jpg'
      }
      item.material.map = await this.loadTextureAsync(url)
      if (item.material.map) {
        item.material.map.flipY = modelSuffix === '.fbx'
      }
      if (item.material.map) {
        item.material.map.wrapS = THREE.RepeatWrapping
        item.material.map.wrapT = THREE.RepeatWrapping
      }
      if (node.repeat && node.repeat !== '') {
        item.material.map.repeat.set(
          parseFloat(node.repeat),
          parseFloat(node.repeat)
        )
      }
    }
    if (node.transparent === true) {
      item.material.transparent = true
    }
    if (node.depthWrite === false) {
      item.material.depthWrite = false
    }
    if (node.shininess && node.shininess !== '') {
      item.material.shininess = node.shininess
    }
    if (node.side && node.side !== '') {
      switch (node.side) {
        case 'front':
          item.material.side = THREE.FrontSide
          break
        case 'back':
          item.material.side = THREE.BackSide
          break
        case 'double':
          item.material.side = THREE.DoubleSide
          break
      }
    } else {
      if (
        node.name === 'Umb' &&
        this.manager.designData.type3d === 'fold' &&
        this.manager.product.backSide === true
      ) {
        item.material.side = THREE.BackSide
      } else {
        item.material.side = THREE.DoubleSide
      }
    }
    if (node.scale && node.scale !== '') {
      item.scale.set(Number(node.scale), Number(node.scale), Number(node.scale))
    }
    // endregion
  }

  async loadTextureAsync (url, options) {
    const texture = new THREE.Texture()
    texture.name = url
    texture.encoding = (options && options.encoding) || THREE.LinearEncoding
    if (options) {
      this.setTextureParams(url, texture, options)
    }

    try {
      // eslint-disable-next-line no-undef
      const image = await loadImage(url, { crossorigin: 'anonymous' })
      // console.log('模型贴图', url)

      texture.image = image
      texture.needsUpdate = true
      if (options && options.renderer) {
        // Force texture to be uploaded to GPU immediately,
        // this will avoid "jank" on first rendered frame
        options.renderer.initTexture(texture)
      }
    } catch (err) {
      console.error(err.message)
    }
    return texture
  }

  setTextureParams (url, texture, opt) {
    if (typeof opt.flipY === 'boolean') texture.flipY = opt.flipY
    if (typeof opt.mapping !== 'undefined') {
      texture.mapping = opt.mapping
    }
    if (typeof opt.format !== 'undefined') {
      texture.format = opt.format
    } else {
      // choose a nice default format
      const isJPEG =
        url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data:image\/jpeg/) === 0
      texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat
    }
    if (opt.repeat) texture.repeat.copy(opt.repeat)
    texture.wrapS = opt.wrapS || THREE.ClampToEdgeWrapping
    texture.wrapT = opt.wrapT || THREE.ClampToEdgeWrapping
    texture.minFilter = opt.minFilter || THREE.LinearMipMapLinearFilter
    texture.magFilter = opt.magFilter || THREE.LinearFilter
    texture.generateMipmaps = opt.generateMipmaps !== false
  }
}

export default ThreeLoaderModel
