<template>
  <div class="page">
    <my-header class="header">
      <template v-slot:left>
        <img
          class="ma-auto"
          height="80%"
          :title="$t('lang.titleHome')"
          src="@/assets/images/back.png"
          alt=""
          @click="clickLeft"
        />
      </template>
      <template v-slot:middle>
        <div
          :class="{
            title3dPhone: $store.state.ui.os.isPhone,
            'text-center': true
          }"
          @click="clickTitle"
        >
          {{ title3d }}
        </div>
      </template>
      <template v-slot:right>
        <div
          :class="{ fontSizePhone: $store.state.ui.os.isPhone }"
          style="position: absolute;right: 15px;line-height: 7vh;"
          @click="clickTitle"
        >
          仕様を確認
        </div>
        <!-- <img class="ma-auto" height="80%" src="@/assets/images/cart.png" alt="" @click="clickRight"> -->
        <div ref="shopCartLabel" class="shopCartLabel">
          <div style="color: white;font-size: 10px;">+1</div>
        </div>
      </template>
    </my-header>
    <three-canvas class="threeCanvas" ref="threeCanvas"> </three-canvas>
    <pixi-text class="pixiText" ref="pixiText"></pixi-text>
    <vertical-list
      ref="verticalList"
      type="3d"
      :color="$store.state.ui.color3d"
      :list="verticalList"
      :click="clickVerticalBtn"
      scene="view3d"
      :colorList="colorList"
      :selectColor="selectColor"
    ></vertical-list>
    <swiper-list
      type="handle"
      ref="handleList"
      :click="selectHandle"
      :spriteUrl="$store.state.config.urls.spriteUrl"
    ></swiper-list>
    <horizon-list
      class="horizonList"
      ref="horizonList"
      :list="horizonList"
      :click="clickHorizon"
      :horizonStyle="horizonStyle"
    ></horizon-list>
    <my-footer>
      <slot>
        <div class="footer-title" @click="clickSave">
          オーダー内容を保存する
        </div>
      </slot>
    </my-footer>
    <uploader ref="uploader"></uploader>
    <v-dialog v-model="showProductInfo" max-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <div class="info-title">Products Info</div>
        </v-card-title>
        <v-card-text>
          <div v-html="productInfo"></div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmSleeve" max-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <div style="text-align: center;width: 100%">
            {{ $t('lang.confirmSleeve') }}
          </div>
        </v-card-title>
        <v-card-actions>
          <v-btn width="50%" color="gray darken-1" @click="designSleeve" text>
            <div class="text-lowercase">
              {{ $t('lang.reDesignSleeve') }}
            </div>
          </v-btn>

          <v-btn
            width="50%"
            color="red darken-1"
            @click="defaultSleeve"
            text
            style="overflow: hidden"
          >
            <div
              class="text-lowercase"
              v-html="$t('lang.defaultDesignSleeve')"
            ></div>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="activePanelSize" max-width="500">
      <v-card>
        <v-card-title class="lighten-2">
          サイズを選ぶ
        </v-card-title>
        <v-card-subtitle style="margin-top: 5px;">
          ※サイズ調整テープ付きですので約 1cm～2cm のサイズ調整が可能です。<br>
          ※同じデザインでサイズ違いも同時にご注文をご希望の場合、こちらで複数のサイズをご選択ください。数量の追加などは購入画面で変更可能です。
        </v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text>
          <v-container class="ma-0 pa-0">
            <v-row justify="space-around">
              <v-col
              >
                <v-chip-group
                  multiple
                  v-model="size"
                  column
                  active-class="primary--text"
                >
                  <v-chip
                    v-for="(tag, index) in tags"
                    :key="tag"
                    :class="{ 'selected':  size.includes(index) }"
                  >
                    {{ tag }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            block
            color="black"
            text
            @click="selectSize"
          >
            OK
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmLine" max-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <div style="text-align: center;width: 100%;padding-top: 20px;">
            ステッチの色をお選びください
          </div>
        </v-card-title>
        <v-card-actions>
          <v-btn width="50%" color="gray darken-1" @click="chooseLine" text>
            <div class="text-lowercase">
              選ぶ
            </div>
          </v-btn>

          <v-btn
            width="50%"
            color="red darken-1"
            @click="defaultLine"
            text
            style="overflow: hidden"
          >
            <div
              class="text-lowercase"
              v-html="$t('lang.defaultDesignSleeve')"
            ></div>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="activeHookColor" max-width="500">
      <v-card style="background-color: #ffffffa1;">
        <div class="info-title text-center" style="padding-top: 20px;">マジックテープの色をお選びください</div>
        <div style="display: flex;justify-content: center;padding: 20px;">
          <div @click="selectHookColor('#000000')" style="width: 50px;height: 50px;background-color: black;display: flex;justify-content: center;cursor: pointer;position: relative;">
            <div style="position: absolute;bottom: -30px;width: 100px;text-align: center;">ブラック</div>
          </div>
          <div @click="selectHookColor('#ffffff')" style="width: 50px;height: 50px;background-color: white;display: flex;justify-content: center;cursor: pointer;margin-left: 50px;position: relative;">
            <div style="position: absolute;bottom: -30px;width: 100px;text-align: center;">ホワイト</div>
          </div>
        </div>
        <div @click="toggleHook" style="color: black;text-align: center;padding: 30px 0 20px 0;text-align: center;text-decoration: underline;cursor: pointer;">
          マジックテープを閉じる
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="activeInsideColor" max-width="500">
      <v-card style="background-color: #ffffffa1;">
        <div class="info-title text-center" style="padding-top: 20px;">裏地の色をお選びください。</div>
        <div style="display: flex;justify-content: center;padding: 20px;">
          <div @click="selectInsideColor('#000000')" style="width: 50px;height: 50px;background-color: black;display: flex;justify-content: center;margin-top: 10px;margin-bottom: 40px;cursor: pointer;">
            <div style="position: absolute;bottom: 20px;">ブラック</div>
          </div>
          <div @click="selectInsideColor('#ffffff')" style="width: 50px;height: 50px;background-color: white;display: flex;justify-content: center;margin-top: 10px;margin-bottom: 40px;cursor: pointer;margin-left: 50px;">
            <div style="position: absolute;bottom: 20px;">ホワイト</div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="activeAR" max-width="500">
      <v-container style="background-color: #ffffffa1;" class="text-center">
        <v-form ref="form">
          <v-text-field v-model="urlAR"></v-text-field>
        </v-form>
        <v-btn @click="openAR">AR</v-btn>
      </v-container>
    </v-dialog>
  </div>
</template>

<script>
import MyHeader from '@/components/Header'
import MyFooter from '@/components/Footer'
import VerticalList from '@/components/VerticalList'
import HorizonList from '@/components/HorizonList'
import ThreeCanvas from '@/components/ThreeCanvas'
import Uploader from './components/Uploader'
import SwiperList from './components/SwiperList'
import TWEEN from '@tweenjs/tween.js'
import PixiText from './components/PixiText'
import utils from '@/js/utils'
import moment from 'dayjs'
import { saveAs } from 'file-saver'
import { upload2ali } from '@/api/file'

function animate (time) {
  requestAnimationFrame(animate)
  TWEEN.update(time)
}
requestAnimationFrame(animate)

export default {
  name: 'View3d',
  components: {
    MyHeader,
    MyFooter,
    ThreeCanvas,
    Uploader,
    VerticalList,
    SwiperList,
    PixiText,
    HorizonList
  },
  data () {
    return {
      tags: ['XS(52cm~54cm)', 'S(54cm~56cm)', 'M(56cm~58cm)', 'L(58cm~60cm)', 'XL(60cm~62cm)'],
      size: [2],
      activePanelSize: false,
      showProductInfo: false,
      productInfo: '',
      confirmSleeve: false,
      confirmLine: false,
      horizonStyle: {
        backgroundColor: 'lightgray'
      },
      activeHookColor: false,
      activeInsideColor: false,
      activeAR: false,
      urlAR: '',
      lastUrl: ''
    }
  },
  watch: {
    '$store.state.ui.color3d' (val) {
      this.$refs.verticalList.setColor(val)
      if (this.$refs.threeCanvas) {
        this.$refs.threeCanvas.changeClothColor(val)
      }
    },
    '$store.state.ui.update3d' (val) {
      if (val) {
        this.lastUrl = ''
        if (this.$refs.threeCanvas) {
          this.$refs.threeCanvas.loadThree(
            this.$store.state.design.shareuc.designData,
            this.$store.state.design.shareuc.product,
            this.$store.state.design.shareuc.option
          )
        }
        this.$refs.threeCanvas.changeInsideColor('#000000')
      }
    },
    '$store.state.design.shareuc.selectedColor' (val) {
      if (val) {
        if (this.$store.state.ui.colorType === 'line') {
          console.log('修改缝线颜色', val)
          this.$refs.threeCanvas.changeLineColor(val)
          this.$store.state.design.shareuc.selectedColor = ''
        }
      }
    }
  },
  computed: {
    horizonList () {
      const ret = []
      for (let i = 0; i < this.$store.state.design.shareuc.product.silkstatus; i++) {
        ret.push({
          img: require('@/assets/images/' + this.$store.state.design.shareuc.product.sprite + '_' + (i + 1) + '.png'),
          status: i + 1,
          title: ''
        })
      }
      return ret
    },
    title3d () {
      if (this.$store.state.design.shareuc.product) {
        return this.$store.state.design.shareuc.product.title || ''
      } else {
        return ''
      }
    },
    colorList () {
      if (this.$store.state.design.shareuc.product && this.$store.state.design.shareuc.product.gender === 'female') {
        return this.$store.state.design.shareuc.product.colorList || []
      } else {
        return []
      }
    },
    verticalList () {
      var ret = []
      if (this.$store.state.design.shareuc.designData.ptype === 'umb') {
        if (this.$store.state.design.shareuc.product !== null) {
          if (this.$store.state.design.shareuc.product.open === true) {
            ret = [
              {
                img: require('@/assets/images/open.png'),
                title: this.$t('lang.titleUmbOpen'),
                tag: '/open'
              }
            ]
          }
          if (this.$store.state.design.shareuc.product.fold === true) {
            ret.push({
              img: require('@/assets/images/fold.png'),
              title: this.$t('lang.titleUmbFold'),
              tag: '/fold'
            })
          }
          if (this.$store.state.design.shareuc.product.sleeve === true) {
            ret.push({
              img: require('@/assets/images/sleeve.png'),
              title: this.$t('lang.titleUmbSleeve'),
              tag: '/sleeve'
            })
          }
        }
        if (this.$store.state.design.shareuc.optionList.length > 0) {
          ret.push({
            img: require('@/assets/images/handle.png'),
            title: this.$t('lang.titleUmbHandle'),
            tag: '/handle'
          })
        }
        if (
          this.$store.state.brand.brandJson.setting.capture3d &&
          this.$store.state.brand.brandJson.setting.capture3d.value
        ) {
          ret.push({
            img: require('@/assets/images/download3d.png'),
            title: 'download',
            tag: '/download'
          })
        }
      } else if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        ret.push({
          img: require('@/assets/images/ar.png'),
          title: 'ar',
          tag: '/ar'
        })
        ret.push({
          img: require('@/assets/images/linecolor.png'),
          title: 'color',
          tag: '/color'
        })
        ret.push({
          img: require('@/assets/images/insidecolor.png'),
          title: 'inside color',
          tag: '/insidecolor'
        })
        if (this.$store.state.design.shareuc.designData.pid === 'Hat04') {
          ret.push({
            img: require('@/assets/images/hookcolor.png'),
            title: 'hook color',
            tag: '/hookcolor'
          })
        }
      }
      return ret
    }
  },
  mounted () {
    this.$refs.verticalList.setColor(this.$store.state.ui.color3d)
    this.$store.state.ui.loaded3d = true
    if (this.$refs.threeCanvas) {
      this.$refs.threeCanvas.loadThree(
        this.$store.state.design.shareuc.designData,
        this.$store.state.design.shareuc.product,
        this.$store.state.design.shareuc.option
      )
      this.$refs.threeCanvas.changeInsideColor('#000000')
    }

    document.onkeydown = (event) => {
      // eslint-disable-next-line no-caller
      var e = event || window.event || arguments.callee.caller.arguments[0]
      if (e && e.keyCode === 68) { // 按 D
        this.screenshot()
      }
    }
  },
  methods: {
    toggleHook () {
      this.activeHookColor = false
      this.$refs.threeCanvas.toggleHook(false)
    },
    selectHookColor (color) {
      this.activeHookColor = false
      this.$refs.threeCanvas.changeHookColor(color)
    },
    selectInsideColor (color) {
      this.activeInsideColor = false
      this.$refs.threeCanvas.changeInsideColor(color)
    },
    openAR () {
      this.activeAR = false
      window.open(this.urlAR, '__blank')
    },
    async clickAR () {
      if (this.lastUrl !== '') {
        if (this.$store.state.ui.os.isPC) {
          window.open(this.lastUrl, '__blank')
        } else {
          this.activeAR = true
          this.urlAR = this.lastUrl
        }
      } else {
        this.$store.state.ui.loading = true
        const uploadName = moment().format('YYYYMMDDHHmmss')
        const designAreas = this.$store.state.design.shareuc.product.designArea
        const length = designAreas.length
        for (let i = 0; i < length; i++) {
          const designArea = designAreas[i]
          const canvasTexture = this.$store.state.design.textures[designArea]
          const base64 = canvasTexture.image.toDataURL('image/jpg')
          let key = ''
          if (designArea === 'umb') {
            key = `${uploadName}.jpg`
          } else {
            key = `${uploadName}_${utils.uperFirst(designArea)}.jpg`
          }
          const blob = utils.base64ToBlob(base64, 'image/jpeg')
          this.$store.state.ui.progress = (i + 1) / length * 100 + '%'
          await upload2ali(blob, 'shareuc/' + key)
        }
        this.$store.state.ui.loading = false
        this.$store.state.ui.progress = ''
        const lc = this.$store.state.design.shareuc.lineColor.replace('#', '') || ''
        const ic = this.$store.state.design.shareuc.designData.insideColor.replace('#', '') || ''
        const hc = this.$store.state.design.shareuc.designData.hookColor.replace('#', '') || ''
        const url = `https://jp.shareuc.com/hat?img=${uploadName}&id=${this.$store.state.design.shareuc.designData.pid}&lc=${lc}&ic=${ic}&hc=${hc}`
        this.lastUrl = url
        console.log(`图片 https://ucjpacc.shareuc.com/shareuc/${uploadName}.jpg`)
        console.log('ar', url)
        if (this.$store.state.ui.os.isPC) {
          window.open(url, '__blank')
        } else {
          this.activeAR = true
          this.urlAR = url
        }
      }
    },
    async clickAR1 () {
      this.$store.state.ui.loading = true
      await this.switch3D('open')
      let base64 = this.capture()
      base64 = await utils.clearBase64(base64)
      const blob = utils.base64ToBlob(base64, 'image/png')
      const key = moment().format('YYYYMMDDHHmmss')
      await upload2ali(blob, 'shareuc/' + key + '.png')
      this.$store.state.ui.loading = false
      const url = `https://jp.shareuc.com/ar/#/?img=${key}`
      if (this.$store.state.ui.os.isPC) {
        window.open(url, '__blank')
      } else {
        this.activeAR = true
        this.urlAR = url
      }
    },
    chooseLine () {
      // 选中帽子缝线颜色
      this.$store.state.ui.colorType = 'line'
      this.getLineColor()
      this.$store.state.design.shareuc.currentColor = ''
      this.$router.push('/color')
    },
    defaultLine () {
      this.confirmLine = false
      this.clickSave(null, true)
    },
    getLineColor () {
      this.$refs.threeCanvas.getLineColor()
    },
    async capture3Ds () {
      const ptype = this.$store.state.design.shareuc.designData.ptype
      if (ptype === 'gift') {
        const ret = []
        for (let i = 0; i < 4; i++) {
          ret.push(await this.capture3Ds_cap(i))
        }
        return ret
      } else {
        return await this.capture3Ds_other(ptype)
      }
    },
    async capture3Ds_cap (index) {
      this.$refs.threeCanvas.$el.children[0].style.display = 'none'
      const scale = 1
      var position = null
      var rotation = null
      if (this.$store.state.design.shareuc.designData.pid === 'Hat04') {
        if (index === 0) {
        } else if (index === 1) {
          rotation = { x: 1.47, y: 0, z: 0 }
        } else if (index === 2) {
          rotation = { x: -0.82, y: 3.16, z: 0 }
        } else if (index === 3) {
          rotation = { x: -0.62, y: 0.03, z: 0 }
        }
      } else if (this.$store.state.design.shareuc.designData.pid === 'Hat05') {
        if (index === 0) {
        } else if (index === 1) {
          rotation = { x: 0.52, y: 0.03, z: 0 }
        } else if (index === 2) {
          rotation = { x: 0.52, y: -3.12, z: 0 }
        } else if (index === 3) {
          rotation = { x: -1.47, y: 0, z: 0.08 }
        }
      }
      const base64 = await this.capture3D('open', rotation, scale, position)
      await this.switch3D('open', null, 1, null, this.$store.state.design.shareuc.designData.type3d, true)
      this.$refs.threeCanvas.$el.children[0].style.display = 'initial'
      return base64
    },
    async capture3Ds_other (ptype) {
      const type3d = this.$store.state.design.shareuc.designData.type3d
      if (ptype === 'scarf') {
        this.$refs.threeCanvas.$el.children[0].style.display = 'none'
      }
      let scale = 1
      let position = null
      if (ptype === 'scarf' && type3d === 2) {
        scale = 0.5
        position = { x: 0, y: 0, z: 0 }
      }
      const base64 = await this.capture3D('open', null, scale, position)
      await this.delay(300)
      await this.switch3D('open', null, 1, null, this.$store.state.design.shareuc.designData.type3d, true)
      if (ptype === 'scarf') {
        this.$refs.threeCanvas.$el.children[0].style.display = 'initial'
      }
      return base64
    },
    async delay (time) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    },
    async capture3D (status, rotation, scale, position) {
      // 生成多个方向的渲染图
      // 切换到开伞
      await this.switch3D(status, rotation, scale, position, this.$store.state.design.shareuc.designData.type3d)

      const ptype = this.$store.state.design.shareuc.designData.ptype
      if (ptype === 'scarf') {
        // 隐藏模特
        this.$refs.threeCanvas.setModel(false)
        await this.delay(300)
      }
      // 拍照
      let base64 = this.capture()
      base64 = await utils.clearBase64(base64)
      // base64 = await utils.resizeBase64(base64, 512, 512)
      // 下载
      console.log(base64)

      if (ptype === 'scarf') {
        // 隐藏模特
        this.$refs.threeCanvas.setModel(true)
      }
      return base64
    },
    async screenshot () {
      // 拍照
      let base64 = this.capture()
      base64 = await utils.clearBase64(base64)
      base64 = await utils.resizeBase64(base64, 256, 256)
      // 下载
      const blob = utils.base64ToBlob(base64)
      saveAs(blob, moment().format('YYYYMMDDHHmmss') + '.png')
    },
    capture () {
      return this.$refs.threeCanvas.capture()
    },
    async switch3D (status, rotation, scale, position, type3d = '', reload = false) {
      if (!type3d) {
        type3d = status
      }
      this.$store.state.design.shareuc.designData.type3d = type3d
      await this.$refs.threeCanvas.loadThree(
        this.$store.state.design.shareuc.designData,
        this.$store.state.design.shareuc.product,
        this.$store.state.design.shareuc.option,
        reload,
        rotation,
        scale,
        position
      )
      return new Promise((resolve) => {
        setTimeout(() => {
          this.$refs.threeCanvas.setCameraPosition(status)
          resolve()
        }, 300)
      })
    },
    clickHorizon (item) {
      console.log('clickHorizon', item)
      if (this.$store.state.design.shareuc.designData.ptype === 'scarf') {
        this.$store.state.design.shareuc.designData.type3d = item.status
        setTimeout(() => {
          this.$refs.threeCanvas.loadThree(this.$store.state.design.shareuc.designData, this.$store.state.design.shareuc.product, this.$store.state.design.shareuc.option)
        }, 1)
      }
    },
    clickTitle () {
      var product = this.$store.state.design.shareuc.product
      var option = this.$store.state.design.shareuc.option
      var info = ''
      if (this.$store.state.ui.homeIndex === 0) {
        if (!product) return
        if (!option) return
        if (
          typeof product.description === 'undefined' ||
          product.description === ''
        ) {
          return
        }
        var str = product.description + '*' + option.material + '・' + option.color
        var arr = str.split('*')
        arr.forEach(function (item, index) {
          if (index > 0) {
            info += '<br>*' + item
          }
        })
      } else if (this.$store.state.ui.homeIndex === 1) {
        if (!product) return
        if (
          typeof product.description === 'undefined' ||
          product.description === ''
        ) {
          return
        }
        info = product.description
      } else if (this.$store.state.ui.homeIndex === 2) {
        if (product.description) {
          info = ('<br>' + product.description).replaceAll('\n', '<br>')
        }
      }
      if (info !== '') {
        this.productInfo = info
        this.showProductInfo = true
      }
    },
    showAnimate () {
      const element = this.$refs.shopCartLabel
      const coords = { opacity: 1 }
      // eslint-disable-next-line no-unused-vars
      const tween = new TWEEN.Tween(coords)
        .to({ opacity: 0 }, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          element.style.opacity = coords.opacity
        })
        .start()
    },
    selectHandle (item) {
      this.$store.state.design.shareuc.designSleeve = false
      console.log('selectHandle', item.id)
      this.$store.commit('setType3d', 'open')
      this.$store.commit('setOption', item.id)
      setTimeout(() => {
        this.$refs.threeCanvas.loadThree(
          this.$store.state.design.shareuc.designData,
          this.$store.state.design.shareuc.product,
          this.$store.state.design.shareuc.option
        )
        this.$refs.threeCanvas.setCameraPosition('handle')
      }, 1)
    },
    downloadImages: function () {
      this.$refs.threeCanvas.downloadImages()
    },
    selectColor: function (color) {
      console.log('selectColor', color)
      this.$store.commit('setHandleColor', color)
      this.$refs.threeCanvas.changeClothColor(color)
    },
    clickVerticalBtn: function (item) {
      console.log('3d btn', item)
      if (item.indexOf('/handle') > -1) {
        if (this.$refs.handleList) {
          this.$refs.handleList.toggle()
        }
      } else if (item.indexOf('/download') > -1) {
        this.downloadImages()
      } else if (item.indexOf('/ar') > -1) {
        this.clickAR()
      } else if (item.indexOf('/hookcolor') > -1) {
        this.$refs.threeCanvas.toggleHook()
        this.activeHookColor = true
        this.$refs.threeCanvas.setCameraPosition('hook')
      } else if (item.indexOf('/insidecolor') > -1) {
        this.activeInsideColor = true
        this.$refs.threeCanvas.setCameraPosition('inside')
      } else if (item.indexOf('/color') > -1) {
        // 选中帽子缝线颜色
        if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
          this.$refs.threeCanvas.setCameraPosition('umb')
        }
        this.$store.state.ui.colorType = 'line'
        this.getLineColor()
        this.$store.state.design.shareuc.currentColor = ''
        this.$router.push('/color')
      } else {
        var type3d = ''
        if (item.indexOf('/open') > -1) {
          type3d = 'open'
        }
        if (item.indexOf('/fold') > -1) {
          type3d = 'fold'
        }
        if (item.indexOf('/sleeve') > -1) {
          type3d = 'sleeve'
        }
        this.$store.commit('setType3d', type3d)
        setTimeout(() => {
          this.$refs.threeCanvas.loadThree(
            this.$store.state.design.shareuc.designData,
            this.$store.state.design.shareuc.product,
            this.$store.state.design.shareuc.option
          )
          this.$refs.threeCanvas.setCameraPosition(type3d)
        }, 1)
      }
    },
    clickLeft () {
      this.$router.push('/design')
    },
    clickRight () {
      this.$router.push('/shopcart')
    },
    selectSize () {
      if (this.size.length === 0) {
        this.$store.commit('setSnackbar', {
          active: true,
          msg: 'サイズをお選びください',
          color: 'error',
          timeout: 2000
        })
        return
      }
      this.activePanelSize = false
      // let size = ''
      // this.size.forEach(index => {
      //   if (size !== '') {
      //     size += ',' + this.tags[index]
      //   } else {
      //     size += this.tags[index]
      //   }
      // })
      // this.$store.state.design.shareuc.designData.size = size
      this.$store.state.design.size = this.size
      // 切换到伞视图
      if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        this.$refs.threeCanvas.setCameraPosition('umb')
      }
      this.$refs.uploader.save()
    },
    // clickSave () {
    //   this.capture3Ds()
    // },
    clickSave (callback = null, skipLine = false) {
      // 如果没有设计布套，返回
      if (
        this.$store.state.design.shareuc.product &&
        this.$store.state.design.shareuc.product.sleeve &&
        !this.$store.state.design.shareuc.isSleeveDesigned
      ) {
        this.confirmSleeve = true
        return
      }
      if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        if (!skipLine && this.$store.state.design.shareuc.lineColor === '#ffffff') {
          this.confirmLine = true
          return
        }
        this.size = []
        this.activePanelSize = true
        return
      }
      // 切换到伞视图
      if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        this.$refs.threeCanvas.setCameraPosition('umb')
      }
      this.$refs.uploader.save(callback)
    },
    designSleeve () {
      this.confirmSleeve = false
      this.$store.state.ui.designSleeve = true
      this.$router.push('/design')
    },
    defaultSleeve () {
      this.confirmSleeve = false
      this.$refs.uploader.save()
    },
    clickShare () {
      this.$refs.uploader.save(() => {
        console.log('上传结束,分享')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.threeCanvas {
  height: 78vh;
  background-image: url('../../assets/images/bg3d.jpg');
  background-size: auto 100%;
  background-repeat: repeat;
  background-position: center;
}
.shopCartLabel {
  opacity: 0;
  background-color: red;
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header {
  background-color: black !important;
  color: white;
}
.footer-title {
  background-color: black;
  color: white;
}
.title3dPhone {
  width: 50vw;
  font-size: 10px;
}
.fontSizePhone {
  font-size: 10px;
}
.selected {
  background-color: black;
  color: white !important;
}
.horizonList {
  transform: translateY(-8vh);
}
</style>
