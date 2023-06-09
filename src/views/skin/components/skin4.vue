<template>
  <div style="width: 100%;height: 100%;position: relative;" v-if="$store.state.skin.row">
    <v-img v-if="$store.state.skin.row" style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
    <div style="margin-top: 12px;color: #FF8AC5;font-weight: bold;">Check3</div>
    <template v-if="$store.state.skin.row.type === 'umb'">
      <p style="margin-top: 12px;">
        こちらの画像でよろしいですか？
      </p>
      <div style="display: flex; position: relative;border: 1px solid black;margin: 0 auto;background-color: #f5f5f5;" :style="{ width: videoWidth + 'px' }">
        <video
          ref="video"
          :width="videoWidth"
          autoplay loop muted playsinline webkit-playsinline="true"
        ></video>
        <canvas
          style="display: none"
          ref="canvas"
        ></canvas>
        <v-img @click="switchCamera" :src="require(`@/assets/skin/switch.png`)" width="16%" contain style="position: absolute;right: 5px;top: 5px;"></v-img>
        <v-img :src="require(`@/assets/skin/scanframe.png`)" :width="videoWidth * 0.5" contain style="position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);"></v-img>
        <img ref="line" :src="require(`@/assets/skin/scanline.png`)" :style="{ width: videoWidth * 0.5 + 'px' }" style="position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);">
        <img @click="onCapture" :src="require('@/assets/skin/capture.png')" style="position: absolute;bottom: 5px;left: 50%;transform: translateX(-50%);width: 15%;" alt="">
        <img v-if="src" :src="src" :style="{ width: videoWidth + 'px' }" style="background-color: white;position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);" />
      </div>
      <v-img @click="onNext" style="margin-top: 12px;" :src="require(`@/assets/skin/button_next.png`)" width="34%" contain class="mx-auto"></v-img>
      <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="34%" contain class="mx-auto flex align-center">back</v-img>
      <v-img @click="onReset" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="34%" contain class="mx-auto flex align-center">もう一度撮る</v-img>
    </template>
    <template v-else>
      <p style="margin-top: 12px;" v-html="title">
      </p>
      <v-container class="px-14 py-0">
        <v-img @click="onClick(0)" :src="$store.state.skin.selects[2] === 0 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" contain width="100%" style="display: flex;align-items: center;">
          <v-img width="70%" contain class="mx-auto" v-if="option1.endsWith('.png')" :src="require(`@/assets/skin/${option1}`)"></v-img>
          <div v-else>{{ option1 }}</div>
        </v-img>
        <v-img @click="onClick(1)" :src="$store.state.skin.selects[2] === 1 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" class="my-2" contain width="100%" style="display: flex;align-items: center;">
          <v-img width="70%" contain class="mx-auto" v-if="option2.endsWith('.png')" :src="require(`@/assets/skin/${option2}`)"></v-img>
          <div v-else>{{ option2 }}</div>
        </v-img>
      </v-container>
      <v-img @click="onNext" style="margin-top: 12px;" :src="require(`@/assets/skin/button_next.png`)" width="34%" contain class="mx-auto"></v-img>
      <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="34%" contain class="mx-auto flex align-center">back</v-img>
    </template>
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js'
import Vue from 'vue'

export default {
  data () {
    return {
      selected: [],
      videoWidth: window.innerWidth * 0.8,
      tween: null,
      src: '',
      myVideo: null,
      constraints: {
        audio: false,
        video: {
          facingMode: 'environment'
        }
      },
      videoStream: null
    }
  },
  components: {
  },
  computed: {
    list () {
      return this.$store.state.brand.brandJson && this.$store.state.brand.brandJson.skin.colorCheck
    },
    title () {
      let ret = ''
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1]) {
        case 0:
          ret = 'どちらのカラーグループが<br>似合うと言われますか'
          break
        case 1:
          ret = '肌になじむアクセサリーは'
          break
        case 2:
          ret = 'どちらのカラーグループが<br>似合うと言われますか'
          break
      }
      return ret
    },
    option1 () {
      let ret = ''
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1]) {
        case 0:
          ret = 'check3A_1.png'
          break
        case 1:
          ret = 'ゴールド系'
          break
        case 2:
          ret = 'check3C_1.png'
          break
      }
      return ret
    },
    option2 () {
      let ret = ''
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1]) {
        case 0:
          ret = 'check3A_2.png'
          break
        case 1:
          ret = 'シルバー系'
          break
        case 2:
          ret = 'check3C_2.png'
          break
      }
      return ret
    }
  },
  watch: {
    '$store.state.skin.shouldStop' (val) {
      if (val) {
        this.$store.state.skin.shouldStop = false
        this.onStop()
      }
    }
  },
  onUnmounted () {
    this.onStop()
  },
  methods: {
    onStop () {
      console.log('关闭摄像头')
      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => {
          track.stop()
        })
      }
    },
    onBack () {
      this.onStop()
      this.$router.push('/skin3')
    },
    onClick (index) {
      Vue.set(this.$store.state.skin.selects, 2, index)
    },
    onReset () {
      this.src = ''
    },
    onNext () {
      if (this.$store.state.skin.row.type === 'scarf') {
        Vue.set(this.$store.state.skin.selects, 3, 0)
      } else {
        this.onCapture()
        this.ananize()
      }
      this.onStop()
      this.$router.push('/skin5')
    },
    switchCamera () {
      if (this.constraints.video.facingMode === 'face') {
        this.constraints.video.facingMode = 'environment'
      } else {
        this.constraints.video.facingMode = 'face'
      }
      this.onStop()
      this.openCamera()
    },
    async openCamera () {
      try {
        this.videoStream = await navigator.mediaDevices.getUserMedia(this.constraints)
        this.myVideo.srcObject = this.videoStream
        this.$store.state.skin.videoStream = this.videoStream
      } catch (error) {
        console.log(error)
      }
    },
    doTween () {
      // Setup the animation loop.
      function animate (time) {
        requestAnimationFrame(animate)
        TWEEN.update(time)
      }
      requestAnimationFrame(animate)
      var coords = {
        top: 33
      }
      this.tween = new TWEEN.Tween(coords)
        .to({ top: 68 }, 2000)
        .yoyo(true)
        .onUpdate(() => {
          if (this.$refs.line) {
            this.$refs.line.style.top = coords.top + '%'
          }
        })
        .repeat(Infinity)
        .start()
    },
    onCapture () {
      const canvas = this.$refs.canvas
      canvas.setAttribute('width', this.myVideo.videoWidth)
      canvas.setAttribute('height', this.myVideo.videoHeight)
      canvas.getContext('2d').drawImage(this.myVideo, 0, 0, this.myVideo.videoWidth, this.myVideo.videoHeight)
      this.src = canvas.toDataURL('image/png')
    },
    analyzeChoice () {
      let ret = -1
      if (this.$store.state.skin.scores[0] === 80) {
        ret = 0
      } else if (this.$store.state.skin.scores[1] === 60) {
        ret = 1
      } else if (this.$store.state.skin.scores[2] === 60) {
        ret = 2
      }
      return ret
    },
    hexToRgb (hex) {
      return [parseInt('0x' + hex.slice(1, 3)), parseInt('0x' + hex.slice(3, 5)), parseInt('0x' + hex.slice(5, 7))]
    },
    analyzeColor (rgb) {
      const score = Math.ceil(rgb[0] * 255 * 0.299 + rgb[1] * 255 * 0.578 + rgb[2] * 255 * 0.114)
      // 计算差值
      let list = []
      for (let i = 0; i < this.$store.state.brand.brandJson.skin.colorSkin.length; i++) {
        const item = this.$store.state.brand.brandJson.skin.colorSkin[i]
        const rgb1 = this.hexToRgb(item.color)
        const score1 = Math.ceil(rgb1[0] * 255 * 0.299 + rgb1[1] * 255 * 0.578 + rgb1[2] * 255 * 0.114)
        list.push({
          index: i,
          offset: Math.abs(score1 - score),
          category: item.category
        })
      }
      list = list.sort((a, b) => { return a.offset - b.offset })
      console.log('排序', list)
      const category = list[0].category
      const scores = this.$store.state.skin.scores
      if (category === 'light') {
        scores[0] += 40
      } else if (category === 'warm') {
        scores[1] += 30
      } else {
        scores[2] += 30
      }

      let result = -1
      // 比较得分
      if (scores[0] > scores[1] && scores[0] > scores[2]) {
        result = 0
      } else if (scores[1] > scores[0] && scores[1] > scores[2]) {
        result = 1
      } else {
        result = 2
      }
      return result
    },
    getImageColor (src) {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          var canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height

          var context = canvas.getContext('2d')
          context.drawImage(img, 0, 0, canvas.width, canvas.height)

          // 获取像素数据
          var data = context.getImageData(0, 0, img.width, img.height).data
          var r = 1
          var g = 1
          var b = 1
          // 取所有像素的平均值
          for (var row = 0; row < img.height; row++) {
            for (var col = 0; col < img.width; col++) {
              if (row === 0) {
                r += data[((img.width * row) + col)]
                g += data[((img.width * row) + col) + 1]
                b += data[((img.width * row) + col) + 2]
              } else {
                r += data[((img.width * row) + col) * 4]
                g += data[((img.width * row) + col) * 4 + 1]
                b += data[((img.width * row) + col) * 4 + 2]
              }
            }
          }
          // 求取平均值
          r /= (img.width * img.height)
          g /= (img.width * img.height)
          b /= (img.width * img.height)

          // 将最终的值取整
          r = Math.round(r)
          g = Math.round(g)
          b = Math.round(b)
          resolve([r, g, b])
        }
        img.src = src
      })
    },
    async ananize () {
      let result = -1
      // 分析选择
      result = this.analyzeChoice()
      // 分析拍照
      if (result === -1) {
        // 图片的主色调
        const rgb = await this.getImageColor(this.src)
        console.log('主色调', rgb)
        result = this.analyzeColor(rgb)
      }
      this.$store.state.skin.result = result
    },
    createVideo () {
      this.myVideo = this.$refs.video
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        this.openCamera()
      } else {
        console.log('浏览器暂不支持')
      }
    }
  },
  mounted () {
    if (this.$store.state.skin.row && this.$store.state.skin.row.type === 'umb') {
      this.createVideo()
      this.doTween()
    }
    // setTimeout(async () => {
    //   this.src = 'https://uc.shareuc.com/LOGO_yousee.png'
    //   const rgb = await this.getImageColor(this.src)
    //   console.log('主色调', rgb)
    //   this.analyzeColor(rgb)
    // }, 1000)
  }
}
</script>

<style lang="scss" scoped></style>
