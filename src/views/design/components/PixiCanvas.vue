<template>
  <div class="page">
    <div ref="pixiRoot" style="width: 100%;height: 100%;">
    </div>
    <template v-if="$store.state.design.shareuc.designData.pid === 'Hat05'">
      <template v-if="$store.state.design.shareuc.designArea === 'belt'">
        <template v-if="$store.state.ui.os.isPC">
          <div style="position: absolute;font-size: 7vh;color: white;left: 0;width: 50%;text-align: center;top: 25%;">前</div>
          <div style="position: absolute;font-size: 7vh;color: white;right: 0;width: 50%;text-align: center;top: 25%;">後</div>
        </template>
        <template v-else>
          <div style="position: absolute;font-size: 5vh;color: white;left: 0;width: 50%;text-align: center;top: 20%;">前</div>
          <div style="position: absolute;font-size: 5vh;color: white;right: 0;width: 50%;text-align: center;top: 20%;">後</div>
        </template>
      </template>
      <template v-else-if="$store.state.design.shareuc.designArea === 'logoend'">
        <template v-if="$store.state.ui.os.isPC">
          <div style="position: absolute;font-size: 7vh;color: white;right: 5%;width: 50%;text-align: right;top: 25%;z-index: 999;">前</div>
          <div style="position: absolute;font-size: 7vh;color: white;right: 5%;width: 50%;text-align: right;top: 75%;z-index: 999;">後</div>
        </template>
        <template v-else>
          <div style="position: absolute;font-size: 5vh;color: white;right: 10px;width: 100%;text-align: right;top: 20%;z-index: 999;">前</div>
          <div style="position: absolute;font-size: 5vh;color: white;right: 10px;width: 100%;text-align: right;top: 70%;z-index: 999;">後</div>
        </template>
      </template>
      <template v-else-if="$store.state.design.shareuc.designArea === 'sleeve'">
        <template v-if="$store.state.ui.os.isPC">
          <div style="position: absolute;font-size: 7vh;color: white;right: 5%;width: 50%;text-align: right;top: 25%;z-index: 999;">後</div>
          <div style="position: absolute;font-size: 7vh;color: white;right: 5%;width: 50%;text-align: right;top: 75%;z-index: 999;">前</div>
        </template>
        <template v-else>
          <div style="position: absolute;font-size: 5vh;color: white;right: 10px;width: 100%;text-align: right;top: 20%;z-index: 999;">後</div>
          <div style="position: absolute;font-size: 5vh;color: white;right: 10px;width: 100%;text-align: right;top: 70%;z-index: 999;">前</div>
        </template>
      </template>
    </template>
    <p class="quality" :class="{ 'qulity-low': $store.state.design.shareuc.quality < 50, 'qulity-middle': $store.state.design.shareuc.quality >= 50 && $store.state.design.shareuc.quality < 100, 'qulity-high': $store.state.design.shareuc.quality >= 100 }">{{ title }}</p>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import PIXIManager from '@/js/pixi/Pixi-manager.js'
export default {
  name: 'PixiCanvas',
  data () {
    return {
      manager: null
    }
  },
  computed: {
    title () {
      if (this.$store.state.design.shareuc.quality < 50) {
        return 'プリント不可'
      } else if (this.$store.state.design.shareuc.quality >= 50 && this.$store.state.design.shareuc.quality < 100) {
        return '画像が粗い'
      } else {
        return '画像が鮮明'
      }
    }
  },
  mounted () {
    this.loadPixi()
    this.addListenIframe()
  },
  methods: {
    hideLogoHighlight () {
      this.manager.downItemBefore()
    },
    downItemBefore () {
      this.manager.downItemBefore()
    },
    zoomIn (index) {
      this.manager.zoomIn(index)
    },
    zoomOut () {
      this.manager.zoomOut()
    },
    confirmFileSize () {
      this.manager.confirmFileSize()
    },
    setMask (value) {
      this.manager.setMask(value)
    },
    getLastColor () {
      this.manager.getLastColor()
    },
    selectFont (font) {
      this.manager.selectFont(font)
    },
    changeColor (data) {
      this.manager.changePatchColor(data)
    },
    clearDesign () {
      this.manager.clearDesign()
    },
    reset () {
      this.manager.reset()
    },
    undo () {
      this.manager.undo()
    },
    redo () {
      this.manager.redo()
    },
    addListenIframe: function () {
      window.addEventListener('message', event => {
        var msg = event.data
        if (!msg.cmd) return
        // console.log('iframe消息:', msg.cmd)
        switch (msg.cmd) {
          case 'pantone':
            var data = JSON.parse(msg.data)
            this.manager.changePatchColor(data)
            break
        }
      })
    },
    saveDesign () {
      this.manager.saveDesign()
    },
    loadDesign () {
      this.manager.loadDesign()
    },
    async loadPixi () {
      if (!this.manager) {
        const pixiRoot = this.$refs.pixiRoot
        this.manager = new PIXIManager(pixiRoot, this)
      }
      this.manager.clearHistory()
      await this.manager.load(
        this.$store.state.design.shareuc.designData,
        this.$store.state.design.shareuc.product
      )
      this.$store.state.ui.update2d = false
    },
    capture (shouldReturn) {
      return this.manager.capture(shouldReturn)
    },
    changePatchTexture (params) {
      this.manager.changePatchTexture(params)
    },
    selectAlbum (params) {
      this.manager.selectAlbum(params)
    },
    downloadImages () {
      this.manager.downloadImages()
    },
    addLogoBySRC (params) {
      this.manager.addLogoBySRC(params)
    },
    addText () {
      this.manager.addText()
    },
    changeZoom (val) {
      this.manager.changeZoom(val)
    },
    endZoom () {
      this.manager.endZoom()
    },
    changeRotate (val) {
      this.manager.changeRotate(val)
    },
    endRotate () {
      this.manager.endRotate()
    },
    changeText (val) {
      this.manager.changeText(val)
    },
    changeTextColor (val) {
      this.manager.changeTextColor(val)
    },
    changeLogoColor (val) {
      this.manager.changeLogoColor(val)
    },
    changeEdgeColor (val) {
      this.manager.changeEdgeColor(val)
    },
    showTextPanel (val) {
      this.$parent.activeText = val
    },
    removeImage () {
      this.manager.removeImage()
    },
    switchDesignArea (val) {
      this.manager.switchDesignArea(val)
    }
  },
  watch: {
    '$route.name' (val) {
      if (val === 'Design') {
        if (this.manager) {
          this.manager.afterCapture()
        }
      }
    },
    '$store.state.ui.update2d' (val) {
      if (val) {
        this.loadPixi()
      }
    },
    '$store.state.design.shareuc.selectedColor' (val) {
      if (val) {
        if (this.$store.state.ui.colorType === 'edge') {
          this.manager.changeEdgeColor(val)
          this.$store.state.design.shareuc.selectedColor = ''
        } else if (this.$store.state.ui.colorType === 'umb') {
          this.manager.changePatchColor({
            pantone: '',
            color: val
          })
          this.$store.state.design.shareuc.selectedColor = ''
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #888888;
}
.quality {
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: 0;
  margin: 12px;
  font-size: 2.5vh;
}
.qulity-low {
  color: red;
}
.qulity-middle {
  color: yellow;
}
.qulity-high {
  color: #9bc2e6;
}
</style>
