<template>
  <div :class=" { 'tabs': !$store.state.ui.os.isPC, 'full': $store.state.ui.os.isPC }">
    <v-tabs v-model="$store.state.ui.tab" centered grow color="white" height="7vh">
      <v-tab href="#tab-1">
        <v-col>
          <v-row>
            <img :class="{ 'tabTitle': !$store.state.ui.os.isPC, 'tabTitlePC': $store.state.ui.os.isPC, 'mx-auto': true }" :src="require('@/assets/images/rotate.png')" alt="" @click="clickTabBar('rotate')" :title="$t('lang.titleRotate')">
          </v-row>
        </v-col>
      </v-tab>
      <v-tab href="#tab-2">
        <v-col>
          <v-row>
            <img :class="{ 'tabTitle': !$store.state.ui.os.isPC, 'tabTitlePC': $store.state.ui.os.isPC, 'mx-auto': true }" :src="require('@/assets/images/zoom.png')" alt="" @click="clickTabBar('zoom')" :title="$t('lang.titleZoom')">
          </v-row>
        </v-col>
      </v-tab>
      <v-tab href="#tab-3" :disabled="disabledBtn">
        <v-col>
          <v-row>
            <img :class="{ 'tabTitle': !$store.state.ui.os.isPC, 'tabTitlePC': $store.state.ui.os.isPC, 'mx-auto': true }" :src="require('@/assets/images/camera.png')" alt="" @click="clickTabBar('camera')" :title="$t('lang.titleCamera')">
          </v-row>
        </v-col>
      </v-tab>
      <v-tab href="#tab-4" :disabled="disabledBtn">
        <v-col>
          <v-row>
            <img :class="{ 'tabTitle': !$store.state.ui.os.isPC, 'tabTitlePC': $store.state.ui.os.isPC, 'mx-auto': true }" :src="require('@/assets/images/gallery.png')" alt="" @click="clickTabBar('album')" :title="$t('lang.titleGallery')">
          </v-row>
        </v-col>
      </v-tab>
      <v-tab href="#tab-5" :disabled="disabledBtn" @click="clickTabs(5)">
        <v-col>
          <v-row>
            <img :class="{ 'tabTitle': !$store.state.ui.os.isPC, 'tabTitlePC': $store.state.ui.os.isPC, 'mx-auto': true }" :src="require('@/assets/images/patterns.png')" alt="" @click="clickTabBar('gallery')" :title="$t('lang.titlePatterns')">
          </v-row>
        </v-col>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="$store.state.ui.tab" touchless>
      <v-tab-item value="tab-1" key="1">
        <v-card flat :class="{ 'tab-content': !$store.state.ui.os.isPC, 'tab-contentPC': $store.state.ui.os.isPC }">
          <ruler-slider ref="sliderRotate" img='ruler_Rotate.png' :max="360" :step="1" :value="$store.state.ui.rotation" @change="changeRotate" @end="endRotate"></ruler-slider>
          <v-divider class="divider"></v-divider>
        </v-card>
      </v-tab-item>
      <v-tab-item value="tab-2" key="2">
        <v-card flat :class="{ 'tab-content': !$store.state.ui.os.isPC, 'tab-contentPC': $store.state.ui.os.isPC }">
          <ruler-slider ref="sliderZoom" img="ruler_Zoom.png" :max="6" :step="0.1" :value="$store.state.ui.zoom" @change="changeZoom" @end="endZoom"></ruler-slider>
          <v-divider class="divider"></v-divider>
        </v-card>
      </v-tab-item>
      <v-tab-item value="tab-3" key="3">
        <v-card v-if="!$store.state.ui.os.isPC" flat :class="{ 'tab-content': !$store.state.ui.os.isPC, 'tab-contentPC': $store.state.ui.os.isPC }">
          <!-- <v-card-title><a @click="downloadApp">{{ $t('lang.cameraTitle') }}</a></v-card-title> -->
          <!-- <v-card-subtitle><a @click="downloadApp">{{ $t('lang.cameraSubTitle') }}</a></v-card-subtitle> -->
          <!-- <v-divider class="divider"></v-divider> -->
        </v-card>
      </v-tab-item>
      <v-tab-item value="tab-4" key="4">
        <v-card flat :class="{ 'tab-content': !$store.state.ui.os.isPC, 'tab-contentPC': $store.state.ui.os.isPC }">
          <album :class="{ 'pa-0': $store.state.ui.os.isPC }" ref="album" @changePatchTexture="changePatchTexture" @selectAlbum="selectAlbum" @addLogoBySRC="addLogoBySRC"></album>
          <v-divider class="divider"></v-divider>
        </v-card>
      </v-tab-item>
      <v-tab-item value="tab-5" key="5">
        <v-card flat :class="{ 'tab-content': !$store.state.ui.os.isPC, 'tab-contentPC': $store.state.ui.os.isPC }">
          <sticker v-if="$store.state.design.shareuc.activeSticker" :class="{ 'pa-0': $store.state.ui.os.isPC }" :row="2" @addLogoBySRC="addLogoBySRC" @getLastColor="getLastColor"></sticker>
          <filter-gallery v-else :row="2" @changePatchTexture="changePatchTexture" @getLastColor="getLastColor"></filter-gallery>
          <v-divider class="divider"></v-divider>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import Album from '../components/Album'
import FilterGallery from '../components/FilterGallery'
import Sticker from '../components/Sticker'
import RulerSlider from '../components/RulerSlider'
export default {
  name: 'Tabs',
  components: {
    Album,
    FilterGallery,
    RulerSlider,
    Sticker
  },
  data () {
    return {
      disabledBtn: false
    }
  },
  methods: {
    clickTabs (index) {
      if (index === 5) {
        if (!this.$store.state.ui.os.isPC) {
          this.$store.state.ui.showFilters = true
        }
        setTimeout(() => {
          this.$store.state.design.shareuc.activeSticker = false
        }, 0)
      }
    },
    getLastColor () {
      this.$emit('getLastColor')
    },
    changePatchTexture (params) {
      this.$emit('changePatchTexture', params)
    },
    selectAlbum (params) {
      this.$emit('selectAlbum', params)
    },
    addLogoBySRC (params) {
      this.$emit('addLogoBySRC', params)
    },
    clickTabBar (type, isAddLogo = false) {
      // console.log('clickTabBar ', type, isAddLogo)
      if (type === 'album') {
        this.$store.state.ui.tab = 'tab-4'
        if (typeof this.$refs.album === 'undefined') {
          setTimeout(() => {
            this.$refs.album.clickFile(isAddLogo)
          }, 0)
        } else {
          this.$refs.album.clickFile(isAddLogo)
        }
      } else if (type === 'camera') {
        this.$store.state.ui.tab = 'tab-4'
        if (typeof this.$refs.album === 'undefined') {
          setTimeout(() => {
            this.$refs.album.clickCapture()
          }, 0)
        } else {
          this.$refs.album.clickCapture()
        }
      }
    },
    changeZoom (val) {
      this.$emit('changeZoom', val)
    },
    changeRotate (val) {
      this.$emit('changeRotate', val)
    },
    endZoom (val) {
      this.$emit('endZoom', val)
    },
    endRotate (val) {
      this.$emit('endRotate', val)
    },
    downloadApp () {
      var appurl = this.$store.state.config.urls.appUrlIOS
      if (this.$store.state.ui.isAndroid) {
        appurl = this.$store.state.config.urls.appUrlAndroid
      }
      this.$copyText(`https://shareuc.com/brand/${this.$store.state.brand}/?sid=${this.$store.state.brand.sid}`).then(function (e) {
        window.open(appurl)
      }, function (e) {
        alert('Can not copy')
      })
    }
  },
  watch: {
    '$store.state.ui.zoom' (val) {
      if (this.$refs.sliderZoom) {
        this.$refs.sliderZoom.setValue(val)
      }
    },
    '$store.state.ui.rotation' (val) {
      if (this.$refs.sliderRotate) {
        this.$refs.sliderRotate.setValue(val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 修改vutify样式
.v-slide-group__prev--disabled {
  display: none !important;
}
.v-tab {
  min-width: auto;
  height: 7vh;
}
.tabs {
  height: 19vh;
}
.tabTitle {
  height: 3.5vh;
}
.tabTitlePC {
  height: 2vw;
}
.tab-content {
  width: 100vw;
  height: 12vh;
  background-color: #cccccc;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.tab-contentPC {
  width: 27vw;
  min-height: 12vh;
  max-height: 71vh;
  background-color: #cccccc;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.divider {
  background-color: white;
  margin-top: -2px;
  position: absolute;
  width: 100%;
  bottom: 0;
}
</style>
