import ThreeLoaderModel from './Three-loader-model'

class ThreeLoaderMask {
  constructor (ma) {
    this.manager = ma
    this.modelLoader = new ThreeLoaderModel(ma)
  }

  async load (manager) {
    manager.scene.children.forEach((item) => {
      if (item.name !== 'light') {
        item.visible = false
      }
    })
    var pid = manager.product.id + '_' + manager.product.gender
    var model = manager.product.model + '_' + manager.product.gender
    // console.log('loadMask', pid, model)
    var obj1 = await this.modelLoader.load(manager, pid, true, false)
    var obj2 = await this.modelLoader.load(manager, model, false, false)
    if (obj1) {
      obj1.visible = true
    }
    if (obj2) {
      obj2.visible = true
    }
  }
}

export default ThreeLoaderMask
