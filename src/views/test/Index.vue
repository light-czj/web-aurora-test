<template>
  <div>
    <h1>解析psd</h1>
    <input class="upload" type="file" @input="onInput" />
    <div id="data"></div>
    <div id="image"></div>
  </div>
</template>

<script>
import PSD from 'psd.js'
export default {
  data () {
    return {
      counter: 0
    }
  },
  mounted () {
  },
  methods: {
    async onInput (e) {
      const file = e.target.files[0]
      e.target.value = ''
      var url = URL.createObjectURL(file)
      PSD.fromURL(url).then((psd) => {
        var data = JSON.stringify(psd.tree().export(), undefined, 2)
        document.getElementById('data').innerHTML = data
        console.log(psd.image)
        document.getElementById('image').appendChild(psd.image.toPng())
        URL.revokeObjectURL(url)
        // console.log(psd.tree().descendants()[0])
        // this.parsePsd(psd)
      })
    },
    parsePsd (psd) {
      var node
      var PsdW = psd.image.width()
      var PsdH = psd.image.height()
      console.time('parse')
      psd.tree().descendants().map((elem, i) => {
        node = elem
        draw(node)
      })
      console.timeEnd('parse')

      function getMask () {
        if (/* image.hasMask&& */ node.layer.mask.width /* >0 */ && node.layer.mask.height /* >0 */) {
          var StartPos = node.layer.image.startPos
          var EndPos
          var inf = node.get('channelsInfo')
          for (var i = 0; i < inf.length; i++) {
            var elem = inf[i]
            if (elem.id === -2) { // -2 mask channel
              EndPos = StartPos + elem.length
              break
            } else {
              StartPos = StartPos + elem.length
            }
          }
          return psd.file.data.slice(StartPos, EndPos)
        } else {
          console.error('oops, it seems there is no mask')
          return false
        }
      }

      function parseMask (mask) {
        if (mask instanceof Uint8Array /* ||Array.isArray(mask) */) {} else {
          console.error('No array received')
          return false
        }
        var МaskData = []
        var ModeRAW = 0
        var NotUseful = node.layer.mask.height * 2 + 2
        if (mask[1] === 1) { // RLE
          for (var i = NotUseful; i < mask.length; i++) {
            var elem = mask[i]
            if (ModeRAW === 0) {
              // if(mask[i+1]===undefined)console.error("No next character!");
              if (elem < 128) { // 128?
                ModeRAW = +elem + 1 // Enable modeRAW to elem+1
              } else {
                var Repeat = 257 - elem // 257
                var Color = mask[i + 1]
                var r = 0
                while (r < Repeat) { // Duplicate characters
                  МaskData.push(0, 0, 0, Color)
                  r++
                }
                i++ // skip next step
              }
            } else { // ModeRAW
              МaskData.push(0, 0, 0, elem)
              ModeRAW--
            }
          }
        } else if (mask[1] === 0) { // RAW
          МaskData = mask.join(',0,0,0,').slice(10).split(',') // bad
        } else { // zip?
          console.error('oops', mask[0], mask[1])
        }
        return МaskData
      }

      function draw (n) {
        var node = n
        if (node.layer.mask.defaultColor === undefined) {
          // console.info(node.name,"- маски нет");
          return false
        }
        var MaskW = node.layer.mask.width
        var MaskH = node.layer.mask.height
        var MaskT = node.layer.mask.top
        var MaskL = node.layer.mask.left
        var MaskC = node.get('mask').defaultColor
        this.counter++
        var newC = document.createElement('canvas')
        newC.id = 'L' + this.counter
        newC.setAttribute('data-name', node.name)
        document.getElementById('psd').appendChild(newC)
        var elem = document.getElementById('L' + this.counter)
        var ctx = elem.getContext('2d')
        elem.width = PsdW
        elem.height = PsdH
        if (MaskC !== 0) {
          ctx.fillRect(0, 0, PsdW, PsdH)
        }
        if (MaskW !== 0 && MaskH !== 0) {
          var checkMask = parseMask(getMask())
          if (checkMask) {
            var MaskImage = ctx.createImageData(MaskW, MaskH)
            if (MaskImage.data.set) {
              MaskImage.data.set(checkMask)
            } else {
              checkMask.forEach(function (val, i) {
                MaskImage.data[i] = val
              })
            }
            ctx.putImageData(MaskImage, MaskL, MaskT)
          } else {
            console.error('oops')
          }
        }
      }
    }
  }
}
</script>

<style>
.upload {
  width: 300px;
  height: 200px;
  margin: 0 auto;
  border: 3px dashed #39f;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
