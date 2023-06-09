import utils from '@/js/utils'
import store from '@/store'
import * as PIXI from 'pixi.js'

function getDefaultTexture (type, index = 0) {
  if (store.state.design.shareuc.designData.ptype === 'scarf') {
    return 'aurora/tex/scarf/' + store.state.design.shareuc.designData.designid + '_' + (index + 1) + '_v1.png'
  }
  var row = store.state.design.shareuc.row
  if (row && row.defaultTexture && typeof row.defaultTexture !== 'undefined') {
    return row.defaultTexture[type]
  } else {
    if (store.state.ui.filter) {
      var list = store.state.brand.brandJson.texture[store.state.ui.galleryIndex].images[0][store.state.ui.filter]
      if (list[0].id.indexOf('pantone') === -1) {
        return list[0].id
      } else {
        return list[1].id
      }
    } else {
      // eslint-disable-next-line no-redeclare
      var list = store.state.brand.brandJson.texture[store.state.ui.galleryIndex].images
      if (list[0].id.indexOf('pantone') === -1) {
        return list[0].id
      } else {
        return list[1].id
      }
    }
  }
}

function getTexturePath (texture) {
  // console.log('getTexturePath', texture)
  let ret = ''
  if (texture.indexOf('api.shareuc.com') > -1) {
    ret = texture
  } else if (texture.indexOf('/tex/') > -1) {
    if (texture.indexOf('.') === -1) {
      ret = store.state.config.urls.galleryUrl + texture + '.jpg' + store.getters.textureSize
    } else {
      ret = store.state.config.urls.galleryUrl + texture + store.getters.textureSize
    }
  } else if (texture.indexOf('UCApp') > -1) {
    if (texture.indexOf('https://') > -1) {
      ret = texture
    } else {
      ret = store.state.config.urls.downUrl + texture
    }
  } else if (texture.indexOf('color~') > -1) {
    ret = require('@/assets/images/white.png')
  }
  // console.log(`getTexturePath texture=${texture} ret=${ret}`)
  return ret
}

async function loadResource (src, fname) {
  // console.log('loadResource', fname)
  return new Promise((resolve, reject) => {
    var resource = PIXI.Loader.shared.resources[fname]
    if (resource && typeof resource.texture !== 'undefined') {
      resolve(resource.texture)
    } else {
      if (PIXI.Loader.shared.loading) {
        console.error('PIXI.Loader.shared.loading', fname)
        return
      }
      PIXI.Loader.shared.add(fname, src)
      PIXI.Loader.shared.load((loader, resources) => {
        resolve(resources[fname].texture)
      })
    }
  })
}

async function loadResources (list) {
  // console.log('loadResources', list)
  return new Promise((resolve, reject) => {
    if (PIXI.Loader.shared.loading) {
      console.error('PIXI.Loader.shared.loading')
      // reject(new Error('PIXI.Loader.shared.loading'))
    }
    for (let i = 0; i < list.length; i++) {
      var resource = PIXI.Loader.shared.resources[list[i].name]
      if (typeof resource === 'undefined') {
        PIXI.Loader.shared.add(list[i].name, list[i].src)
      }
    }
    PIXI.Loader.shared.load((loader, resources) => {
      resolve()
    })
  })
}

// 加载贴图
async function loadTexture (src, fname) {
  console.log(`loadTexture src=${src} fname=${fname}`)
  return new Promise((resolve, reject) => {
    var resource = PIXI.Loader.shared.resources[fname]
    if (resource && resource.texture != null) {
      resolve(resource.texture)
    } else {
      if (src === '') {
        resolve(null)
        return
      }
      if (PIXI.Loader.shared.resources[fname]) {
        resolve(PIXI.Loader.shared.resources[fname].texture)
        return
      }
      if (PIXI.Loader.shared.loading) {
        console.error('PIXI.Loader.shared.loading')
        resolve(null)
        return
      }
      var image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src
      image.onload = () => {
        if (PIXI.Loader.shared.resources[fname]) {
          resolve(PIXI.Loader.shared.resources[fname].texture)
          return
        }
        if (PIXI.Loader.shared.loading) {
          console.error('PIXI.Loader.shared.loading')
          resolve(null)
          return
        }
        const base64 = utils.resizeImageToBase64(image, 1024, 1024 * (image.height / image.width), utils.getSuffix(fname))
        // console.log('pixi加载图片', fname, base64)
        PIXI.Loader.shared.add(fname, base64)
        PIXI.Loader.shared.load((loader, resources) => {
          if (resources[fname] == null) {
            console.error('pixi加载图片失败', fname, base64)
            resolve(null)
          } else if (resources[fname].texture == null) {
            console.error('pixi加载图片失败', fname, base64)
            resolve(null)
          } else {
            resources[fname].texture.origWidth = image.width
            resources[fname].texture.origHeight = image.height
            resources[fname].texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.ON
            resolve(resources[fname].texture)
          }
        })
      }
      image.onerror = () => {
        console.error('加载图片出错')
        resolve(null)
      }
    }
  })
}

export { getDefaultTexture, getTexturePath, loadTexture, loadResource, loadResources }
