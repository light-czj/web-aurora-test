import * as PIXI from 'pixi.js'
import store from '@/store'
import utils from '@/js/utils'
import localForage from '@/js/localForage'

let manager = null

let textToolScale = 1

let lastPos = {
  x: 0,
  y: 0
}

function getContainerRotation () {
  var designid = manager.designData.designid
  var offset = 0
  if (['6a3', '6abc'].includes(designid)) {
    offset = 30
  }
  if (['8ab', '8bb', '8aa', '8ab2', '8abcd', '8b4', '8a4'].includes(designid)) {
    offset = 22.5
  }
  return offset
}

function setTextEntity (text) {
  if (text) {
    text.entity.rotationX = -text.parent.angle - text.angle + 90
    text.entity.positionX = (
      (text.parent.x - manager.output * 0.5) /
      manager.output
    ).toFixed(6)
    text.entity.positionY = -(
      (text.parent.y - manager.output * 0.5) /
      manager.output
    ).toFixed(6)
    text.entity.size = text.parent.scale.x
    text.entity.sizeX = (
      (text.width * text.parent.scale.x) /
      manager.output
    ).toFixed(6)
    text.entity.sizeY = (
      (text.height * text.parent.scale.x) /
      manager.output
    ).toFixed(6)
  }
}

function downZoom (event) {
  this.data = event.data
  this.parent.status = 3
  if (store.state.ui.os.isPC && !store.state.ui.os.isPad) {
    this.parent.startPos = {
      x: this.data.originalEvent.clientX,
      y: this.data.originalEvent.clientY
    }
  } else {
    this.parent.startPos = {
      x: this.data.originalEvent.changedTouches[0].clientX,
      y: this.data.originalEvent.changedTouches[0].clientY
    }
  }
  this.parent.startZoom = this.parent.parent.scale.x
}

function upZoom () {
  this.data = null
  if (this.parent.status !== 3) return
  this.parent.status = 0
  store.state.ui.zoom = this.parent.parent.scale.x
  setTextEntity(manager.selected)
  manager.saveDesign()
}

function moveZoom () {
  if (this.data == null) return
  if (this.parent.status === 3) {
    var dis = 0
    if (store.state.ui.os.isPC && !store.state.ui.os.isPad) {
      dis = this.data.originalEvent.clientX - this.parent.startPos.x
    } else {
      if (typeof this.data.originalEvent.changedTouches === 'undefined') return
      dis = this.data.originalEvent.changedTouches[0].clientX - this.parent.startPos.x
    }
    var result = this.parent.startZoom + dis * 0.02
    changeTextSize(result, false)
  }
}

function changeTextSize (result, setSlider = false) {
  const text = manager.selected
  var value = 1
  if (result < 0.2) {
    value = 0.2
  } else {
    value = result
  }
  const maxSize = manager.designData.ptype !== 'umb' ? 6 : 2
  if (value > maxSize) {
    value = maxSize
  }
  text.parent.scale.set(value)
  if (typeof text.btnremove.startValue === 'undefined') {
    text.btnremove.startValue = text.btnremove.scale.x
  }
  if (typeof text.bg.startValueX === 'undefined') {
    text.bg.startValueX = text.bg.scale.x
    text.bg.startValueY = text.bg.scale.y
  }
  // 红线框
  if (result < 1) {
    text.line.scale.set(1 / value)
    text.tool.scale.set(1 / value)
    text.bg.scale.set(text.bg.startValueX / value, text.bg.startValueY / value)
    text.btnremove.scale.set(text.btnremove.startValue)
    text.btnrotate.scale.set(text.btnremove.startValue)
    text.btnzoom.scale.set(text.btnremove.startValue)
  } else {
    text.line.scale.set(1)
    text.tool.scale.set(1)
    text.bg.scale.set(text.bg.startValueX, text.bg.startValueY)
    text.btnremove.scale.set(text.btnremove.startValue / value)
    text.btnrotate.scale.set(text.btnremove.startValue / value)
    text.btnzoom.scale.set(text.btnremove.startValue / value)
  }
  setTextEntity(text)
  if (setSlider) {
    store.state.ui.zoom = value
  }
}

function downRotate (event) {
  this.data = event.data
  this.parent.status = 2
  this.parent.startAngle = this.parent.parent.target.angle
  if (store.state.ui.os.isPC && !store.state.ui.os.isPad) {
    this.parent.startClientX = this.data.originalEvent.clientX
  } else {
    this.parent.startClientX = this.data.originalEvent.changedTouches[0].clientX
  }
}

function upRotate () {
  this.data = null
  if (this.parent.status !== 2) return
  this.parent.status = 0
  store.state.ui.rotation = ((this.parent.parent.target.angle + 90) % 360 + 360) % 360
  setTextEntity(manager.selected)
  manager.saveDesign()
}

function moveRotate () {
  if (this.data == null) return
  if (this.parent.status === 2) {
    var offset = 0
    if (store.state.ui.os.isPC && !store.state.ui.os.isPad) {
      offset = this.data.originalEvent.clientX - this.parent.startClientX
    } else {
      if (typeof this.data.originalEvent.changedTouches === 'undefined') return
      offset =
        this.data.originalEvent.changedTouches[0].clientX -
        this.parent.startClientX
    }
    var angle = this.parent.startAngle + offset
    this.parent.parent.target.angle = angle
    this.parent.parent.target.entity.rotationX = -this.parent.parent.target.parent.angle - this.parent.parent.target.angle + 90
  }
}

export default {
  async load (params) {
    if (store.state.ui.os.isPC && !store.state.ui.os.isPad) {
      textToolScale = 0.5
    } else {
      textToolScale = 1
    }
    manager = params.manager
    let entity = params.entity
    if (entity && !entity.visible) return
    let texture = null
    if (entity && entity.color !== '' && entity.color !== '#FFFFFF') {
      texture = await this.getTextureWithColor(entity.texture, entity.color)
      texture.origWidth = params.texture.origWidth
      texture.origHeight = params.texture.origHeight
    } else {
      texture = params.texture
    }
    const isRecover = entity !== null
    const designArea = manager.designArea
    let container = null
    if (params.container) {
      container = params.container
    } else {
      if (manager.designData.ptype === 'scarf') {
        container = manager.containers[designArea].getChildAt(1)
      } else {
        container = manager.containers[designArea]
      }
    }
    const output = manager.output
    var list = manager.designData.inprint[designArea][0].imagelist

    // 创建容器
    var content = new PIXI.Container()

    const sprite = PIXI.Sprite.from(texture)
    sprite.anchor.set(0.5)
    var w = 0
    var h = 0
    sprite.texture.baseTexture.setSize(
      (1024 * texture.origWidth) / texture.origHeight,
      1024
    )
    if (sprite.texture.origWidth < sprite.texture.origHeight) {
      w = (100 * sprite.texture.origWidth) / sprite.texture.origHeight
      h = 100
    } else {
      w = 100
      h = (100 * sprite.texture.origHeight) / sprite.texture.origWidth
    }
    // 考虑旋转
    var posX = 0
    var posY = 0
    if (designArea === 'umb') {
      posX =
        Math.cos(((-container.angle + 90) * Math.PI) / 180) *
        (0.4 * output - h / 2)
      posY =
        Math.sin(((-container.angle + 90) * Math.PI) / 180) *
        (0.4 * output - h / 2)
    }
    if (isRecover) {
      content.x = entity.positionX * output + output / 2
      content.y = -entity.positionY * output + output / 2
    } else {
      if (designArea !== 'umb' && manager.product.addLogo) {
        content.x = posX + output * 0.5
        content.y =
          posY +
          manager.product.addLogo[designArea].position.split(',')[1] * output +
          output * 0.5
      } else {
        content.x = posX + output * 0.5
        content.y = posY + output * 0.5
      }
    }
    sprite._type = 'image'

    if (!entity) {
      entity = {
        positionX: ((content.x - output / 2) / output).toFixed(6),
        positionY: ((-content.y + output / 2) / output).toFixed(6),
        texture: params.texName,
        color: '#FFFFFF',
        offset: '',
        rotationX: container.angle + 90,
        rotationY: 90,
        rotationZ: 270,
        sizeX: (w / output).toFixed(6),
        sizeY: (h / output).toFixed(6),
        visible: true,
        size: 1,
        id: sprite._id,
        containerAngle: -container.angle
      }
      list.push(entity)
    }
    sprite.entity = entity
    sprite.width = w * entity.size
    sprite.height = h * entity.size

    var width = sprite.width + 10
    var height = sprite.height + 10

    var tool = new PIXI.Container()
    sprite.tool = tool
    container.addChild(content)
    var line = null
    if (typeof container.line === 'undefined') {
      line = new PIXI.Graphics()
      line.lineStyle(1, 0xff0000, 1)
      line.moveTo(0, -output * 0.5)
      line.lineTo(0, output * 0.5)
      line.x = output * 0.5
      line.y = output * 0.5
      line.visible = false
      container.line = line
      container.addChild(line)
    } else {
      line = container.line
    }

    content.name = 'ImageContainer'
    content._type = 'ImageContainer'
    content.x = entity.positionX * output + output * 0.5
    content.y = -entity.positionY * output + output * 0.5
    if (manager.designData.ptype === 'bag') {
      content.y = entity.positionX * output + output * 0.5
    }

    content.angle = -entity.rotationX + 90
    content.scale.set(entity.size)
    // endregion
    content.target = sprite
    content.addChild(sprite)

    // region 红线框
    const graphics = new PIXI.Graphics()
    graphics._type = 'line'
    // graphics.visible = false
    graphics.lineStyle(2, 0xff0000, 1)
    graphics.moveTo(-width * textToolScale, -height * textToolScale)
    graphics.lineTo(-width * textToolScale, height * textToolScale)
    graphics.lineTo(width * textToolScale, height * textToolScale)
    graphics.lineTo(width * textToolScale, -height * textToolScale)
    graphics.lineTo(-width * textToolScale, -height * textToolScale)
    content.addChild(graphics)
    sprite.line = graphics
    // endregion

    const bg = PIXI.Sprite.from(require('@/assets/images/transparent.png'))
    bg.width = width * textToolScale * 2
    bg.height = height * textToolScale * 2
    bg._type = 'image'
    bg.anchor.set(0.5)
    bg.interactive = true
    sprite.bg = bg
    content.addChild(bg)
    bg.on('pointerdown', event => {
      lastPos = {
        x: content.x,
        y: content.y
      }
      manager.downItemBefore()

      manager.select(sprite)

      content.data = event.data
      content.status = 1

      content.children.map(function (child) {
        child.visible = true
      })
      manager.downItem()
    })
    bg.on('pointerup', () => {
      if (manager.selected !== sprite) {
        manager.selected.parent.status = 0
        manager.selected.parent.data = null
        line.visible = false
        if (lastPos.x !== manager.selected.parent.x || lastPos.y !== manager.selected.parent.y) {
          manager.saveDesign()
          lastPos = {
            x: 0,
            y: 0
          }
        }
        return
      }
      content.status = 0
      content.data = null
      line.visible = false
      if (lastPos.x !== content.x || lastPos.y !== content.y) {
        manager.saveDesign()
        lastPos = {
          x: 0,
          y: 0
        }
      }
    })
    bg.on('pointermove', () => {
      if (content.status === 1) {
        const posx = content.data.getLocalPosition(content.parent).x
        const posy = content.data.getLocalPosition(content.parent).y
        const textWidth = Math.cos((sprite.entity.rotationX - 90) * Math.PI / 180) * sprite.width * sprite.entity.size * 0.5
        const textHeight = Math.sin((90 - sprite.entity.rotationX + 90) * Math.PI / 180) * sprite.height * sprite.entity.size * 0.5
        // 范围 0 ~ 1024
        if ((posx - textWidth) < 0 || (posx + textWidth) > 1024) return
        if ((posy - textHeight) < 0 || (posy + textHeight) > 1024) return
        content.x = posx
        content.y = posy
        var posMouse = content.data.getLocalPosition(content.parent)
        // region 旋转,吸附
        if (designArea === 'umb' && manager.designData.ptype === 'umb') {
          var ks = manager.product.ks
          // 计算鼠标到中心点的角度
          var posCenter = { x: content.x, y: content.y }
          var pos1 = {
            x: output * 0.5,
            y: output * 0.5
          }
          var angle = 0
          var offset = getContainerRotation()
          if (offset === 0) {
            angle = utils.getAngle(posCenter, pos1) + 90 + 360 / ks / 2
          } else {
            angle = utils.getAngle(posCenter, pos1) + 90
          }
          if (angle < 0) {
            angle += 360
          }
          var index = parseInt(angle / (360 / ks))
          angle = index * (360 / ks) + offset
          content.angle = angle
          // 计算差值
          // sprite.entity.rotationX -= angle - sprite.entity.containerAngle
          sprite.entity.containerAngle = angle
          var point = {
            x:
              Math.cos(((angle + 90) * Math.PI) / 180) * output * 0.25 +
              output * 0.5,
            y:
              Math.sin(((angle + 90) * Math.PI) / 180) * output * 0.25 +
              output * 0.5
          }
          var disCenter = utils.getDistance(posCenter, {
            x: output * 0.5,
            y: output * 0.5
          })
          if (disCenter > 50) {
            var dis = Math.abs(
              utils.pointToLine(
                posMouse,
                { x: output * 0.5, y: output * 0.5 },
                point
              )
            )
            if (dis <= 10) {
              var r = utils.getDistance(posMouse, {
                x: output * 0.5,
                y: output * 0.5
              })
              content.x =
                Math.cos(((angle + 90) * Math.PI) / 180) * r + output * 0.5
              content.y =
                Math.sin(((angle + 90) * Math.PI) / 180) * r + output * 0.5

              line.visible = true
            } else {
              line.visible = false
            }
            line.angle = angle
          }
        }
        // endregion

        setTextEntity(sprite)
      }
    })

    // region 删除按钮
    const remove = PIXI.Sprite.from(require('@/assets/images/remove.png'))
    sprite.btnremove = remove
    remove._type = 'btn'
    // remove.visible = false
    remove.anchor.set(0.5)
    remove.width = (75 * textToolScale * output) / 1024
    remove.height = (75 * textToolScale * output) / 1024
    remove.alpha = 0.8
    remove.x = -width * textToolScale
    remove.y = height * textToolScale
    remove.interactive = true
    remove.on('pointerdown', () => {
      content.visible = false
      sprite.text = ''
      entity.visible = false

      manager.showTextPanel(false)
      manager.saveDesign()
    })
    tool.addChild(remove)
    // endregion

    // region 旋转按钮
    const rotate = PIXI.Sprite.from(require('@/assets/images/rotation.png'))
    sprite.btnrotate = rotate
    rotate._type = 'btn'
    // rotate.visible = false
    rotate.anchor.set(0.5)
    rotate.width = (75 * textToolScale * output) / 1024
    rotate.height = (75 * textToolScale * output) / 1024
    rotate.alpha = 0.8
    rotate.x = 0
    rotate.y = -height * textToolScale
    rotate.interactive = true
    rotate.on('pointerdown', downRotate)
    rotate.on('pointerupoutside', upRotate)
    rotate.on('pointermove', moveRotate)
    rotate.on('pointerup', upRotate)
    tool.addChild(rotate)
    // endregion

    // region 放大按钮
    const zoom = PIXI.Sprite.from(require('@/assets/images/resize.png'))
    sprite.btnzoom = zoom
    zoom._type = 'btn'
    // zoom.visible = false
    zoom.anchor.set(0.5)
    zoom.width = (75 * textToolScale * output) / 1024
    zoom.height = (75 * textToolScale * output) / 1024
    zoom.alpha = 0.8
    zoom.x = width * textToolScale
    zoom.y = height * textToolScale
    zoom.interactive = true
    zoom.on('pointerdown', downZoom)
    zoom.on('pointerupoutside', upZoom)
    zoom.on('pointermove', moveZoom)
    zoom.on('pointerup', upZoom)
    tool.addChild(zoom)
    // endregion

    content.addChild(tool)

    if (!isRecover) {
      manager.select(sprite)
    } else {
      content.angle = sprite.entity.containerAngle
      sprite.angle = -sprite.entity.rotationX - content.angle + 90
      sprite.parent.children.map(child => {
        child.visible = child._type === 'image'
      })
    }

    return sprite
  },

  async changeLogoColor (color) {
    const texture = await this.getTextureWithColor(
      manager.selected.entity.texture,
      color
    )
    manager.selected.texture = texture
    manager.selected.entity.color = color
    manager.saveDesign()
  },

  getTextureWithColor: async function (texName, color) {
    var rgb = utils.hex2rgb(color)
    const r = rgb[0]
    const g = rgb[1]
    const b = rgb[2]
    const arr = texName.split('.')
    const suffix = arr[1]
    var src = await localForage.getItem(texName)
    src = await utils.changeImageColor(src, r, g, b, suffix)
    const texture = await PIXI.Texture.from(src)
    return texture
  },

  rotate: function (val) {
    // console.log('text rotate', val)
    manager.selected.angle = val
    manager.selected.entity.rotationX = -manager.selected.parent.angle - val + 90
  },

  zoom: function (val) {
    // console.log('umb zoom', val)
    // console.log('text zoom', val)
    const text = manager.selected
    var value = 1
    if (val < 0.2) {
      value = 0.2
    } else {
      value = val
    }
    const maxSize = manager.designData.ptype !== 'umb' ? 6 : 2
    if (value > maxSize) {
      value = maxSize
    }
    text.parent.scale.set(value)
    if (typeof text.btnremove.startValue === 'undefined') {
      text.btnremove.startValue = text.btnremove.scale.x
    }
    if (typeof text.bg.startValueX === 'undefined') {
      text.bg.startValueX = text.bg.scale.x
      text.bg.startValueY = text.bg.scale.y
    }
    // 红线框
    if (val < 1) {
      text.line.scale.set(1 / value)
      text.tool.scale.set(1 / value)
      text.bg.scale.set(
        text.bg.startValueX / value,
        text.bg.startValueY / value
      )
      text.btnremove.scale.set(text.btnremove.startValue)
      text.btnrotate.scale.set(text.btnremove.startValue)
      text.btnzoom.scale.set(text.btnremove.startValue)
    } else {
      text.line.scale.set(1)
      text.tool.scale.set(1)
      text.bg.scale.set(text.bg.startValueX, text.bg.startValueY)
      text.btnremove.scale.set(text.btnremove.startValue / value)
      text.btnrotate.scale.set(text.btnremove.startValue / value)
      text.btnzoom.scale.set(text.btnremove.startValue / value)
    }
    setTextEntity(text)
  },

  endRotate: function () {
    // console.log('umb end rotate')
    manager.saveDesign()
  },

  endZoom: function () {
    // console.log('umb end zoom')
    manager.saveDesign()
  },

  remove: function () {
    if (!manager.selected) return
    if (manager.selected._type !== 'image') return
    manager.selected.visible = false
    manager.selected.entity.visible = false
    manager.saveDesign()
  },

  hideImageHighlight () {
    if (!manager || !manager.selected) return
    if (manager.selected._type !== 'image') return
    manager.selected.parent.children.map(child => {
      child.visible = child._type === 'image'
    })
  }
}
