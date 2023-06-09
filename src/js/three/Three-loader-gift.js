import ThreeLoaderModel from './Three-loader-model'

class ThreeLoaderMask {
  constructor (ma) {
    this.manager = ma
    this.modelLoader = new ThreeLoaderModel(ma)
  }

  async load (reload = false, rotation, scale = 1, position) {
    this.manager.scene.children.forEach((item) => {
      if (item.name !== 'light') {
        item.visible = false
      }
    })
    let pid = ''
    if (this.manager.product.model && this.manager.product.model[this.manager.designData.designid]) {
      pid = this.manager.product.model[this.manager.designData.designid]
    } else {
      pid = this.manager.product.id
    }
    console.log('load model', pid)
    var obj1 = await this.modelLoader.load(pid, true, false, {}, reload, scale)
    if (obj1) {
      obj1.visible = true
      if (position) {
        obj1.position.set(position.x, position.y, position.z)
      }
      if (rotation) {
        obj1.rotation.set(rotation.x, rotation.y, rotation.z)
      }
      this.toggleHook(false)
    }
  }

  toggleHook (isOpen = '') {
    let pid = ''
    if (this.manager.product.model && this.manager.product.model[this.manager.designData.designid]) {
      pid = this.manager.product.model[this.manager.designData.designid]
    } else {
      pid = this.manager.product.id
    }
    this.manager.scene.children.forEach((item) => {
      if (item.name === pid + '.fbx') {
        if (isOpen !== '') {
          item.isOpen = isOpen
        } else {
          item.isOpen = true
        }
        item.children.forEach(child => {
          if (child._tag === 'hookclose') {
            const scale = !item.isOpen ? 1 : 0
            child.scale.set(scale, scale, scale)
          } else if (child._tag === 'hookopen') {
            const scale = item.isOpen ? 1 : 0
            child.scale.set(scale, scale, scale)
          }
        })
      }
    })
  }
}

export default ThreeLoaderMask
