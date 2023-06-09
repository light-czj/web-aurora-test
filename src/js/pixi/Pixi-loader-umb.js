// 加载2d伞片
import * as PIXI from 'pixi.js'
import {
  getDefaultTexture,
  getTexturePath,
  loadTexture,
  loadResource,
  loadResources
} from './Pixi-loader-texture'
import store from '@/store'

let manager = null
let selected = null

function downPatch (event) {
  if (!manager.canDrag) return
  selected = this
  this.dragging = false
  manager.downItemBefore()

  manager.select(this)
  this.data = event.data
  const newPosition = this.data.getLocalPosition(this.parent)
  this._posPreX = newPosition.x
  this._posPreY = newPosition.y
  // 旋转片
  if (manager.designArea === 'umb' && manager.designData.ptype === 'umb') {
    var designid = manager.designData.designid
    var rotation = 0
    switch (designid) {
      case '8aa':
      case '8bb':
      case '8ab':
      case '8aw':
      case '6ab':
      case '6aa':
      case '6bb':
      case '6aw':
      case '7aw':
        rotation = -180
        break
      case '8ab2':
      case '8a4':
      case '8b4':
      case '8abcd':
        rotation = -90 * this.entity.index
        break
      case '6a3':
      case '6abc':
        rotation = -120 * this.entity.index
        break
      case '7abc':
      case '7abb':
      case '7ab2':
        // 2 5
        rotation = (-360 / 7) * ((this.entity.index - 1) * 3 + 2)
        break
      default:
        rotation = (-360 / manager.product.ks) * this.entity.index
        break
    }
    if (this.entity.index === 0) {
      rotation = 0
    }
    manager.getOrCreateContainer(manager.designArea).angle = rotation
  }
  this.startX = this.entity.X
  this.startY = this.entity.Y
  this.startx = this.tilePosition.x
  this.starty = this.tilePosition.y
  // console.log('downPatch ', this.startX, this.startY, this.startx, this.starty)
  manager.downItem()
}

function upPatch () {
  if (selected !== this) return
  selected = null
  if (!this.dragging) return
  if (!manager.canDrag) return
  this.data = null
  var X = 0
  var Y = 0
  X = (-(this.tilePosition.x / (this.texture.orig.width * this.tileScale.x) - 0.5)).toFixed(6)
  Y = (this.tilePosition.y / (this.texture.orig.height * this.tileScale.y) - 0.5).toFixed(6)
  this.entity.X = X
  this.entity.Y = Y
  if (manager.designData.designArea === 'umb') {
    manager
      .getOrCreateContainer(manager.designArea)
      .tillingList.forEach(item => {
        if (
          item._tag !==
          manager.getOrCreateContainer(manager.designArea).patch._tag
        ) {
          return
        }
        item.entity.X = X
        item.entity.Y = Y
      })
  }
  manager.saveDesign()
}

function movePatch () {
  if (selected !== this) return
  if (!manager.canDrag) return
  this.dragging = true
  const newPosition = this.data.getLocalPosition(this.parent)
  this._deltaX = newPosition.x - this._posPreX
  this._deltaY = newPosition.y - this._posPreY
  const changex =
    this._deltaX * Math.cos(this.rotation) +
    this._deltaY * Math.sin(this.rotation)
  const changey =
    -this._deltaX * Math.sin(this.rotation) +
    this._deltaY * Math.cos(this.rotation)
  this.tilePosition.x += changex
  this.tilePosition.y += changey
  this.tilePosition.x %=
    this.texture.orig.width * this.tileScale.x * this.entity.mirror
  this.tilePosition.y %= this.texture.orig.height * this.tileScale.y
  this._posPreX = newPosition.x
  this._posPreY = newPosition.y
  if (manager.designData.designArea === 'umb') {
    manager
      .getOrCreateContainer(manager.designArea)
      .tillingList.forEach(function (item) {
        if (item._index === manager.selectedBG._index) return
        if (item._tag !== manager.selectedBG._tag) return
        item.tilePosition.x += changex * item.entity.mirror
        item.tilePosition.y += changey
        item.tilePosition.x %= item.texture.orig.width * item.tileScale.x
        item.tilePosition.y %= item.texture.orig.height * item.tileScale.y
      })
  }
}

var ShapeUmb = /* @__PURE__ */ (function (Polygon) {
  function Umb (x, y, kNumber, radius) {
    var PI_2 = Math.PI * 2
    const rotationFix = kNumber % 2 === 0 ? Math.PI / kNumber : 0
    var UmbtAngle = (-1 * Math.PI) / 2 + rotationFix
    var delta = PI_2 / kNumber
    var polygon = []
    for (var i = 0; i < kNumber; i++) {
      var angle = i * delta + UmbtAngle
      polygon.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
    }
    Polygon.call(this, polygon)
  }
  if (Polygon) {
    // eslint-disable-next-line no-unused-vars,no-proto
    Umb.__proto__ = Polygon
  }
  Umb.prototype = Object.create(Polygon && Polygon.prototype)
  Umb.prototype.varructor = Umb

  return Umb
})(PIXI.Polygon)

PIXI.Graphics.prototype.drawUmbPatch = function drawUmbPatch (
  x,
  y,
  kNumber,
  radius,
  panelNumbers
) {
  if (panelNumbers >= kNumber) {
    return this.drawPolygon(new ShapeUmb(x, y, kNumber, radius))
  } else {
    return this.drawPolygon(
      new ShapeUmbPatch(x, y, kNumber, radius, panelNumbers)
    )
  }
}

var ShapeUmbPatch = /* @__PURE__ */ (function (Polygon) {
  function UmbPatch (x, y, kNumber, radius, panelNumbers) {
    if (panelNumbers > kNumber) {
      console.log('panelNumbers should be no larger than kNumber')
      return
    }
    var PI_2 = Math.PI * 2

    var delta = PI_2 / kNumber
    var startAngle = Math.PI / 2 - (delta * panelNumbers) / 2
    var polygon = []

    polygon.push(x, y)

    for (var i = 0; i < panelNumbers + 1; i++) {
      var angle = i * delta + startAngle

      polygon.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
    }

    Polygon.call(this, polygon)
  }

  if (Polygon) {
    // eslint-disable-next-line no-proto
    UmbPatch.__proto__ = Polygon
  }
  UmbPatch.prototype = Object.create(Polygon && Polygon.prototype)
  UmbPatch.prototype.varructor = UmbPatch

  return UmbPatch
})(PIXI.Polygon)

// 生成单个伞片
async function addUmbPatch (
  containerRoot,
  panelNumbers,
  kNumber,
  rotation,
  index,
  tag = 0
) {
  // console.log('addUmbPatch', panelNumbers)
  var entity = manager.designData.inprint.umb[index]
  if (!entity) {
    const defaultTexture = getDefaultTexture('umb')
    entity = {
      index: index,
      X: 0,
      Y: 0,
      ZV: 1,
      SV: 0,
      AV: 0,
      texture: defaultTexture,
      textlist: [],
      imagelist: [],
      pixel: 72,
      mirror: 1
    }
    store.commit('addPatch', {
      designArea: 'umb',
      entity
    })
  }
  const path = getTexturePath(entity.texture)

  // 镜像
  if (manager.designData.designid === '8b8') {
    entity.mirror = index % 2 === 1 ? -1 : 1
  }

  var panel = new PIXI.Container()
  panel.x = manager.output / 2
  panel.y = manager.output / 2
  panel.pivot.x = manager.output / 2
  panel.pivot.y = manager.output / 2
  panel.rotation = rotation
  containerRoot.getChildAt(0).addChild(panel)
  var mask = new PIXI.Graphics()
  mask.beginFill(0x8bc5ff, 0.4)
  mask.drawUmbPatch(
    manager.output / 2,
    manager.output / 2,
    kNumber,
    (manager.output / 2) * 0.98,
    panelNumbers
  )
  mask.endFill()
  panel.addChild(mask)

  var texture = await loadTexture(path, entity.texture)
  var tilingSprite = new PIXI.TilingSprite(
    texture,
    manager.output,
    manager.output
  )
  tilingSprite.entity = entity
  tilingSprite._tag = tag
  tilingSprite._index = index
  tilingSprite._type = 'umb'
  tilingSprite.mask = mask
  tilingSprite.x = manager.output / 2
  tilingSprite.y = manager.output / 2
  tilingSprite.uvRespectAnchor = true
  tilingSprite.anchor.set(0.5)
  tilingSprite.angle = entity.AV
  panel.addChild(tilingSprite)

  if (entity.texture.indexOf('color~') > -1) {
    tilingSprite.tint = entity.texture.replace('color~', '0x')
  }
  manager.setPatchTextureRealSize({
    patch: tilingSprite,
    texture: texture,
    realSizeY: (texture.origHeight / entity.pixel) * 2.54,
    pixel: entity.pixel,
    SV: entity.SV,
    designArea: 'umb'
  })
  tilingSprite.tilePosition.x =
    (-entity.X + 0.5) * texture.orig.width * tilingSprite.tileScale.x
  tilingSprite.tilePosition.y =
    (entity.Y - 0.5) * texture.orig.height * tilingSprite.tileScale.y

  tilingSprite.interactive = true
  tilingSprite
    .on('pointerdown', downPatch)
    .on('pointerup', upPatch)
    .on('pointerupoutside', upPatch)
    .on('pointermove', movePatch)

  if (index === 0) {
    containerRoot.patch = tilingSprite
  }

  return tilingSprite
}

function update () {
  manager.selected.angle = store.state.ui.rotation
  manager.selected.entity.ZV = store.state.ui.zoom
  manager.selected.entity.AV = store.state.ui.rotation
  var newScale =
    (manager.selected.entity.ZV * manager.selected.entity.SV * manager.output) /
    1024
  const deltaX =
    (manager.selected.tilePosition.x / manager.selected.tileScale.x) *
    (newScale - manager.selected.tileScale.x)
  const deltaY =
    (manager.selected.tilePosition.y / manager.selected.tileScale.y) *
    (newScale - manager.selected.tileScale.y)
  manager.selected.tilePosition.x += deltaX * manager.selected.entity.mirror
  manager.selected.tilePosition.y += deltaY
  manager.selected.tileScale.set(
    newScale * manager.selected.entity.mirror,
    newScale
  )

  if (manager.designArea === 'umb') {
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
}

async function loadLayer (container, designArea) {
  if (!manager.product.layer) return
  const layerName = manager.product.layer[designArea]
  if (typeof layerName !== 'undefined' && layerName !== '') {
    var tex = await loadResource(
      require('@/assets/svg/' + layerName),
      layerName
    )
    var sprite = new PIXI.Sprite(tex)
    sprite.anchor.set(0.5)
    sprite.x = manager.output / 2
    sprite.y = manager.output / 2
    let scale = 1
    if (layerName === 'guide_6.svg') {
      scale = 0.98
    }
    sprite.scale.set(manager.output / sprite.height * scale)
    // sprite.alpha = 0.5
    container.addChild(sprite)
  }
}

async function loadPatch (type) {
  const containerRoot = manager.getOrCreateContainer(type)

  const container = new PIXI.Container()
  containerRoot.addChild(container)

  const containerText = new PIXI.Container()
  containerRoot.addChild(containerText)

  const containerSvg = new PIXI.Container()
  containerRoot.addChild(containerSvg)

  const containerImage = new PIXI.Container()
  containerRoot.addChild(containerImage)

  containerRoot.tillingList = []
  containerRoot.patch = null

  if (type === 'umb') {
    await Promise.all([loadLayer(containerSvg, type), loadPatchUmb(containerRoot, type)])
  } else {
    await Promise.all([loadLayer(containerSvg, type), loadPatchOther(containerRoot, type)])
  }
  await manager.loadItems(type, containerRoot)
}

async function loadPatchUmb (containerRoot, type) {
  switch (manager.designData.designid) {
    case '12w':
      await addUmbPatch(containerRoot, 12, 12, 0, 0)
      break
    case '12a':
      for (let i = 0; i < 12; i++) {
        await addUmbPatch(containerRoot, 1, 12, (Math.PI / 6) * i, i, 0)
      }
      break
    case '6a3':
      for (let i = 0; i < 3; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(
            containerRoot,
            2,
            6,
            (Math.PI / 180) * 120 * i,
            i,
            0
          )
        )
      }
      break
    case '6abc':
      for (let i = 0; i < 3; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(
            containerRoot,
            2,
            6,
            (Math.PI / 180) * 120 * i,
            i,
            i
          )
        )
      }
      break
    case '6abc2':
      for (let i = 0; i < 6; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 6, (Math.PI / 3) * i, i, i % 3)
        )
      }
      break
    case '6a6':
      for (let i = 0; i < 6; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 6, (Math.PI / 3) * i, i, 0)
        )
      }
      break
    case '6s':
    case '6a':
      for (let i = 0; i < 6; i++) {
        await addUmbPatch(containerRoot, 1, 6, (Math.PI / 3) * i, i, 0)
      }
      break
    case '6w':
      await addUmbPatch(containerRoot, 6, 6, 0, 0)
      break
    case '6ab':
      await addUmbPatch(containerRoot, 3, 6, 0, 0, 0)
      await addUmbPatch(containerRoot, 3, 6, Math.PI, 1, 1)
      break
    case '6aa':
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 3, 6, 0, 0, 0)
      )
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 3, 6, Math.PI, 1, 0)
      )
      break
    case '6bb':
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 3, 6, 0, 0, 0)
      )
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 3, 6, Math.PI, 1, 0)
      )
      break
    case '6ab3':
      for (let i = 0; i < 6; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 6, (Math.PI / 3) * i, i, i % 3)
        )
      }
      break
    case '6aw':
      await addUmbPatch(containerRoot, 1, 6, 0, 0, 0)
      await addUmbPatch(containerRoot, 5, 6, Math.PI, 1, 1)
      break
    case '8a8':
      for (let i = 0; i < 8; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 8, (Math.PI / 4) * i, i)
        )
      }
      break
    case '8b8':
      for (let i = 0; i < 8; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 8, (Math.PI / 4) * i, i)
        )
      }
      break
    case '8s':
      for (let i = 0; i < 8; i++) {
        await addUmbPatch(containerRoot, 1, 8, (Math.PI / 4) * i, i, i)
      }
      break
    case '8abcd2':
      for (let i = 0; i < 8; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 8, (Math.PI / 4) * i, i, i % 4)
        )
      }
      break
    case '8a':
      for (let i = 0; i < 8; i++) {
        await addUmbPatch(containerRoot, 1, 8, (Math.PI / 4) * i, i, 0)
      }
      break
    case '8w':
      await addUmbPatch(containerRoot, 8, 8, 0, 0)
      break
    case '8aw':
      await addUmbPatch(containerRoot, 1, 8, 0, 0)
      await addUmbPatch(containerRoot, 7, 8, (Math.PI / 4) * 4, 1)
      break
    case '8aa':
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 4, 8, 0, 0, 0)
      )
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 4, 8, (Math.PI / 4) * 4, 1, 0)
      )
      break
    case '8ab':
      await addUmbPatch(containerRoot, 4, 8, 0, 0)
      await addUmbPatch(containerRoot, 4, 8, (Math.PI / 4) * 4, 1)
      break
    case '8bb':
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 4, 8, 0, 0, 0)
      )
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 4, 8, (Math.PI / 4) * 4, 1, 0)
      )
      break
    case '8b4':
      for (let i = 0; i < 4; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 2, 8, (Math.PI / 2) * i, i, 0)
        )
      }
      break
    case '8a4':
      for (let i = 0; i < 4; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 2, 8, (Math.PI / 2) * i, i, 0)
        )
      }
      break
    case '8ab4':
      for (let i = 0; i < 8; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 1, 8, (Math.PI / 4) * i, i, i % 2)
        )
      }
      break
    case '8ab2':
      for (let i = 0; i < 4; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 2, 8, (Math.PI / 2) * i, i, i % 2)
        )
      }
      break
    case '8abcd':
      for (let i = 0; i < 4; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(containerRoot, 2, 8, (Math.PI / 2) * i, i, i)
        )
      }
      break
    case '7w':
      await addUmbPatch(containerRoot, 7, 7, 0, 0)
      break
    case '7aw':
      await addUmbPatch(containerRoot, 1, 7, 0, 0)
      await addUmbPatch(containerRoot, 6, 7, Math.PI, 1)
      break
    case '7abc':
      await addUmbPatch(containerRoot, 1, 7, 0, 0)
      await addUmbPatch(
        containerRoot,
        3,
        7,
        (((Math.PI / 180) * 360) / 7) * 2,
        1
      )
      await addUmbPatch(
        containerRoot,
        3,
        7,
        (((Math.PI / 180) * 360) / 7) * 5,
        2
      )
      break
    case '7ab2':
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 1, 7, 0, 0, 0)
      )
      containerRoot.tillingList.push(
        await addUmbPatch(
          containerRoot,
          3,
          7,
          (((Math.PI / 180) * 360) / 7) * 2,
          1,
          1
        )
      )
      containerRoot.tillingList.push(
        await addUmbPatch(
          containerRoot,
          3,
          7,
          (((Math.PI / 180) * 360) / 7) * 5,
          2,
          1
        )
      )
      break
    case '7abb':
      containerRoot.tillingList.push(
        await addUmbPatch(containerRoot, 1, 7, 0, 0, 0)
      )
      containerRoot.tillingList.push(
        await addUmbPatch(
          containerRoot,
          3,
          7,
          (((Math.PI / 180) * 360) / 7) * 2,
          1,
          1
        )
      )
      containerRoot.tillingList.push(
        await addUmbPatch(
          containerRoot,
          3,
          7,
          (((Math.PI / 180) * 360) / 7) * 5,
          2,
          1
        )
      )
      break
    case '7a7':
      for (let i = 0; i < 7; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(
            containerRoot,
            1,
            7,
            (((Math.PI / 180) * 360) / 7) * i,
            i,
            0
          )
        )
      }
      break
    case '7s':
      for (let i = 0; i < 7; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(
            containerRoot,
            1,
            7,
            (((Math.PI / 180) * 360) / 7) * i,
            i,
            i
          )
        )
      }
      break
    case '5w':
      await addUmbPatch(containerRoot, 5, 5, 0, 0, 0)
      break
    case '5a5':
      for (let i = 0; i < 5; i++) {
        containerRoot.tillingList.push(
          await addUmbPatch(
            containerRoot,
            1,
            5,
            (((Math.PI / 180) * 360) / 5) * i,
            i
          )
        )
      }
      break
    default:
      break
  }
}

async function loadPatchOther (containerRoot, type) {
  const svg = manager.product.svg[type]
  var entity = manager.designData.inprint[type][0]
  if (typeof entity === 'undefined') {
    const defaultTexture = getDefaultTexture(type)
    entity = {
      index: 0,
      X: 0,
      Y: 0,
      ZV: 1,
      SV: 0,
      AV: 0,
      texture: defaultTexture,
      textlist: [],
      imagelist: [],
      pixel: 72,
      mirror: 1
    }
    store.commit('addPatch', {
      designArea: type,
      entity: entity
    })
  }
  const path = getTexturePath(entity.texture)
  var panel = new PIXI.Container()
  panel.x = manager.output / 2
  panel.y = manager.output / 2
  panel.pivot.x = manager.output / 2
  panel.pivot.y = manager.output / 2
  containerRoot.getChildAt(0).addChild(panel)
  var texture = await loadTexture(path, entity.texture)
  var tilingSprite = new PIXI.TilingSprite(
    texture,
    manager.output * 1.5,
    manager.output * 1.5
  )
  containerRoot.patch = tilingSprite
  tilingSprite.entity = entity
  tilingSprite._type = 'umb'
  tilingSprite.uvRespectAnchor = true
  tilingSprite.x = manager.output / 2
  tilingSprite.y = manager.output / 2
  tilingSprite.anchor.set(0.5)
  panel.addChild(tilingSprite)

  if (entity.texture.indexOf('color~') > -1) {
    tilingSprite.tint = entity.texture.replace('color~', '0x')
  }
  manager.setPatchTextureRealSize({
    patch: tilingSprite,
    texture: texture,
    realSizeY: (texture.origHeight / 72) * 2.54,
    pixel: entity.pixel,
    designArea: type,
    SV: entity.SV
  })

  tilingSprite.interactive = true
  tilingSprite
    .on('pointerdown', downPatch)
    .on('pointerup', upPatch)
    .on('pointerupoutside', upPatch)
    .on('pointermove', movePatch)

  var maskTex = await loadResource(require('@/assets/svg/' + svg), svg)
  var mask = new PIXI.Sprite(maskTex)
  mask.anchor.set(0.5)
  mask.x = maskTex.width / 2
  mask.y = maskTex.height / 2
  panel.addChild(mask)
  tilingSprite.mask = mask
}

export default {
  load: async function (ma) {
    manager = ma
    const product = manager.product
    // 加载资源
    const list = []
    for (var key in product.svg) {
      list.push({
        src: require('@/assets/svg/' + product.svg[key]),
        name: product.svg[key]
      })
    }
    // eslint-disable-next-line no-redeclare
    for (var key in product.layer) {
      list.push({
        src: require('@/assets/svg/' + product.layer[key]),
        name: product.layer[key]
      })
    }
    await loadResources(list)
    for (let i = 0; i < product.designArea.length; i++) {
      const type = product.designArea[i]
      await loadPatch(type)
    }
  },

  rotate: function (val) {
    // console.log('umb rotate', val)
    store.state.ui.rotation = val
    update()
  },

  zoom: function (val) {
    // console.log('umb zoom', val)
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
  }
}
