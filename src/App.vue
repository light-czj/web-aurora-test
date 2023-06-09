<template>
  <v-app id="app">
    <v-main>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
      <v-progress-circular
        class="myprogress"
        v-if="$store.state.ui.loading"
        indeterminate
        color="black"
        :size="100"
        :width="6"
      >
        {{ $store.state.ui.progress }}
      </v-progress-circular>
      <div class="snackbar-wrapper">
        <v-snackbar
          v-model="$store.state.ui.snackbar.active"
          :timeout="$store.state.ui.snackbar.timeout"
          :color="$store.state.ui.snackbar.color"
          light
          absolute
        >
          <div style="color: white;">{{ $store.state.ui.snackbar.msg }}</div>
          <template v-slot:action="{ attrs }">
            <v-btn
              color="white"
              text
              v-bind="attrs"
              @click="$store.state.ui.snackbar.active = false"
              icon
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-main>
    <div style="width: 100vw;height: 100vh;background-color: transparent;z-index: 999999;position: absolute;" v-if="$store.state.design.shareuc.loading2d"></div>
    <!-- <div
      v-if="showLandScape"
      style="position: fixed;width: 100vw;height: 100vh;z-index: 99999;background-color: white;"
    >
      <v-img
        class="mx-auto"
        style="top: 50%;margin-top: -150px;"
        :src="require('@/assets/images/landscape.jpg')"
        contain
        height="300"
      ></v-img>
    </div> -->
  </v-app>
</template>

<script>
import { loadFBXJson, loadBrandJson } from '@/api/brand'
import { setLanguage } from '@/js/language'
import { initWebFont } from '@/js/font'
import * as PIXI from 'pixi.js'
import utils from '@/js/utils'
export default {
  name: 'App',

  components: {},

  data: () => ({
    showLandScape: false
  }),
  mounted () {
    window.PIXI = PIXI
    window.vue = this
    let sid = this.$route.query.sid
    if (sid) {
      localStorage.setItem('SID_' + this.$store.state.config.brand, sid)
    } else {
      sid = localStorage.getItem('SID_' + this.$store.state.config.brand)
    }
    if (sid) {
      this.$store.state.brand.sid = sid
    }
    console.log('sid=', sid)
    this.$store.state.ui.showStatus = utils.getUrlKey('status')
    this.initGlobal()
    this.loadJson()
    this.$store.commit('loadShopCart')
    setLanguage('jp')

    this.watchLanscape()

    window.addEventListener(
      'popstate',
      e => {
        if (this.route && !this.route.name.includes('Skin')) {
          alert(
            'フォーム再送信の確認\n検索しているページは、入力した情報を使用しています。このページに戻った場合、操作のやり直しが発生する可能性があります。続行しますか？'
          )
        }
      },
      false
    )

    // 清空设计缓存
    this.$store.state.design.cacheKeys.forEach(item => {
      console.log('清空设计', item)
      localStorage.removeItem(item)
    })
    this.$store.state.design.cacheKeys = []
    localStorage.removeItem('cache_design_keys')
  },
  methods: {
    initGlobal () {
      if (process.env.NODE_ENV === 'development') {
        // alert('开发环境')
        // 移动端调试工具
        const eruda = require('eruda')
        eruda.init()
      } else {
        // alert('生产环境')
      }

      // 配置资源路径
      this.$store.commit('setUrls')
      // 获取平台信息
      this.$store.commit('setPlatform')

      const colorHistory = localStorage.getItem('COLOR_HISTORY')
      if (colorHistory) {
        this.$store.state.color.list = JSON.parse(colorHistory)
      }
    },
    // 并行加载json
    loadJson: async function () {
      Promise.all([loadBrandJson(), loadFBXJson()])
        .then(result => {
          this.$store.commit('setBrandJson', result[0].data)
          // this.$store.state.skin.row = result[0].data.skin.list[1]
          this.$store.commit('setFBXJson', result[1].data)
          this.$store.commit('loadJsonComplete', true)

          initWebFont()
        })
        .catch(error => {
          console.error(error)
        })
    },
    watchLanscape () {
      window.onresize = () => {
        return (() => {
          this.landscape()
        })()
      }
      this.landscape()
    },
    landscape () {
      // pad竖屏显示
      if (
        window.innerWidth < window.innerHeight &&
        this.$store.state.ui.os.isPad
      ) {
        this.showLandScape = true
      } else {
        this.showLandScape = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.snackbar-wrapper {
  position: fixed;
  height: 100%;
  width: 100%;
  pointer-events: none;
  top: 0;
  left: 0;
  z-index: 1000;
}
</style>
