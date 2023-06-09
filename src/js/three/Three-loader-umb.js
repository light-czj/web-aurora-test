import * as THREE from 'three'
import ThreeLoaderModel from './Three-loader-model'

class ThreeLoaderUmb {
  constructor (ma) {
    this.manager = ma
    this.modelLoader = new ThreeLoaderModel(ma)
  }

  async load () {
    const type3d = this.manager.designData.type3d
    this.manager.scene.children.forEach(item => {
      if (item.name !== 'light') {
        item.visible = false
      }
    })
    var str = ''
    if (type3d !== 'open') {
      str = '_' + type3d
    }
    var pid = this.manager.product.id
    var umbid = pid + str

    const uv2 = false

    var handleid = ''
    if (this.manager.option) {
      handleid = this.manager.option.customid
    }
    // console.log('loadUmb', type3d, umbid, handleid)
    var obj1 = await this.modelLoader.load(umbid, true, uv2)
    if (obj1) {
      obj1.children.forEach((item, index) => {
        if (item.name === 'Umb') {
          if (type3d === 'fold' && this.manager.product.backSide === true) {
            item.material.side = THREE.BackSide
          } else {
            item.material.side = THREE.DoubleSide
          }
        }
      })
    }
    var obj2 = await this.modelLoader.load(handleid, false, false)
    if (obj1) {
      obj1.visible = true
    }
    if (obj2) {
      obj2.visible = true
      if (obj1) {
        // 把手scale与伞一致
        let zoom = 1
        if (this.manager.option) {
          zoom = this.manager.option.zoom || 1
        }
        const ratio = obj1.scaleRatio || 1
        obj2.scale.set(
          obj1.scale.x * zoom * ratio,
          obj1.scale.y * zoom * ratio,
          obj1.scale.z * zoom * ratio
        )
        // 把手rotation与伞一致
        obj2.rotation.set(obj1.rotation.x, obj1.rotation.y, obj1.rotation.z)
        // 把手位置与伞一致
        obj2.position.set(obj1.position.x, obj1.position.y, obj1.position.z)
      }
    }
  }
}

export default ThreeLoaderUmb
