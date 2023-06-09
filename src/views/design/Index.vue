<template>
  <div :class="{ page: true, pagePC: $store.state.ui.os.isPC }">
    <template v-if="!$store.state.ui.os.isPC">
      <my-header centerType="button" @addText="addText" @handwrite="handwrite" @change2d="change2d">
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
        <template v-slot:middle></template>
      </my-header>
      <template v-if="activeUndoRedo">
        <div class="historyContainer">
          <v-btn text style="width: 7vh;height: 7vh;" @click="undo">
            <v-img
              :class="{ disabledBtn: !$store.state.ui.canUndo }"
              :src="require('@/assets/images/undo.png')"
              style="width: 7vh"
            ></v-img>
          </v-btn>
          <v-btn text style="width: 7vh;height: 7vh;" @click="redo">
            <v-img
              :class="{ disabledBtn: !$store.state.ui.canRedo }"
              :src="require('@/assets/images/redo.png')"
              style="width: 7vh"
            ></v-img>
          </v-btn>
        </div>
      </template>
      <pixi-canvas ref="pixiCanvas"></pixi-canvas>
      <v-btn text style="width: 6vh;height: 6vh;position: aboslute;left: 0;bottom: 27vh;position: absolute;cursor: pointer;z-index: 1;"  @click="$store.state.ui.activeKuapian = true">
        <img style="width: 6vh" :src="require('@/assets/images/kuapian.png')">
      </v-btn>
      <vertical-list
        ref="verticalList"
        type="2d"
        :color="$store.state.ui.color2d"
        :list="verticalList"
        :click="clickVerticalBtn"
        scene="design"
        :colorList="colorList"
        :selectColor="selectColor"
      ></vertical-list>
      <my-tabs
        ref="tabs"
        @changePatchTexture="changePatchTexture"
        @selectAlbum="selectAlbum"
        @addLogoBySRC="addLogoBySRC"
        @changeZoom="changeZoom"
        @endZoom="endZoom"
        @changeRotate="changeRotate"
        @endRotate="endRotate"
        @getLastColor="getLastColor"
      >
      </my-tabs>
      <my-footer>
        <slot>
          <div class="footer-title" @click="to3d(false)">プレビューする</div>
        </slot>
      </my-footer>
      <text-edit v-show="activeText" @selectFont="selectFont"></text-edit>
      <panel-design-area
        v-if="$store.state.design.shareuc.product.areabtn"
        @onClick="switchDesignArea"
        @zoomIn="zoomIn"
        @zoomOut="zoomOut"
      ></panel-design-area>
    </template>
    <template v-else>
      <text-edit v-show="activeText" @selectFont="selectFont"></text-edit>
      <pixi-canvas class="leftContainer" ref="pixiCanvas"></pixi-canvas>
      <v-btn text style="width: 6vh;height: 6vh;position: aboslute;left: 10px;bottom: 10px;position: absolute;cursor: pointer;z-index: 1;" @click="$store.state.ui.activeKuapian = true">
        <img style="width: 6vh" :src="require('@/assets/images/kuapian.png')">
      </v-btn>
      <div class="rightContainer">
        <my-header ref="header" centerType="button" @addText="addText" @handwrite="handwrite">
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
          <template v-slot:middle></template>
        </my-header>
        <template v-if="activeUndoRedo">
          <div class="historyContainerPC">
            <v-btn small text style="width: 7vh;height: 7vh;" @click="undo">
              <v-img
                :class="{ disabledBtn: !$store.state.ui.canUndo }"
                :src="require('@/assets/images/undo.png')"
                style="width: 7vh"
              ></v-img>
            </v-btn>
            <v-btn small text style="width: 7vh;height: 7vh;" @click="redo">
              <v-img
                :class="{ disabledBtn: !$store.state.ui.canRedo }"
                :src="require('@/assets/images/redo.png')"
                style="width: 7vh"
              ></v-img>
            </v-btn>
          </div>
        </template>
        <vertical-list
          ref="verticalList"
          type="2d"
          :color="$store.state.ui.color2d"
          :list="verticalList"
          :click="clickVerticalBtn"
          scene="design"
          :colorList="colorList"
          :selectColor="selectColor"
        ></vertical-list>
        <my-tabs
          ref="tabs"
          @changePatchTexture="changePatchTexture"
          @selectAlbum="selectAlbum"
          @addLogoBySRC="addLogoBySRC"
          @changeZoom="changeZoom"
          @endZoom="endZoom"
          @changeRotate="changeRotate"
          @endRotate="endRotate"
          @getLastColor="getLastColor"
        >
        </my-tabs>
        <my-footer>
          <slot>
            <div class="footer-title" @click="to3d(false)">プレビューする</div>
          </slot>
        </my-footer>
        <panel-design-area
          v-show="$store.state.design.shareuc.product.areabtn"
          @onClick="switchDesignArea"
          @zoomIn="zoomIn"
          @zoomOut="zoomOut"
        ></panel-design-area>
      </div>
      <color-histry class="color-history" @changeColor="changeColor"></color-histry>
    </template>
    <v-dialog v-model="$store.state.ui.showFileSizeConfirm" max-width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <div style="text-align: center;width: 100%">
            このデータは解像度が低い為、プリントが鮮明に
            表現出来ない場合がございます。宜しいでしょうか。
          </div>
        </v-card-title>
        <v-card-actions>
          <v-btn
            width="50%"
            color="gray"
            @click="cancelFileSize"
            text
            style="overflow: hidden"
          >
            <div class="text-lowercase">
              いいえ
            </div>
          </v-btn>
          <v-btn width="50%" color="red" @click="confirmFileSize" text>
            <div class="text-lowercase">
              はい
            </div>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="$store.state.ui.activeKuapian" :max-width="dialogWidth" scrollable>
      <v-card>
        <v-card-text :style="{ height: dialogHeight }" ref="dialogContentRef">
          <div v-if="$store.state.design.shareuc.designData.ptype === 'umb'" style="text-align: center;">
            <img v-if="$store.state.ui.os.isPC" src="https://ucjpacc.shareuc.com/assets/pdf/umb-pc.png" style="width: 80%;" />
            <img v-else src="https://ucjpacc.shareuc.com/assets/pdf/umb-phone.jpg" style="width: 100%;" />
          </div>
          <div v-else-if="$store.state.design.shareuc.designData.ptype === 'scarf'" style="text-align: center;">
            <img v-if="$store.state.ui.os.isPC" src="https://ucjpacc.shareuc.com/assets/pdf/scarf-pc.png" style="width: 80%;" />
            <img v-else src="https://ucjpacc.shareuc.com/assets/pdf/scarf-phone.jpg" style="width: 100%;" />
          </div>
          <div v-else-if="$store.state.design.shareuc.designData.ptype === 'gift'" style="text-align: center;">
            <img v-if="$store.state.ui.os.isPC" src="https://ucjpacc.shareuc.com/assets/pdf/gift-pc.jpg" style="width: 80%;" />
            <img v-else src="https://ucjpacc.shareuc.com/assets/pdf/gift-phone.jpg" style="width: 100%;" />
          </div>
        </v-card-text>
        <v-btn @click="$store.state.ui.activeKuapian = false" style="position: absolute;top: 0;right: 0;" icon><v-icon style="font-size: 3.5vh;">mdi-close</v-icon></v-btn>
      </v-card>
    </v-dialog>
    <handwrite v-model="activeHandwrite" @addLogoBySRC="addLogoBySRC"></handwrite>
    <v-dialog
      v-model="activeQuality"
      max-width="500"
    >
      <v-card>
        <v-card-title class="grey lighten-2">
          {{ qualityTitle }}
        </v-card-title>

        <v-card-text style="margin-top: 8px;" v-if="qualityType === 3" :class="{ 'fontSmall': !$store.state.ui.os.isPC }">
          有償の補正サービスでも解消が難しい為、解像度の高い画像（推奨サイズ：<b>2000ピクセル以上</b>)で再作成ください。
        </v-card-text>

        <v-card-text style="margin-top: 8px;" v-else-if="qualityType === 2" :class="{ 'fontSmall': !$store.state.ui.os.isPC }">
          <b>【画像が粗い】</b><br/>
          ・・・解像度の高い画像（推奨サイズ：<b>2000ピクセル以上</b>)で再
          作成いただくか、購入時にご案内する有償の補正サービス（税
          込835円）をお勧めいたします。補正サービスをご利用いただ
          ければ推奨サイズにて仕上げることが可能です。<br/>
          <b>【プリント不可】</b><br/>
          ・・・有償の補正サービスでも解消が難しい為、解像度の高い
          画像（推奨サイズ：<b>2000ピクセル以上</b>)で再作成ください。
        </v-card-text>

        <v-card-text style="margin-top: 8px;" v-else-if="qualityType === 1" :class="{ 'fontSmall': !$store.state.ui.os.isPC }">
          解像度の高い画像（推奨サイズ：<b>2000ピクセル以上</b>)で再作
          成いただくか、購入時にご案内する有償の補正サービス（税込
          835円）をお勧めいたします。補正サービスをご利用いただけ
          れば推奨サイズにて仕上げることが可能です。
        </v-card-text>

        <div style="position: relative;text-align: center;max-height: 50vh;overflow-y: auto;" :style="{ padding: $store.state.ui.os.isPC ? '12px' : '0' }">
          <div v-for="(image, i) in qualityImage" :key="i" style="position: relative;">
            <img :src="image" :style="{ height: $store.state.ui.os.isPC ? '400px' : '200px' }" />
            <div :class="{ 'smallText': !$store.state.ui.os.isPC }" v-for="(item, index) in qualityList[i]" style="position: absolute;" :key="'quality' + index" :style="{ left: item.position.left + 'px', top: item.position.top + 'px' }">
              <span style="color: red;font-weight: bold;background-color: lightgray;border-radius: 5px;padding: 5px;" v-if="item.title">{{ item.title }}</span>
            </div>
          </div>
        </div>

        <template v-if="qualityType === 1">
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="info"
              text
              @click="onConfirmQuality"
            >
              プレビューする
            </v-btn>
          </v-card-actions>
        </template>

        <v-btn @click="activeQuality = false" style="position: absolute;top: 0;right: 0;" icon><v-icon style="font-size: 3.5vh;">mdi-close</v-icon></v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import MyHeader from '@/components/Header'
import MyFooter from '@/components/Footer'
import VerticalList from '@/components/VerticalList'
import PixiCanvas from './components/PixiCanvas'
import MyTabs from './components/Tabs'
import TextEdit from './components/TextEdit'
import PanelDesignArea from './components/PanelDesignArea'
import ColorHistry from './components/ColorHistry'
import { loadFont } from '@/js/font'
import Handwrite from './components/Handwrite'

export default {
  name: 'Design',
  components: {
    MyHeader,
    MyFooter,
    PixiCanvas,
    MyTabs,
    VerticalList,
    TextEdit,
    PanelDesignArea,
    ColorHistry,
    Handwrite
  },
  data () {
    return {
      activeText: false,
      colorList: [],
      activeHandwrite: false,
      activeQuality: false,
      qualityImage: [],
      qualityList: [],
      dialogWidth: '500px',
      dialogHeight: '',
      qualityType: 0 // 0清晰 1粗糙 2粗糙+不可 3不可
    }
  },
  mounted () {
    if (this.$refs.verticalList) {
      this.$refs.verticalList.setColor(this.$store.state.ui.color2d)
    }
    if (this.$store.state.ui.os.isPC) {
      this.dialogHeight = '80vh'
      this.dialogWidth = '800px'
    } else {
      this.dialogHeight = '60vh'
      this.dialogWidth = '500px'
    }
  },
  watch: {
    async '$store.state.ui.activeKuapian' (val) {
      if (val) {
        await this.$nextTick()
        this.$refs.dialogContentRef.scrollTop = 0
      }
    },
    '$store.state.design.shareuc.designData.ptype' (val) {
      if (val !== 'gift') {
        if (this.$store.state.ui.os.isPC) {
          this.dialogHeight = '80vh'
          this.dialogWidth = '800px'
        } else {
          this.dialogHeight = '60vh'
          this.dialogWidth = '500px'
        }
      } else {
        this.dialogHeight = 'auto'
        this.dialogWidth = '500px'
      }
    },
    '$store.state.ui.color2d' (val) {
      console.log('监听color2d', val)
      this.$refs.verticalList.setColor(val)
    },
    '$store.state.ui.designSleeve' (val) {
      if (val) {
        this.$store.state.ui.designSleeve = false
        this.$store.state.design.shareuc.isSleeveDesigned = true
        this.$refs.pixiCanvas.switchDesignArea({
          designArea: 'sleeve',
          resetHistory: true
        })
      }
    }
  },
  computed: {
    qualityTitle () {
      if (this.qualityType === 3) {
        return 'プリント不可'
      } else if (this.qualityType === 2) {
        return '画像が粗い・プリント不可'
      } else if (this.qualityType === 1) {
        return '画像が粗い'
      } else {
        return '画像が鮮明'
      }
    },
    activeUndoRedo () {
      if (
        this.$store.state.brand.brandJson &&
        this.$store.state.brand.brandJson.setting.history &&
        this.$store.state.brand.brandJson.setting.history.value
      ) {
        return true
      } else {
        return false
      }
    },
    verticalList () {
      var ret = []
      if (
        !this.$store.state.brand.brandJson ||
        !this.$store.state.brand.brandJson.setting
      ) {
        return []
      }
      if (
        this.$store.state.brand.brandJson.setting.addLogo &&
        this.$store.state.brand.brandJson.setting.addLogo.value === true
      ) {
        ret.push({
          img: require('@/assets/images/addlogo.png'),
          title: this.$t('lang.titleAddLogo'),
          tag: '/addlogo'
        })
      }
      if (
        this.$store.state.design.shareuc.product &&
        this.$store.state.design.shareuc.product.showDesignArea === true
      ) {
        ret.push({
          img: require('@/assets/images/designArea.png'),
          title: 'Design for Accessory',
          tag: '/designArea'
        })
      } else if (
        this.$store.state.design.shareuc.product &&
        this.$store.state.design.shareuc.product.sleeve &&
        this.$store.state.design.shareuc.designData.ptype === 'umb'
      ) {
        ret.push({
          img: require('@/assets/images/sleeve.png'),
          title: this.$t('lang.titleDesignSleeve'),
          tag: '/sleeve'
        })
      }
      if (
        this.$store.state.brand.brandJson.setting.capture2d &&
        this.$store.state.brand.brandJson.setting.capture2d.value
      ) {
        ret.push({
          img: require('@/assets/images/download.png'),
          title: 'download',
          tag: '/download'
        })
      }
      if (this.$store.state.design.shareuc.designData.designid.endsWith('e')) {
        ret.push({
          img: require('@/assets/images/color.png'),
          title: 'color',
          tag: '/color',
          desc: 'ふちの色'
        })
      }
      return ret
    }
  },
  methods: {
    change2d () {
      this.$refs.pixiCanvas.downItemBefore()
    },
    onConfirmQuality () {
      this.activeQuality = false
      this.to3d(true)
    },
    zoomIn (index) {
      this.$refs.pixiCanvas.zoomIn(index)
    },
    zoomOut () {
      this.$refs.pixiCanvas.zoomOut()
    },
    handwrite () {
      this.activeHandwrite = true
    },
    getLastColor () {
      this.$refs.pixiCanvas.getLastColor()
    },
    selectFont (font) {
      this.$refs.pixiCanvas.selectFont(font)
    },
    changeColor (data) {
      this.$refs.pixiCanvas.changeColor(data)
    },
    cancelFileSize () {
      this.$store.state.ui.showFileSizeConfirm = false
    },
    confirmFileSize () {
      this.$store.state.ui.showFileSizeConfirm = false
      this.$refs.pixiCanvas.confirmFileSize()
    },
    undo () {
      this.$refs.pixiCanvas.undo()
    },
    redo () {
      this.$refs.pixiCanvas.redo()
    },
    addText () {
      if (!this.isFontsLoaded) {
        this.isFontsLoaded = true
        this.$store.getters.getFontList.forEach(font => {
          loadFont(font)
        })
      }
      this.activeText = true
      this.$refs.pixiCanvas.addText()
      // 隐藏遮罩
      if (this.$store.state.design.shareuc.designData.ptype === 'scarf') {
        this.$refs.pixiCanvas.setMask(false)
      }
    },
    downloadImages: function () {
      this.$refs.pixiCanvas.downloadImages()
    },
    selectColor: function (color) {
      if (this.$store.state.design.shareuc.designData.ptype === 'umb') {
        this.$store.state.design.shareuc.designData.handleColor = color
        this.$store.state.design.shareuc.designData.umbColor = color
        this.$refs.pixiCanvas.changePatchesColor(color)
      } else if (
        this.$store.state.design.shareuc.designData.ptype === 'scarf'
      ) {
        this.$refs.pixiCanvas.changeEdgeColor(color)
      }
    },
    clickVerticalBtn: function (item) {
      console.log('2d btn', item)
      if (item.indexOf('area!') > -1) {
        const area = item.split('area!')[1]
        this.$refs.pixiCanvas.switchDesignArea({
          designArea: area,
          resetHistory: true
        })
      } else if (item.indexOf('/sleeve') > -1 || item.indexOf('/product_bag') > -1) {
        if (this.$store.state.design.shareuc.designArea === 'sleeve') {
          this.$refs.pixiCanvas.switchDesignArea({
            designArea: 'umb',
            resetHistory: true
          })
        } else {
          this.$store.state.design.shareuc.isSleeveDesigned = true
          this.$refs.pixiCanvas.switchDesignArea({
            designArea: 'sleeve',
            resetHistory: true
          })
        }
      } else if (item.indexOf('/addlogo') > -1) {
        this.$refs.tabs.clickTabBar('album', true)
      } else if (item.indexOf('/designArea') > -1) {
        this.$store.state.ui.activeDesignArea = !this.$store.state.ui.activeDesignArea
        if (!this.$store.state.ui.activeDesignArea) {
          this.$refs.pixiCanvas.switchDesignArea({
            designArea: 'umb',
            resetHistory: true
          })
        }
      } else if (item.indexOf('/download') > -1) {
        this.downloadImages()
      } else if (item.indexOf('/mirror') > -1) {
        this.$refs.pixiCanvas.setMirror()
      } else if (item.indexOf('/history') > -1) {
        this.showHistory = !this.showHistory
      } else if (item.indexOf('/color') > -1) {
        // 选中丝巾边
        this.$store.state.ui.colorType = 'edge'
        this.getLastColor()
        this.$store.state.design.shareuc.currentColor = ''
        this.$router.push('/color')
      }
    },
    getQualityPosition (designArea, designid, index) {
      const ratioLeft = this.$store.state.ui.os.isPC ? 1 : 0.6
      const ratioTop = this.$store.state.ui.os.isPC ? 1 : 0.5
      let ret = { left: 200, top: 200 }
      if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        if (this.$store.state.design.shareuc.designData.pid === 'Hat04') {
          if (designArea === 'umb') {
            if (this.$store.state.design.shareuc.designData.designid === 'hat_3abc') {
              if (index === 0) {
                ret = { left: 200, top: 300 }
              } else if (index === 1) {
                ret = { left: 100, top: 150 }
              } else if (index === 2) {
                ret = { left: 300, top: 150 }
              }
            } else if (this.$store.state.design.shareuc.designData.designid === 'hat_6s' || this.$store.state.design.shareuc.designData.designid === 'hat_6abc') {
              if (index === 0) {
                ret = { left: 120, top: 300 }
              } else if (index === 1) {
                ret = { left: 80, top: 180 }
              } else if (index === 2) {
                ret = { left: 130, top: 80 }
              } else if (index === 3) {
                ret = { left: 250, top: 80 }
              } else if (index === 4) {
                ret = { left: 300, top: 180 }
              } else if (index === 5) {
                ret = { left: 260, top: 300 }
              }
            }
          } else if (designArea === 'sleeve') {
            ret = { left: 200, top: 250 }
          } else if (designArea === 'logoend') {
            ret = { left: 200, top: 100 }
          }
        } else if (this.$store.state.design.shareuc.designData.pid === 'Hat05') {
          if (designArea === 'sleeve' || designArea === 'logoend') {
            if (index === 0) {
              ret = { left: 200, top: 150 }
            } else if (index === 1) {
              ret = { left: 200, top: 250 }
            }
          } else if (designArea === 'belt') {
            if (index === 0) {
              ret = { left: 100, top: 250 }
            } else if (index === 1) {
              ret = { left: 300, top: 250 }
            }
          }
        }
      } else {
        switch (designid) {
          case '8aw':
            if (index === 0) {
              ret = { left: 200, top: 350 }
            } else if (index === 0) {
              ret = { left: 200, top: 100 }
            }
            break
          case '8ab':
            if (index === 0) {
              ret = { left: 200, top: 300 }
            } else if (index === 1) {
              ret = { left: 200, top: 100 }
            }
            break
          case '8s':
          case '8abcd2':
            if (index === 0) {
              ret = { left: 200, top: 350 }
            } else if (index === 1) {
              ret = { left: 85, top: 300 }
            } else if (index === 2) {
              ret = { left: 60, top: 200 }
            } else if (index === 3) {
              ret = { left: 90, top: 100 }
            } else if (index === 4) {
              ret = { left: 200, top: 50 }
            } else if (index === 5) {
              ret = { left: 310, top: 100 }
            } else if (index === 6) {
              ret = { left: 340, top: 200 }
            } else if (index === 7) {
              ret = { left: 315, top: 300 }
            }
            break
          case 'A2':
          case 'A2e':
            if (index === 0) {
              ret = { left: 100, top: 100 }
            } else if (index === 1) {
              ret = { left: 300, top: 300 }
            }
            break
          case 'A3':
          case 'A3e':
            if (index === 0) {
              ret = { left: 100, top: 200 }
            } else if (index === 1) {
              ret = { left: 300, top: 200 }
            }
            break
          case 'B4':
          case 'B4e':
            if (index === 0) {
              ret = { left: 200, top: 100 }
            } else if (index === 1) {
              ret = { left: 200, top: 300 }
            }
            break
          case 'B2':
          case 'B2e':
            if (index === 0) {
              ret = { left: 150, top: 100 }
            } else if (index === 1) {
              ret = { left: 250, top: 300 }
            }
            break
          case 'B3':
          case 'B3e':
            if (index === 0) {
              ret = { left: 100, top: 200 }
            } else if (index === 1) {
              ret = { left: 300, top: 200 }
            }
            break
        }
      }
      ret.left *= ratioLeft
      ret.top *= ratioTop
      return ret
    },
    getQualityTitle (quality) {
      if (quality < 50) {
        return 'プリント不可'
      } else if (quality >= 50 && quality < 100) {
        return '画像が粗い'
      } else {
        return ''
      }
    },
    async to3d (skip = false) {
      if (!skip) {
        this.qualityImage = []
        this.qualityList = []
        const designArea = this.$store.state.design.shareuc.designArea
        let isLow = false
        let isMiddle = false
        Object.keys(this.$store.state.design.shareuc.designData.inprint).forEach(key => {
          let isLow_ = false
          let isMiddle_ = false
          const list = this.$store.state.design.shareuc.designData.inprint[key].map((item, index) => {
            return {
              quality: item.quality,
              position: this.getQualityPosition(key, this.$store.state.design.shareuc.designData.designid, index),
              title: this.getQualityTitle(item.quality)
            }
          })
          list.forEach(item => {
            if (item.quality < 50) {
              isLow = true
              isLow_ = true
            } else if (item.quality >= 50 && item.quality < 100) {
              isMiddle = true
              isMiddle_ = true
            }
          })
          if (isLow_ || isMiddle_) {
            this.switchDesignArea(key)
            this.qualityImage.push(this.$refs.pixiCanvas.capture(true))
            this.qualityList.push(list)
          }
        })
        // 0清晰 1粗糙 2粗糙+不可 3不可
        if (isLow && !isMiddle) {
          this.qualityType = 3
        } else if (isLow && isMiddle) {
          this.qualityType = 2
        } else if (isMiddle && !isLow) {
          this.qualityType = 1
        } else {
          this.qualityType = 0
        }
        if (this.qualityType !== 0) {
          this.activeQuality = true
          this.switchDesignArea(designArea)
          return
        }
      }
      this.$refs.pixiCanvas.capture()
      this.$store.state.ui.update3d = true
      this.$router.push('/view3d')
    },
    clickLeft () {
      this.$store.state.design.shareuc.created = ''
      this.$store.state.ui.activeDesignArea = false
      this.$refs.tabs.tab = 'tab-5'
      if (this.$store.state.ui.homeIndex === 0) {
        this.$router.push('/umb')
      } else if (this.$store.state.ui.homeIndex === 1) {
        this.$router.push('/scarf')
      } else if (this.$store.state.ui.homeIndex === 2) {
        this.$router.push('/cap')
      }
      // 清空设计缓存
      this.$store.state.design.cacheKeys.forEach(item => {
        localStorage.removeItem(item)
        console.log('清空设计', item)
      })
      this.$store.state.design.cacheKeys = []
      localStorage.removeItem('cache_design_keys')
    },
    clickRight () {
      this.$store.commit('setIframe', {
        title: '',
        url: this.$store.state.config.jp
          ? this.$store.state.config.urls.domain + 'app/help/jp.html'
          : this.$store.state.config.urls.domain + 'app/help/cn.html',
        from: '/design',
        showAgree: false
      })
    },
    changePatchTexture (params) {
      this.$refs.pixiCanvas.changePatchTexture(params)
    },
    selectAlbum (params) {
      this.$refs.pixiCanvas.selectAlbum(params)
    },
    addLogoBySRC (params) {
      this.$refs.pixiCanvas.addLogoBySRC(params)
    },
    changeZoom (val) {
      this.$refs.pixiCanvas.changeZoom(val)
    },
    endZoom () {
      this.$refs.pixiCanvas.endZoom()
    },
    changeRotate (val) {
      this.$refs.pixiCanvas.changeRotate(val)
    },
    endRotate () {
      this.$refs.pixiCanvas.endRotate()
    },
    changeText (val) {
      this.$refs.pixiCanvas.changeText(val)
    },
    changeTextColor (val) {
      this.$refs.pixiCanvas.changeTextColor(val)
    },
    changeLogoColor (val) {
      this.$refs.pixiCanvas.changeLogoColor(val)
    },
    removeImage () {
      this.$refs.pixiCanvas.removeImage()
    },
    switchDesignArea (val) {
      // console.log('switchDesignArea', val)
      this.$refs.pixiCanvas.switchDesignArea({
        designArea: val,
        resetHistory: true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #888888;
}
.pagePC {
  display: flex;
  flex-direction: row;
}
.leftContainer {
  width: 73vw;
  height: 100%;
  border: none;
}
.rightContainer {
  width: 27vw;
  height: 100%;
  border: none;
  background-color: #ececec;
  display: flex;
  flex-direction: column;
  position: relative;
}
.disabledBtn {
  opacity: 0.6;
  cursor: not-allowed;
}
.historyContainerPC {
  position: absolute;
  margin: 10px;
  top: 8vh;
  left: 0;
  z-index: 1;
}
.historyContainer {
  position: absolute;
  top: 15vh;
  left: 0;
  z-index: 1;
}
.footer-title {
  background-color: black;
  color: white;
}
.color-history {
  position: absolute;
  right: 27vw;
}
.smallText {
  transform: scale(0.5);
}
.fontSmall {
  font-size: small !important;
}
</style>
