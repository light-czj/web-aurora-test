<template>
  <div class="handwrite" v-if="value">
    <my-header>
      <template v-slot:left>
        <img class="ma-auto" height="80%" :title="$t('lang.titleHome')" src="@/assets/images/back.png" alt="" @click="clickLeft">
      </template>
      <template v-slot:middle>
        サイン
      </template>
      <template v-slot:right>
        <div @click="save">ok</div>
      </template>
    </my-header>
    <div class="content">
      <canvas id="sketchpad"></canvas>
      <v-toolbar dense flat color="transparent" absolute style="top: 7vh;align-items: center;">
        <v-img :src="require('@/assets/icons/delete.svg')" contain style="max-width: 30px;height: 30px;margin-right: 5px;" @click="clear"></v-img>
        <v-swatches
          @input="setColor"
          v-model="color"
          swatches="text-advanced"
          :trigger-style="{ 'width': '36px', 'height': '36px', 'marginTop': '6px' }"
        >
        </v-swatches>
        <div class="ml-2">
          <v-slider
            label="色・太さ"
            v-model="weight"
            @change="setWeight"
            :min="1"
            :max="40"
            step="1"
            style="width: 200px;margin-top: 20px;"
          ></v-slider>
        </div>
      </v-toolbar>
    </div>
  </div>
</template>

<script>
import MyHeader from '@/components/Header'
import Atrament from 'atrament'
import VSwatches from 'vue-swatches'
import moment from 'dayjs'
import loadImage from 'image-promise'
import utils from '@/js/utils'
import localforage from 'localforage'
import 'vue-swatches/dist/vue-swatches.css'
import { saveAlbums } from '@/js/album'

export default {
  components: {
    MyHeader,
    VSwatches
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      sketchpad: null,
      color: '#000000',
      weight: 1
    }
  },
  created () {},
  mounted () {
  },
  watch: {
    'value' (val) {
      if (val) {
        setTimeout(() => {
          this.initAtrament()
        }, 300)
      }
    }
  },
  methods: {
    clickLeft () {
      this.$emit('input', false)
    },
    initAtrament () {
      const canvas = document.querySelector('#sketchpad')
      console.log('初始化', canvas)
      if (!canvas) return
      this.sketchpad = new Atrament(canvas, {
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        color: this.color,
        smoothing: 0.1,
        weight: Number.parseInt(this.weight)
      })
      console.log(this.sketchpad)
    },
    clear () {
      this.sketchpad.clear()
    },
    setWeight () {
      this.sketchpad.weight = Number.parseInt(this.weight)
    },
    setColor () {
      this.sketchpad.color = this.color
    },
    save () {
      const canvas = document.querySelector('#sketchpad')
      const base64 = canvas.toDataURL('image/png', 1)
      const texName = 'UCAppGallery' + moment().format('YYYYMMDDHHmmss') + '.png'
      localforage.setItem(texName, base64)
      this.$emit('addLogoBySRC', {
        src: base64,
        texName: texName,
        size: this.$store.state.design.shareuc.product.customblending ? 2 : 1,
        handwrite: true,
        callback: texture => {
          this.callback(base64, texName, texture)
        }
      })
      this.$emit('input', false)
    },
    async callback (src, texName, texture) {
      // 压缩128小图
      var image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src
      const data = {
        file: 'handwrite',
        url: '',
        src: src,
        small: '',
        progress: 100,
        fname: texName,
        w: 0,
        h: 0,
        pixel: 72,
        sizeX: 0,
        startX: 0,
        sizeY: 0,
        startY: 0,
        showQR: false,
        isLogo: true,
        completed: true,
        task: null
      }
      loadImage(image).then(() => {
        data.small = utils.resizeImageToBase64(
          image,
          128,
          (128 * image.height) / image.width,
          utils.getSuffix(data.fname)
        )
        saveAlbums()
      })
      data.src = src
      data.progress = 100
      data.w = texture.origWidth
      data.h = texture.origHeight
      data.sizeX = Math.round(
        (texture.origWidth / data.pixel) * 2.54 * 10
      )
      data.startX = Math.round(
        (texture.origWidth / data.pixel) * 2.54 * 10
      )
      data.sizeY = Math.round(
        (texture.origHeight / data.pixel) * 2.54 * 10
      )
      data.startY = Math.round(
        (texture.origHeight / data.pixel) * 2.54 * 10
      )
      this.$store.state.album.list.unshift(data)
    }
  }
}
</script>

<style scoped lang="scss">
.handwrite {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 2;
}
.header {
  width: 100%;
  height: 7vh;
  line-height: 7vh;
  background-color: #cccccc !important;
}
.content {
  width: 100%;
  height: 93vh;
  background-image: url('~@/assets/images/bg-handwrite.jpg');
  background-size: auto;
  background-repeat: repeat;
  background-position: center;
}
#sketchpad {
  width: 100%;
  height: 93vh;
}
</style>
