import ThreeLoaderModel from './Three-loader-model'

class ThreeLoaderScarf {
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
    var scarf = this.manager.product.id + '.' + this.manager.designData.type3d
    var model = 'model_' + this.manager.product.gender
    console.log('loadScarf', scarf, model)
    var obj1 = await this.modelLoader.load(scarf, true, false, {}, reload, scale)
    if (position) {
      obj1.position.set(position.x, position.y, position.z)
    }
    this.scarf = obj1
    var obj2 = await this.modelLoader.load(model, false, false, {}, reload, scale)
    // 如果obj2中有hair, obj1中的hair隐藏
    let existHair = false
    if (obj1) {
      obj1.children.forEach(child => {
        if (child.name.toLowerCase().indexOf('hair') > -1) {
          existHair = true
        }
      })
    }
    if (obj2) {
      obj2.children.forEach(child => {
        if (child.name.toLowerCase().indexOf('hair') > -1) {
          child.visible = !existHair
        }
      })
      obj1.visible = true
      obj2.position.set(obj1.position.x, obj1.position.y, obj1.position.z)
    }
    if (obj2) {
      obj2.visible = true
      this.model = obj2
    }
  }

  setModel (active) {
    // 隐藏丝巾里的头发
    if (this.model) {
      this.model.visible = active
    }
    if (this.scarf) {
      this.scarf.children.forEach(child => {
        if (child.name.toLowerCase().indexOf('hair') > -1) {
          child.visible = active
        }
      })
    }
  }
}

export default ThreeLoaderScarf
