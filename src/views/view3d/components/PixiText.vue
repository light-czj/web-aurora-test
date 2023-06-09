<template>
  <div class="page">
    <canvas ref="pixiCanvas"></canvas>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js'
export default {
  data () {
    return {
      app: null,
      richText: null
    }
  },
  created () {},
  mounted () {
    const canvas = this.$refs.pixiCanvas
    const app = new PIXI.Application({
      view: canvas,
      width: 512,
      height: 512,
      transparent: true,
      antialias: false
    })
    this.app = app

    const style = new PIXI.TextStyle({
      fontFamily: 'Microsoft YaHei',
      fontSize: 512,
      fontWeight: 'normal'
    })
    var richText = new PIXI.Text('Hello world', style)
    richText.name = 'test'
    richText.anchor.set(0.5)
    app.stage.addChild(richText)
    this.richText = richText
  },
  methods: {
    text2base64 (text, font, color) {
      this.richText.text = text
      this.richText.style.fontFamily = font
      this.richText.style.fill = color.replace('#', '0x')
      this.richText.updateText()
      const base64 = this.app.renderer.plugins.extract.base64(this.app.stage)
      return base64
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  position: absolute;
  z-index: -1;
}
</style>
