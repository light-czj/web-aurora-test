// 加载2d口罩
import * as PIXI from 'pixi.js'
import { getDefaultTexture, getTexturePath, loadTexture } from './Pixi-loader-texture'
import store from '@/store'

let manager = null
let containerRoot = null
let edge = null
let selected = null

function downPatch (event) {
  selected = this
  this.dragging = false
  manager.downItemBefore()

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

function movePatch () {
  if (selected !== this) return
  if (!this.entity.dirty) return
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

function update () {
  if (!manager.selected.entity.dirty) return
  manager.selected.angle = store.state.ui.rotation
  manager.selected.entity.ZV = store.state.ui.zoom
  manager.selected.entity.AV = store.state.ui.rotation
  var newScale = manager.selected.entity.ZV * manager.selected.entity.SV * manager.output / 1024
  const deltaX = manager.selected.tilePosition.x / manager.selected.tileScale.x * (newScale - manager.selected.tileScale.x)
  const deltaY = manager.selected.tilePosition.y / manager.selected.tileScale.y * (newScale - manager.selected.tileScale.y)
  manager.selected.tilePosition.x += deltaX * manager.selected.entity.mirror
  manager.selected.tilePosition.y += deltaY
  manager.selected.tileScale.set(newScale * manager.selected.entity.mirror, newScale)
}

async function createScarfPatch (w, h, e, type, isEdge, index) {
  var entity = manager.designData.inprint.umb[index]
  if (!isEdge && !entity) {
    const defaultTexture = getDefaultTexture('umb', index)
    entity = {
      index: index,
      X: 0,
      Y: 0,
      ZV: 1,
      SV: 1,
      AV: 0,
      pixel: 72,
      texture: defaultTexture,
      textlist: [],
      imagelist: [],
      mirror: 1,
      dirty: false
    }
    store.commit('addPatch', {
      designArea: 'umb',
      entity
    })
  }
  const panel = new PIXI.Container()
  panel.x = manager.output / 2
  panel.y = manager.output / 2
  panel.pivot.x = manager.output / 2
  panel.pivot.y = manager.output / 2
  containerRoot.getChildAt(0).addChild(panel)

  var texture = null
  if (isEdge) {
    // const path = getTexturePath('color~000')
    // texture = await loadTexture(path, 'color~000')
    texture = PIXI.Texture.from(require('@/assets/images/white.png'))
  } else {
    const path = getTexturePath(entity.texture)
    texture = await loadTexture(path, entity.texture)
  }
  const tilingSprite = new PIXI.TilingSprite(
    texture,
    manager.output * 1.5,
    manager.output * 1.5
  )
  tilingSprite.designArea = 'umb'
  if (isEdge) {
    manager.designData.edgeColor = '#000000'
    tilingSprite.tint = manager.designData.edgeColor.replace('#', '0x')
    edge = tilingSprite
  }

  var mask = new PIXI.Graphics()
  panel.addChild(mask)
  mask.beginFill(0x8bc5ff, 0.4)
  mask.drawScarfPatch(manager.output / 2, manager.output / 2, w, h, e, type, isEdge, index)
  mask.endFill()

  tilingSprite._type = 'scarf'
  tilingSprite.entity = entity
  tilingSprite.mask = mask
  tilingSprite.x = manager.output / 2
  tilingSprite.y = manager.output / 2
  tilingSprite.uvRespectAnchor = true
  tilingSprite.anchor.set(0.5)
  if (!isEdge) {
    manager.setPatchTextureRealSize({
      patch: tilingSprite,
      texture: texture,
      realSizeY: texture.origHeight / 72 * 2.54,
      pixel: entity.pixel,
      SV: entity.SV,
      designArea: 'umb'
    })
  }
  if (entity) {
    tilingSprite.tilePosition.x = (-entity.X + 0.5) * texture.orig.width * tilingSprite.tileScale.x
    tilingSprite.tilePosition.y = (entity.Y - 0.5) * texture.orig.height * tilingSprite.tileScale.y
  }

  panel.addChild(tilingSprite)

  if (!isEdge) {
    tilingSprite.interactive = true
    tilingSprite.on('pointerdown', downPatch)
      .on('pointerup', upPatch)
      .on('pointerupoutside', upPatch)
      .on('pointermove', movePatch)

    if (index === 0) {
      containerRoot.patch = tilingSprite
    }
  }
}

PIXI.Graphics.prototype.drawScarfPatch = function drawScarfPatch (x, y, w, h, e, type, isEdge, index) {
  return this.drawPolygon(
    new ShapeScarfPatch(x, y, w, h, e, type, isEdge, index)
  )
}

var ShapeScarfPatch = /* @__PURE__ */(function (Polygon) {
  function ScarfPatch (x, y, w, h, e, type, isEdge, index) {
    e *= 2
    var polygon = []
    if (isEdge) {
      polygon.push(x + w / 2, y + h / 2)
      polygon.push(x + w / 2, y - h / 2)
      polygon.push(x - w / 2, y - h / 2)
      polygon.push(x - w / 2, y + h / 2)
    } else {
      if (type === '1' || type === '1e') {
        polygon.push(x + (w - e) / 2, y + (h - e) / 2)
        polygon.push(x + (w - e) / 2, y - (h - e) / 2)
        polygon.push(x - (w - e) / 2, y - (h - e) / 2)
        polygon.push(x - (w - e) / 2, y + (h - e) / 2)
      } else if (type === '2' || type === '2e') {
        if (index === 0) {
          polygon.push(x - (w - e) / 2, y - (h - e) / 2)
          polygon.push(x + (w - e) / 2, y - (h - e) / 2)
          polygon.push(x - (w - e) / 2, y + (h - e) / 2)
        } else {
          polygon.push(x + (w - e) / 2, y - (h - e) / 2)
          polygon.push(x + (w - e) / 2, y + (h - e) / 2)
          polygon.push(x - (w - e) / 2, y + (h - e) / 2)
        }
      } else if (type === '3' || type === '3e') {
        if (index === 0) {
          polygon.push(x - (w - e) / 2, y - (h - e) / 2)
          polygon.push(x, y - (h - e) / 2)
          polygon.push(x, y + (h - e) / 2)
          polygon.push(x - (w - e) / 2, y + (h - e) / 2)
        } else {
          polygon.push(x, y - (h - e) / 2)
          polygon.push(x + (w - e) / 2, y - (h - e) / 2)
          polygon.push(x + (w - e) / 2, y + (h - e) / 2)
          polygon.push(x, y + (h - e) / 2)
        }
      } else if (type === '4' || type === '4e') {
        if (index === 0) {
          polygon.push(x - (w - e) / 2, y)
          polygon.push(x + (w - e) / 2, y)
          polygon.push(x + (w - e) / 2, y - (h - e) / 2)
          polygon.push(x - (w - e) / 2, y - (h - e) / 2)
        } else {
          polygon.push(x - (w - e) / 2, y + (h - e) / 2)
          polygon.push(x + (w - e) / 2, y + (h - e) / 2)
          polygon.push(x + (w - e) / 2, y)
          polygon.push(x - (w - e) / 2, y)
        }
      }
    }
    Polygon.call(this, polygon)
  }

  if (Polygon) {
    // eslint-disable-next-line no-proto
    ScarfPatch.__proto__ = Polygon
  }
  ScarfPatch.prototype = Object.create(Polygon && Polygon.prototype)
  ScarfPatch.prototype.varructor = ScarfPatch

  return ScarfPatch
}(PIXI.Polygon))

function loadHole (width, height, containerHole) {
  const rectAndHole = new PIXI.Graphics()

  rectAndHole.beginFill(0x888888)
  rectAndHole.drawRect(0, 0, manager.output, manager.output)
  rectAndHole.beginHole()
  rectAndHole.drawRect(manager.output * 0.5 - width * 0.5, manager.output * 0.5 - height * 0.5, width, height)
  rectAndHole.endHole()
  rectAndHole.endFill()
  console.log(rectAndHole)

  containerHole.addChild(rectAndHole)
  manager.scarfMask = rectAndHole
}

export default {
  load: async function (ma) {
    manager = ma
    containerRoot = manager.getOrCreateContainer('umb')
    containerRoot.tillingList = []

    const container = new PIXI.Container()
    containerRoot.addChild(container)

    const containerText = new PIXI.Container()
    containerRoot.addChild(containerText)

    const containerSvg = new PIXI.Container()
    containerRoot.addChild(containerSvg)

    const containerImage = new PIXI.Container()
    containerRoot.addChild(containerImage)

    await manager.loadItems('umb', containerText)

    const designid = manager.designData.designid
    var width = manager.output
    var height = manager.output
    var edge = 0
    // var type1 = designid.substring(0, 1)
    var type2 = designid.substring(1)
    if (type2.indexOf('e') > -1) {
      edge = (2 / manager.product.edge) * manager.output
    } else {
      edge = 0
    }
    width = manager.product.ratio * manager.output
    height = manager.output
    // 生成边
    if (manager.designData.designid.indexOf('e') > -1) {
      await createScarfPatch(width, height, edge, type2, true)
    }
    // 生成中间部分
    await createScarfPatch(width, height, edge, type2, false, 0)
    if (!type2.startsWith('1')) {
      await createScarfPatch(width, height, edge, type2, false, 1)
    }
    // 生成遮罩
    loadHole(width, height, containerSvg)
  },

  rotate: function (val) {
    // console.log('scarf rotate', val)
    update()
  },

  zoom: function (val) {
    // console.log('scarf zoom', val)
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

  changeEdgeColor: function (val) {
    console.log('changeEdgeColor', val)
    store.commit('setEdgeColor', val)
    if (edge) {
      edge.tint = val.replace('#', '0x')
    }
  },

  getLastColor () {
    console.log('edge.tint', edge.tint)
    store.state.design.shareuc.lastColor = edge.tint.replace('0x', '#')
  }
}
