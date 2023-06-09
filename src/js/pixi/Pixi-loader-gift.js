// 加载2d口罩
import * as PIXI from 'pixi.js'
import { getDefaultTexture, getTexturePath, loadTexture, loadResource, loadResources } from './Pixi-loader-texture'
import store from '@/store'

let manager = null
let containerRoot = null
let selected = null

function downWrapper (event) {
  const sprite = this._sprite
  selected = sprite
  sprite.data = event.data
  manager.downItemBefore()
  manager.selectedBG = sprite
  manager.select(sprite)
  const newPosition = sprite.data.getLocalPosition(sprite.parent)
  sprite._posPreX = newPosition.x
  sprite._posPreY = newPosition.y
  sprite.startX = sprite.entity.X
  sprite.startY = sprite.entity.Y
  sprite.startx = sprite.tilePosition.x
  sprite.starty = sprite.tilePosition.y

  manager.downItem()
}

function downPatch (event) {
  selected = this
  manager.downItemBefore()

  this.dragging = false
  manager.selectedBG = this
  manager.select(this)
  this.data = event.data
  const newPosition = this.data.getLocalPosition(this.parent)
  this._posPreX = newPosition.x
  this._posPreY = newPosition.y
  this.startX = this.entity.X
  this.startY = this.entity.Y
  this.startx = this.tilePosition.x
  this.starty = this.tilePosition.y

  manager.downItem()
}

function upPatch () {
  if (selected !== this) return
  selected = null
  if (!this.dragging) return
  this.data = null
  this.dragging = false
  var X = 0
  var Y = 0
  X = (-(this.tilePosition.x / (this.texture.orig.width * this.tileScale.x) - 0.5)).toFixed(6)
  Y = (this.tilePosition.y / (this.texture.orig.height * this.tileScale.y) - 0.5).toFixed(6)
  this.entity.X = X
  this.entity.Y = Y
  manager.saveDesign()
}

function upWrapper (event) {
  selected = null
  const sprite = this._sprite
  sprite.data = null
  var X = 0
  var Y = 0
  X = (-(sprite.tilePosition.x / (sprite.texture.orig.width * sprite.tileScale.x) - 0.5)).toFixed(6)
  Y = (sprite.tilePosition.y / (sprite.texture.orig.height * sprite.tileScale.y) - 0.5).toFixed(6)
  sprite.entity.X = X
  sprite.entity.Y = Y
  manager.saveDesign()
}

function movePatch () {
  if (selected !== this) return
  this.dragging = true
  const newPosition = this.data.getLocalPosition(this.parent)
  this._deltaX = newPosition.x - this._posPreX
  this._deltaY = newPosition.y - this._posPreY
  const changex = (this._deltaX * Math.cos(this.rotation) + this._deltaY * Math.sin(this.rotation))
  const changey = (-this._deltaX * Math.sin(this.rotation) + this._deltaY * Math.cos(this.rotation))
  this.tilePosition.x += changex
  this.tilePosition.y += changey
  this.tilePosition.x %= this.texture.orig.width * this.tileScale.x * this.entity.mirror
  this.tilePosition.y %= this.texture.orig.height * this.tileScale.y
  this._posPreX = newPosition.x
  this._posPreY = newPosition.y
}

function moveWrapper (event) {
  const sprite = this._sprite
  if (!selected || selected._index !== sprite._index) return
  const newPosition = event.data.getLocalPosition(sprite.parent)
  if (!newPosition.x) return
  sprite._deltaX = newPosition.x - sprite._posPreX
  sprite._deltaY = newPosition.y - sprite._posPreY
  const changex = (sprite._deltaX * Math.cos(sprite.rotation + Math.PI / 180 * sprite._angle) + sprite._deltaY * Math.sin(sprite.rotation + Math.PI / 180 * sprite._angle))
  const changey = (-sprite._deltaX * Math.sin(sprite.rotation + Math.PI / 180 * sprite._angle) + sprite._deltaY * Math.cos(sprite.rotation + Math.PI / 180 * sprite._angle))
  sprite.tilePosition.x += changex
  sprite.tilePosition.y += changey
  sprite.tilePosition.x %= sprite.texture.orig.width * sprite.tileScale.x * sprite.entity.mirror
  sprite.tilePosition.y %= sprite.texture.orig.height * sprite.tileScale.y
  sprite._posPreX = newPosition.x
  sprite._posPreY = newPosition.y

  if (manager.getOrCreateContainer(manager.designArea).tillingList != null) {
    manager
      .getOrCreateContainer(manager.designArea)
      .tillingList.forEach((item) => {
        if (item._index === manager.selectedBG._index) return
        if (item._tag !== manager.selectedBG._tag) return
        // console.log(changex, changey, item.entity.mirror)
        item.tilePosition.x += changex * item.entity.mirror
        item.tilePosition.y += changey
        item.tilePosition.x %= item.texture.orig.width * item.tileScale.x
        item.tilePosition.y %= item.texture.orig.height * item.tileScale.y
        item.entity.quality = manager.selected.entity.quality
      })
  }
}

function update () {
  manager.selected.angle = store.state.ui.rotation
  manager.selected.entity.ZV = store.state.ui.zoom
  manager.selected.entity.AV = store.state.ui.rotation
  var newScale = manager.selected.entity.ZV * manager.selected.entity.SV * manager.output / 1024
  const deltaX = manager.selected.tilePosition.x / manager.selected.tileScale.x * (newScale - manager.selected.tileScale.x)
  const deltaY = manager.selected.tilePosition.y / manager.selected.tileScale.y * (newScale - manager.selected.tileScale.y)
  manager.selected.tilePosition.x += deltaX * manager.selected.entity.mirror
  manager.selected.tilePosition.y += deltaY
  manager.selected.tileScale.set(newScale * manager.selected.entity.mirror, newScale)

  if (manager.getOrCreateContainer(manager.designArea).tillingList != null) {
    manager
      .getOrCreateContainer(manager.designArea)
      .tillingList.forEach(item => {
        if (item._tag !== manager.selected._tag) return
        item.angle = store.state.ui.rotation
        item.entity.ZV = store.state.ui.zoom
        item.entity.AV = store.state.ui.rotation
        item.tileScale.set(
          manager.selected.tileScale.x * item.entity.mirror,
          manager.selected.tileScale.y
        )
        item.tilePosition.x =
          manager.selected.tilePosition.x * item.entity.mirror
        item.tilePosition.y = manager.selected.tilePosition.y
        item.entity.quality = manager.selected.entity.quality
      })
  }
}

export default {
  load: async function (ma) {
    manager = ma

    // 加载资源
    const list = []
    // 遍历属性
    Object.keys(manager.product).forEach(item => {
      if (item.startsWith('svg')) {
        for (var key in manager.product[item]) {
          const value = manager.product[item][key]
          if (typeof value === 'string' && value.indexOf('.svg') > -1) {
            list.push({
              src: require('@/assets/svg/' + value),
              name: value
            })
          } else if (Array.isArray(value)) {
            value.forEach(child => {
              list.push({
                src: require('@/assets/svg/' + child.svg),
                name: child.svg
              })
            })
          }
        }
      }
    })
    await loadResources(list)

    for (let i = 0; i < manager.product.designArea.length; i++) {
      const type = manager.product.designArea[i]
      let designPart = null
      if (manager.designData.designid) {
        designPart = manager.product['svg_' + manager.designData.designid]
      } else {
        designPart = manager.product.svg
      }
      if (typeof designPart[type] !== 'string') {
        containerRoot = manager.getOrCreateContainer(type)

        let angleOffset = 0

        // 创建容器
        if (containerRoot.children.length === 0) {
          const container = new PIXI.Container()
          container._type = 'container'
          container.x = manager.output / 2
          container.y = manager.output / 2
          container.pivot.x = manager.output / 2
          container.pivot.y = manager.output / 2
          angleOffset = designPart.angle[type] || 0
          container.angle = 0
          containerRoot.addChild(container)

          const containerText = new PIXI.Container()
          // containerText._type = 'container'
          containerRoot.addChild(containerText)

          const containerSvg = new PIXI.Container()
          containerSvg._type = 'container'
          containerSvg.name = 'containerSvg'
          containerRoot.addChild(containerSvg)

          const containerImage = new PIXI.Container()
          // containerImage._type = 'container'
          containerRoot.addChild(containerImage)

          const wrapperContainer = new PIXI.Container()
          wrapperContainer._type = 'container'
          wrapperContainer.x = manager.output / 2
          wrapperContainer.y = manager.output / 2
          wrapperContainer.pivot.x = manager.output / 2
          wrapperContainer.pivot.y = manager.output / 2
          wrapperContainer.angle = designPart.wrapperAngle
          containerRoot.addChild(wrapperContainer)
        }

        containerRoot.tillingList = []
        const maskList = designPart[type]
        // console.log('maskList', designPart, type)
        const hitArr = []
        for (let i = 0; i < maskList.length + 1; i++) {
          const x = parseInt(manager.output * 0.5 + manager.output * Math.cos(Math.PI / 180 * (360 / maskList.length) * (i)))
          const y = parseInt(manager.output * 0.5 + manager.output * Math.sin(Math.PI / 180 * (360 / maskList.length) * (i)))
          hitArr.push({
            x,
            y
          })
        }
        for (let j = 0; j < maskList.length; j++) {
          await this.loadPatchOne(type, maskList[j], typeof maskList[j].offset !== 'undefined' ? maskList[j].offset : (360 / maskList.length * j), designPart.moveAngle, containerRoot.getChildAt(0), j, maskList[j].tag || j, angleOffset)
        }
        for (let j = 0; j < maskList.length; j++) {
          await this.loadWrapper(type, maskList[j], containerRoot.getChildAt(4), j, maskList[j].tag || j, hitArr, containerRoot.tillingList[j], maskList[j].hitArea)
        }
        await this.loadMaterial(type, containerRoot.getChildAt(0))
      } else {
        await this.loadPatch(type)
        await this.loadMaterial(type, containerRoot.getChildAt(0))
      }
      if (store.state.design.shareuc.designData.pid === 'Hat05') {
        if (type === 'belt') {
          this.loadMiddleLineBelt(manager.getOrCreateContainer(type).getChildAt(2))
        } else if (type === 'logoend') {
          this.loadMiddleLineLogoEnd(manager.getOrCreateContainer(type).getChildAt(2))
        } else if (type === 'sleeve') {
          this.loadMiddleLineLogoEnd(manager.getOrCreateContainer(type).getChildAt(2))
        }
      }
      await manager.loadItems(type, containerRoot)
    }
  },

  async loadMaterial (type, container) {
    if (!manager.product.material || !manager.product.material[type]) return
    let layerName = manager.product.material[type]
    if (['hat_6a6', 'hat_6abc', 'hat_6s'].indexOf(manager.designData.designid) > -1 && type === 'umb') {
      layerName = layerName.replace('.png', '1.png')
    }
    // var tex = await loadResource(require('@/assets/material_min/' + layerName), layerName)
    // var tex = await loadResource(require('@/assets/material/' + layerName), layerName)
    var tex = await loadResource(`https://ucjpacc.shareuc.com/app/material/${layerName}`, layerName)
    var sprite = new PIXI.Sprite(tex)
    sprite.anchor.set(0.5)
    sprite.x = manager.output / 2
    sprite.y = manager.output / 2
    sprite.scale.set(manager.output / sprite.height, manager.output / sprite.height)
    container.addChild(sprite)
    // console.log('loadMaterial', type, sprite)
  },

  loadMiddleLineBelt (containerSvg) {
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(6, 0x000000, 1)
    graphics.moveTo(manager.output * 0.5, manager.output * 0.5 + 100)
    graphics.lineTo(manager.output * 0.5, manager.output * 0.5 - 100)
    containerSvg.addChild(graphics)

    const graphics1 = new PIXI.Graphics()
    graphics1.lineStyle(6, 0x000000, 1)
    graphics1.moveTo(manager.output * 0.25, manager.output * 0.5 + 100)
    graphics1.lineTo(manager.output * 0.25, manager.output * 0.5 + 75)
    containerSvg.addChild(graphics1)

    const graphics2 = new PIXI.Graphics()
    graphics2.lineStyle(6, 0x000000, 1)
    graphics2.moveTo(manager.output * 0.75, manager.output * 0.5 + 100)
    graphics2.lineTo(manager.output * 0.75, manager.output * 0.5 + 75)
    containerSvg.addChild(graphics2)
  },

  loadMiddleLineLogoEnd (containerSvg) {
    const graphics = new PIXI.Graphics()
    graphics.lineStyle(6, 0x000000, 1)
    graphics.moveTo(manager.output * 0.5 - 500, manager.output * 0.5)
    graphics.lineTo(manager.output * 0.5 - 275, manager.output * 0.5)
    containerSvg.addChild(graphics)

    const graphics1 = new PIXI.Graphics()
    graphics1.lineStyle(6, 0x000000, 1)
    graphics1.moveTo(manager.output * 0.5 + 275, manager.output * 0.5)
    graphics1.lineTo(manager.output * 0.5 + 500, manager.output * 0.5)
    containerSvg.addChild(graphics1)

    const graphics2 = new PIXI.Graphics()
    graphics2.lineStyle(6, 0x000000, 1)
    graphics2.moveTo(manager.output * 0.5, manager.output * 0.5 - 525)
    graphics2.lineTo(manager.output * 0.5, manager.output * 0.5 - 500)
    containerSvg.addChild(graphics2)

    const graphics3 = new PIXI.Graphics()
    graphics3.lineStyle(6, 0x000000, 1)
    graphics3.moveTo(manager.output * 0.5, manager.output * 0.5 + 525)
    graphics3.lineTo(manager.output * 0.5, manager.output * 0.5 + 500)
    containerSvg.addChild(graphics3)
  },

  async loadWrapper (type, mask, container, index, tag, hitArr, tillingSprite, hitArea) {
    const w = manager.output
    const h = manager.output
    const tilingSprite = new PIXI.TilingSprite(
      PIXI.Texture.EMPTY,
      manager.output * w,
      manager.output * h
    )
    tilingSprite._index = index
    tilingSprite._tag = tag
    tilingSprite.interactive = true
    tilingSprite
      .on('pointerdown', downWrapper)
      .on('pointerup', upWrapper)
      .on('pointerupoutside', upWrapper)
      .on('pointermove', moveWrapper)
    tilingSprite._sprite = tillingSprite
    container.addChild(tilingSprite)
    if (hitArea) {
      // console.log('hitArea', hitArea)
      tilingSprite.hitArea = new PIXI.Polygon(hitArea)
    } else {
      if (hitArr.length > 2) {
        // const graphics = new PIXI.Graphics()
        // graphics.beginFill(0xFF3300)
        // graphics.lineStyle(10, index % 2 === 0 ? 0xff0000 : 0x00ff00, 1)
        // graphics.moveTo(manager.output * 0.5, manager.output * 0.5)
        // graphics.lineTo(hitArr[index % manager.product.ks].x, hitArr[index % manager.product.ks].y)
        // graphics.lineTo(hitArr[(index + 1) % manager.product.ks].x, hitArr[(index + 1) % manager.product.ks].y)
        // graphics.closePath()
        // graphics.endFill()
        const arr = [manager.output * 0.5, manager.output * 0.5]
        arr.push(hitArr[index % manager.product.ks].x)
        arr.push(hitArr[index % manager.product.ks].y)
        arr.push(hitArr[(index + 1) % manager.product.ks].x)
        arr.push(hitArr[(index + 1) % manager.product.ks].y)
        tilingSprite.hitArea = new PIXI.Polygon(arr)
        // container.addChild(graphics)
      }
    }
  },

  async loadPatchOne (type, mask, angle, moveAngle, container, index, tag, angleOffset) {
    var entity = manager.designData.inprint[type][index]
    if (!entity) {
      const defaultTexture = getDefaultTexture(type)
      entity = {
        index: 0,
        X: 0,
        Y: 0,
        ZV: 1,
        SV: 0,
        AV: 0,
        pixel: 72,
        texture: defaultTexture,
        textlist: [],
        imagelist: [],
        mirror: 1,
        fit: 'y'
      }
      store.commit('addPatch', {
        designArea: type,
        entity
      })
    }
    const path = getTexturePath(entity.texture)
    const panel = new PIXI.Container()
    panel.x = manager.output / 2
    panel.y = manager.output / 2
    panel.pivot.x = manager.output / 2
    panel.pivot.y = manager.output / 2
    panel.angle = angle + angleOffset
    container.addChild(panel)

    var texture = await loadTexture(path, entity.texture)
    const tilingSprite = new PIXI.TilingSprite(
      texture,
      manager.output * 1.5,
      manager.output * 1.5
    )

    tilingSprite._type = 'gift'
    tilingSprite._tag = tag
    tilingSprite._angle = angle + moveAngle
    tilingSprite._index = index
    tilingSprite.entity = entity
    tilingSprite.x = manager.output / 2
    tilingSprite.y = manager.output / 2
    tilingSprite.uvRespectAnchor = true
    tilingSprite.anchor.set(0.5)

    // console.log('texture.origHeight=', texture.origHeight)

    manager.setPatchTextureRealSize({
      patch: tilingSprite,
      texture: texture,
      realSizeY: texture.origHeight / 72 * 2.54,
      pixel: entity.pixel,
      SV: entity.SV,
      designArea: 'umb'
    })
    tilingSprite.tilePosition.x = (-entity.X + 0.5) * texture.orig.width * tilingSprite.tileScale.x
    tilingSprite.tilePosition.y = (entity.Y - 0.5) * texture.orig.height * tilingSprite.tileScale.y

    // mask
    // console.log('mask=', maskName)
    var maskTex = await loadResource(
      require('@/assets/svg/' + mask.svg),
      mask.svg
    )
    var spriteMask = new PIXI.Sprite(maskTex)
    spriteMask.anchor.set(0.5)
    spriteMask.x = maskTex.width / 2
    spriteMask.y = maskTex.height / 2
    spriteMask.angle = -(angle + angleOffset)
    spriteMask.scale.set(mask.scale || 1)
    // console.log(spriteMask)
    panel.addChild(spriteMask)
    tilingSprite.mask = spriteMask

    panel.addChild(tilingSprite)

    // 默认选中的片
    if (index === 0) {
      containerRoot.patch = tilingSprite
    }

    containerRoot.tillingList.push(tilingSprite)
  },

  async loadPatch (designArea) {
    containerRoot = manager.getOrCreateContainer(designArea)
    containerRoot.tillingList = []

    if (containerRoot.children.length === 0) {
      const container = new PIXI.Container()
      containerRoot.addChild(container)

      const containerText = new PIXI.Container()
      containerRoot.addChild(containerText)

      const containerSvg = new PIXI.Container()
      containerSvg.name = 'containerSvg'
      containerRoot.addChild(containerSvg)

      const containerImage = new PIXI.Container()
      containerRoot.addChild(containerImage)
    }

    containerRoot.patches = []

    var entity = manager.designData.inprint[designArea][0]
    if (!entity) {
      const defaultTexture = getDefaultTexture(designArea)
      entity = {
        index: 0,
        X: 0,
        Y: 0,
        ZV: 1,
        SV: 1,
        AV: 0,
        pixel: 72,
        texture: defaultTexture,
        textlist: [],
        imagelist: [],
        mirror: 1
      }
      store.commit('addPatch', {
        designArea,
        entity
      })
    }
    const path = getTexturePath(entity.texture)
    const panel = new PIXI.Container()
    panel.x = manager.output / 2
    panel.y = manager.output / 2
    panel.pivot.x = manager.output / 2
    panel.pivot.y = manager.output / 2
    containerRoot.getChildAt(0).addChild(panel)

    var texture = await loadTexture(path, entity.texture)
    const tilingSprite = new PIXI.TilingSprite(
      texture,
      manager.output * 1.25,
      manager.output * 1.25
    )

    tilingSprite._type = 'gift'
    tilingSprite.entity = entity
    tilingSprite.x = manager.output / 2
    tilingSprite.y = manager.output / 2
    tilingSprite.uvRespectAnchor = true
    tilingSprite.anchor.set(0.5)

    manager.setPatchTextureRealSize({
      patch: tilingSprite,
      texture: texture,
      realSizeY: texture.origHeight / 72 * 2.54,
      pixel: entity.pixel,
      SV: entity.SV,
      designArea
    })
    tilingSprite.tilePosition.x = (-entity.X + 0.5) * texture.orig.width * tilingSprite.tileScale.x
    tilingSprite.tilePosition.y = (entity.Y - 0.5) * texture.orig.height * tilingSprite.tileScale.y

    // mask
    const designid = manager.designData.designid
    let maskName = ''
    if (designid) {
      maskName = manager.product['svg_' + designid][designArea]
    } else {
      maskName = manager.product.svg[designArea]
    }
    if (maskName && maskName !== '') {
      // console.log('maskName', maskName)
      var maskTex = await loadResource(require('@/assets/svg/' + maskName), maskName)
      var mask = new PIXI.Sprite(maskTex)
      mask.anchor.set(0.5)
      mask.x = maskTex.width / 2
      mask.y = maskTex.height / 2
      if (maskName === 'hat04_uv_sleeve_.svg') {
        mask.angle = 180
      }
      panel.addChild(mask)
      tilingSprite.mask = mask
    }

    panel.addChild(tilingSprite)

    tilingSprite.interactive = true
    tilingSprite.on('pointerdown', downPatch)
      .on('pointerup', upPatch)
      .on('pointerupoutside', upPatch)
      .on('pointermove', movePatch)

    containerRoot.patch = tilingSprite
  },

  rotate: function (val) {
    // console.log('umb rotate', val)
    update()
  },

  zoom: function (val) {
    manager.selectedBG.entity.ZV = val
    manager.getImageQuality(manager.selectedBG)
    update()
  },

  endRotate: function () {
    // console.log('umb end rotate')
    manager.saveDesign()
  },

  endZoom: function () {
    // console.log('umb end zoom')
    manager.saveDesign()
  },

  rotateContainer (index) {
    const rotation = 360 / 6 * index
    manager.getOrCreateContainer(manager.designArea).angle = rotation
  }
}
