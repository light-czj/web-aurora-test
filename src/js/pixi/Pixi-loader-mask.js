// 加载2d口罩
import * as PIXI from 'pixi.js'
import { getDefaultTexture, getTexturePath, loadTexture, loadResource } from './Pixi-loader-texture'
import store from '@/store'

let manager = null
let containerRoot = null
let selected = null

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

    containerRoot.patches = []

    var entity = manager.designData.inprint.umb[0]
    if (!entity) {
      const defaultTexture = getDefaultTexture('umb')
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
        designArea: 'umb',
        entity
      })
    }
    const path = getTexturePath(entity.texture)
    const panel = new PIXI.Container()
    panel.x = manager.output / 2
    panel.y = manager.output / 2
    panel.pivot.x = manager.output / 2
    panel.pivot.y = manager.output / 2
    container.addChild(panel)

    var texture = await loadTexture(path, entity.texture)
    const tilingSprite = new PIXI.TilingSprite(
      texture,
      manager.output,
      manager.output
    )

    tilingSprite._type = 'mask'
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
      designArea: 'umb'
    })
    tilingSprite.tilePosition.x = (-entity.X + 0.5) * texture.orig.width * tilingSprite.tileScale.x
    tilingSprite.tilePosition.y = (entity.Y - 0.5) * texture.orig.height * tilingSprite.tileScale.y

    // mask
    const maskName = manager.product.svg[manager.designArea]
    if (maskName && maskName !== '') {
      // console.log('mask=', maskName)
      var maskTex = await loadResource(require('@/assets/svg/' + maskName + '.svg'), maskName)
      var mask = new PIXI.Sprite(maskTex)
      mask.anchor.set(0.5)
      mask.x = maskTex.width / 2
      mask.y = maskTex.height / 2
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
    // console.log('umb zoom', val)
    update()
  },

  endRotate: function () {
    // console.log('umb end rotate')
    manager.saveDesign()
  },

  endZoom: function () {
    // console.log('umb end zoom')
    manager.saveDesign()
  }
}
