<template>
  <div :class="{ 'page': true, 'ma-2': $store.state.ui.os.isPC }">
    <input ref="input" class="input hide" type="file" accept="*">
    <input ref="inputCapture" class="inputCapture hide" type="file" accept="image/*" capture="camera">
    <template v-if="!$store.state.ui.os.isPC">
      <v-container class="albumContainer">
        <swiper :options="galleryOption">
          <swiper-slide v-for="(item, index) in $store.state.album.list" :key="index">
            <image-converter
              :data="item"
              :index="index"
              @deleteGallery="deleteGallery"
              @changePatchTexture="changePatchTexture"
              @selectAlbum="selectAlbum"
            >
            </image-converter>
          </swiper-slide>
        </swiper>
      </v-container>
    </template>
    <template v-else>
      <v-container class="ma-0 pa-0">
        <v-row ref="inputText" class="py-0 my-0">
          <v-col class="pb-0 mb-0">
            <p class="mb-0">
              {{ $t('lang.inputFileType') }}
              <br />{{ $t('lang.inputFileSize') }}
            </p>
          </v-col>
        </v-row>
        <v-row ref="inputBtn" class="py-0 my-0">
          <v-col>
            <v-btn text style="width: 100%;background-color: #f5f5f5" @click="selectFile(false)">
              <v-icon>mdi-file</v-icon>
              <div style="text-transform: capitalize">{{ $t('lang.selectFile') }}</div>
            </v-btn>
          </v-col>
        </v-row>
        <v-container class="ma-0 pa-0" :style="`height: ${contentHeightPC}px;overflow-y: auto;`">
          <div v-for="(item, index) in $store.state.album.list" :key="index">
            <image-converter
              :data="item"
              :index="index"
              @deleteGallery="deleteGallery"
              @changePatchTexture="changePatchTexture"
              @selectAlbum="selectAlbum"
            >
              </image-converter>
          </div>
        </v-container>
      </v-container>
    </template>
  </div>
</template>

<script>
import moment from 'dayjs'
import utils from '@/js/utils'
import ImageConverter from './ImageConverter'
import ConverterTask from '@/js/converterTask'
import $ from 'jquery'
let this_ = null
export default {
  name: 'Album',
  data () {
    return {
      swiper: null,
      galleryOption: {
        slidesPerView: 5,
        spaceBetween: 10,
        freeMode: true
      },
      contentHeightPC: 0
    }
  },
  components: {
    ImageConverter
  },
  props: {
    row: {
      type: Number,
      default: 1
    },
    parent: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
  },
  methods: {
    listenInput: function () {
      const input = $('.input')
      if (input) {
        input.change(function () {
          this_.inputChange(this.files[0])
        })
        input.click(function (e) {
          e.target.value = null
        })
      }
      const inputCapture = $('.inputCapture')
      if (inputCapture) {
        inputCapture.change(function () {
          this_.inputChange(this.files[0])
        })
        inputCapture.click(function (e) {
          e.target.value = null
        })
      }
    },
    deleteGallery: function (index) {
      // console.log('deleteGallery', index, this.$store.state.album.list[index])
      if (this.$store.state.album.list[index].task) {
        this.$store.state.album.list[index].task.cancel()
      }
      this.$store.state.album.list.splice(index, 1)
    },
    removeGallery: function (data) {
      const index = this.$store.state.album.list.indexOf(data)
      this.$store.state.album.list.splice(index, 1)
    },
    removeItem: function (index) {
      console.log('removeItem', index)
      this.$store.state.album.list.splice(index, 1)
    },
    async inputChange (file) {
      const suffix = utils.getSuffix(file.name)
      const fname = 'UCAppGallery' + moment().format('YYYYMMDDHHmmss') + utils.randomWord(3) + suffix
      const item = {
        file: file,
        url: '',
        src: '',
        small: '',
        progress: 0,
        fname: fname,
        w: 0,
        h: 0,
        pixel: 72,
        sizeX: 0,
        startX: 0,
        sizeY: 0,
        startY: 0,
        showQR: false,
        isLogo: false,
        completed: false,
        task: null
      }
      const task = new ConverterTask(item, this)
      item.task = task
      task.start()
      this.$store.state.album.list.unshift(item)
    },
    clickFile: function () {
      this.$refs.input.click()
    },
    clickCapture: function () {
      this.$refs.inputCapture.click()
    },
    takePhotoCallback: function (src) {
      try {
        var fname = 'UCAppGallery' + moment().format('YYYYMMDDHHmmss') + utils.randomWord(5) + '.jpg'
        this.inputSRC(src, fname)
      } catch (e) {
        console.log(e)
      }
    },
    selectFile: function () {
      this.$refs.input.click()
    },
    changePatchTexture (src, fname, sizeY, pixel, source) {
      this.$emit('changePatchTexture', src, fname, sizeY, pixel, source)
    },
    selectAlbum (params) {
      this.$emit('selectAlbum', params)
    }
  },
  mounted () {
    this_ = this
    this.listenInput()
    if (this.$store.state.ui.os.isPC) {
      this.contentHeightPC = this.$store.state.ui.size.tabHeight - 16 - this.$refs.inputText.clientHeight - this.$refs.inputBtn.clientHeight
    }
  }
}
</script>

<style lang="scss" scopted>
.albumContainer {
  height: 100%;
  box-sizing: border-box;
  margin-top: 0 !important;
}
.clause {
  font-size: 1.5vh;
  position: fixed;
  bottom: 7vh;
  width: 94%;
}
.content {
  display: flex;
  align-items: center;
  width: 100%;
}
.album-item-img {
  height: 100%;
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: contain;
}
.album-item-text {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  text-align: center
}
.album-item-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 15px;
  height: 15px;
  background-size: cover;
  background-image: url('../../../assets/images/close.png');
}
</style>
