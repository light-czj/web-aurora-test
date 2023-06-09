<template>
  <div style="width: 100%;height: 100%;" ref="threeRoot"></div>
</template>

<script>
import ThreeManager from '@/js/three/Three-manager.js'
export default {
  name: 'ThreeCanvas',
  props: {
  },
  data () {
    return {
      manager: null,
      designData: null,
      product: null,
      option: null
    }
  },
  methods: {
    setModel (active) {
      this.manager.setModel(active)
    },
    changeLineColor (val) {
      this.manager.changeLineColor(val)
    },
    getLineColor () {
      this.manager.getLineColor()
    },
    capture () {
      return this.manager.capture()
    },
    hide () {
      if (this.manager) {
        this.manager.hide()
      }
    },
    async loadThree (designData, product, option, reload = false, rotation, scale, position) {
      // console.log('loadThree', designData, product, option)
      this.designData = designData
      this.product = product
      this.option = option
      if (this.manager == null) {
        this.manager = new ThreeManager(this.$refs.threeRoot)
      }
      await this.manager.load(designData, product, option, reload, rotation, scale, position)
      this.$store.state.ui.update3d = false
    },
    setMatsTexturesByUrl (baseUrl, texName) {
      if (this.manager == null) {
        this.manager = new ThreeManager(this.$refs.threeRoot)
      }
      this.manager.setMatsTexturesByUrl(baseUrl, texName)
    },
    downloadImages () {
      this.manager.downloadImages()
    },
    changeClothColor (val) {
      if (this.manager) {
        this.manager.changeClothColor(val)
      }
    },
    setCameraPosition (type) {
      if (this.manager) {
        this.manager.setCameraPosition(type)
      }
    },
    changeHookColor (color) {
      if (this.manager) {
        this.manager.changeHookColor(color)
      }
    },
    changeInsideColor (color) {
      if (this.manager) {
        this.manager.changeInsideColor(color)
      }
    },
    toggleHook (val) {
      if (this.manager) {
        this.manager.toggleHook(val)
      }
    }
  },
  mounted () {
    if (this.$store.state.design.shareuc.designData.ptype === 'scarf') {
      this.changeClothColor(
        this.$store.state.design.shareuc.designData.handleColor
      )
    }
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped></style>
