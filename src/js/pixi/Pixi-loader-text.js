import * as PIXI from 'pixi.js'
import utils from '@/js/utils'
import store from '@/store'
import { loadFont } from '@/js/font'

let manager = null
let textToolScale = 1

let lastPos = {
  x: 0,
  y: 0
}

function setTextEntity (text) {
  if (text) {
    text.entity.rotationZ = -text.parent.angle - text.angle
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
  store.state.ui.rotation = (this.parent.parent.target.angle % 360 + 360) % 360
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

export default {
  async load (params) {
    if (store.state.ui.os.isPC && !store.state.ui.os.isPad) {
      textToolScale = 0.5
    } else {
      textToolScale = 1
    }

    manager = params.manager
    if (!manager.selectedBG) {
      console.error('selectedBG is null')
    }
    let entity = params.entity
    const isRecover = entity != null
    const output = manager.output
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
    if (entity == null) {
      // 插入数据
      var textlist = manager.selectedBG.entity.textlist
      var defaultText = 'Text'
      // 考虑旋转
      var posX = 0
      var posY = 0
      if (typeof manager.product.textPosition !== 'undefined') {
        var array = manager.product.textPosition[designArea].split(',')
        posX = Number(array[0])
        posY = Number(array[1])
      } else {
        if (designArea === 'umb') {
          var random = 0.01 * utils.randomNum(15, 40)
          posX = Math.cos(((container.angle - 90) * Math.PI) / 180) * random
          posY = Math.sin(((container.angle - 90) * Math.PI) / 180) * random
        } else {
          posY = -0.01 * utils.randomNum(0, 40)
        }
      }
      entity = {
        positionX: posX,
        positionY: posY,
        fontcolor: '#000000',
        font: store.getters.getFontList[0],
        rotationX: 0,
        rotationY: 0,
        rotationZ: container.angle,
        content: defaultText,
        sizeX: 0,
        sizeY: 0,
        size: 1,
        visible: true
      }
      textlist.push(entity)
      // endregion
    } else {
      if (entity.visible === false) return
    }
    // 加载字体
    await loadFont(entity.font)
    var content = new PIXI.Container()
    var tool = new PIXI.Container()
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

    // region 添加文字
    let initialSize = 50
    if (manager.designData.ptype !== 'umb') {
      initialSize = 100
    }
    var color = entity.fontcolor
    const style = new PIXI.TextStyle({
      fontFamily: entity.font,
      fontSize: (initialSize * output) / 1024,
      fill: [color]
    })
    var richText = new PIXI.Text(entity.content, style)
    richText.name = 'test'
    richText._type = 'text'
    richText.anchor.set(0.5)
    richText.tool = tool
    content.target = richText
    content.addChild(richText)
    richText.entity = entity

    // endregion

    // region 容器
    content.name = 'TextContainer'
    content._type = 'TextContainer'
    content.x = entity.positionX * output + output * 0.5
    content.y = -entity.positionY * output + output * 0.5
    if (manager.designData.ptype === 'bag') {
      content.y = entity.positionX * output + output * 0.5
    }

    content.angle = -entity.rotationZ
    content.scale.set(entity.size)
    // endregion

    var width = richText.width + 10
    var height = richText.height + 10

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
    richText.line = graphics
    // endregion

    const bg = PIXI.Sprite.from(require('@/assets/images/transparent.png'))
    bg.width = width * textToolScale * 2
    bg.height = height * textToolScale * 2
    bg._type = 'text'
    bg.anchor.set(0.5)
    bg.interactive = true
    richText.bg = bg
    content.addChild(bg)
    bg.on('pointerdown', event => {
      lastPos = {
        x: content.x,
        y: content.y
      }
      manager.downItemBefore()

      manager.select(richText)

      content.data = event.data
      content.status = 1

      content.children.map(function (child) {
        child.visible = true
      })
      manager.downItem()
    })
    bg.on('pointerup', () => {
      if (manager.selected !== richText) {
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
        const textWidth = Math.cos((-richText.entity.rotationZ) * Math.PI / 180) * richText.width * richText.entity.size * 0.5
        const textHeight = Math.sin((90 - -richText.entity.rotationZ) * Math.PI / 180) * richText.height * richText.entity.size * 0.5
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

        setTextEntity(richText)
      }
    })

    // region 删除按钮
    const remove = PIXI.Sprite.from(require('@/assets/images/remove.png'))
    richText.btnremove = remove
    remove._type = 'btn'
    // remove.visible = false
    remove.anchor.set(0.5)
    remove.width = (50 * textToolScale * output) / 1024
    remove.height = (50 * textToolScale * output) / 1024
    remove.alpha = 0.8
    remove.x = -width * textToolScale
    remove.y = height * textToolScale
    remove.interactive = true
    remove.on('pointerdown', () => {
      content.visible = false
      richText.text = ''
      entity.visible = false

      manager.showTextPanel(false)
      manager.saveDesign()
    })
    tool.addChild(remove)
    // endregion

    // region 旋转按钮
    const rotate = PIXI.Sprite.from(require('@/assets/images/rotation.png'))
    richText.btnrotate = rotate
    rotate._type = 'btn'
    // rotate.visible = false
    rotate.anchor.set(0.5)
    rotate.width = (50 * textToolScale * output) / 1024
    rotate.height = (50 * textToolScale * output) / 1024
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
    richText.btnzoom = zoom
    zoom._type = 'btn'
    // zoom.visible = false
    zoom.anchor.set(0.5)
    zoom.width = (50 * textToolScale * output) / 1024
    zoom.height = (50 * textToolScale * output) / 1024
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
      manager.select(richText)
    } else {
      richText.parent.children.map(child => {
        child.visible = child._type === 'text'
      })
    }

    store.state.ui.currentFont = entity.font

    console.log('添加字体', entity.font)

    return richText
  },

  rotate (val) {
    // console.log('text rotate', val)
    manager.selected.angle = val
    manager.selected.entity.rotationZ = -manager.selected.parent.angle - val
  },

  zoom (val) {
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

  endRotate () {
    console.log('text end rotate')
    manager.saveDesign()
  },

  endZoom () {
    console.log('text end zoom')
    manager.saveDesign()
  },

  changeText (val) {
    if (manager.selected._type !== 'text') return
    manager.selected.text = val
    // 计算红线框
    var width = manager.selected.width + 10
    var height = manager.selected.height + 10
    manager.selected.parent.children.map(child => {
      if (child._type === 'line') {
        child.clear()
        child.lineStyle(2, 0xff0000, 1)
        child.moveTo(-width / 2, -height / 2)
        child.lineTo(-width / 2, height / 2)
        child.lineTo(width / 2, height / 2)
        child.lineTo(width / 2, -height / 2)
        child.lineTo(-width / 2, -height / 2)
      }
    })

    manager.selected.btnremove.x = -width / 2
    manager.selected.btnremove.y = height / 2

    manager.selected.btnzoom.x = width / 2
    manager.selected.btnzoom.y = height / 2

    manager.selected.btnrotate.x = 0
    manager.selected.btnrotate.y = -height / 2

    // region 修改数据
    manager.selected.entity.content = val
    // endregion
  },

  changeTextColor (val) {
    if (manager.selected._type !== 'text') return
    manager.selected.style.fill = val
    manager.selected.entity.fontcolor = val
    manager.saveDesign()
  },

  hideTextHighlight () {
    if (!manager || !manager.selected) return
    if (manager.selected._type !== 'text') return
    if (manager.selected.text === '') {
      manager.selected.parent.visible = false
    }
    manager.selected.parent.children.map(child => {
      child.visible = child._type === 'text'
    })
  }
}
