<template>
  <div class="header">
    <div class="header-left">
      <slot name="left"></slot>
    </div>
    <div class="header-middle">
      <slot name="middle">
        <div :class="{ btnsContainer: $store.state.ui.os.isPC, btnsContainerPhone: !$store.state.ui.os.isPC }">
          <img v-for="(item,index) in topBtnList" :key="'centerbtn' + index"
            @click="clickTopBtn(item)"
            :class="{ topBtnItem: $store.state.ui.os.isPC, topBtnItemPhone: !$store.state.ui.os.isPC, active: $store.state.design.shareuc.designData.designid === item }"
            :src="require(`@/assets/images/${item}.png`)"
            alt=""
          >
        </div>
      </slot>
    </div>
    <div class="header-right">
      <slot name="right"></slot>
    </div>
    <v-dialog v-model="shoEmojiFilter" max-width="500">
      <div style="height: 180px;background-color: white;">
        <div style="padding: 10px;text-align: center;">好きなスタンプの種類を選択ください。</div>
        <div style="display: flex;padding: 10px;">
          <v-img @click="selectEmoji(index)" style="cursor: pointer;" width="50" v-for="(item, index) in emojiFilters" :key="'emoji' + index" contain :src="item" alt=""></v-img>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import * as axios from 'axios'
export default {
  name: 'Header',
  props: {
    centerType: {
      default: 'none',
      type: String
    }
  },
  data () {
    return {
      shoEmojiFilter: false,
      emojiFilters: [
        'https://ucjpacc.shareuc.com/app/aurora/tex/AA.png',
        'https://ucjpacc.shareuc.com/app/aurora/tex/BA.png',
        'https://ucjpacc.shareuc.com/app/aurora/tex/CA.png',
        'https://ucjpacc.shareuc.com/app/aurora/tex/DA.png',
        'https://ucjpacc.shareuc.com/app/aurora/tex/EA.png'
      ]
    }
  },
  computed: {
    lockSliderks () {
      return false
    },
    topBtnList () {
      var ret = []
      if (!this.$store.state.design.shareuc.product) return []
      if (this.$store.state.design.shareuc.product && this.$store.state.design.shareuc.product.type2dList) {
        return this.$store.state.design.shareuc.product.type2dList
      } else if (this.$store.state.design.shareuc.designData.ptype === 'umb') {
        if (this.$store.state.design.shareuc.row !== null) {
          if (typeof this.$store.state.design.shareuc.row.type2dList !== 'undefined') {
            this.$store.state.design.shareuc.row.type2dList.forEach((item, index) => {
              ret.push(item)
            })
          }
        }
      } else if (this.$store.state.design.shareuc.designData.ptype === 'scarf') {
        if (['silkA', 'silkC', 'silkD'].includes(this.$store.state.design.shareuc.product.id)) {
          ret = ['A1', 'A1e', 'A2', 'A2e', 'A3', 'A3e']
        } else if (['silkB', 'silkE', 'silkF'].includes(this.$store.state.design.shareuc.product.id)) {
          ret = ['B1', 'B1e', 'B4', 'B4e', 'B2', 'B2e', 'B3', 'B3e']
        }
        ret.push('emoji')
        ret.push('handwrite')
        return ret
      } else if (this.$store.state.design.shareuc.designData.ptype === 'bag') {
        ret = ['AA', 'AB', 'backside']
      }
      ret.push('fonts')
      if (this.$store.state.design.shareuc.designData.ptype !== 'scarf') {
        ret.push('handwrite')
      }
      return ret
    }
  },
  filters: {
    ksFilter: function (value) {
      if (value === 9) {
        value = 12
      }
      return value
    }
  },
  methods: {
    selectEmoji (index) {
      this.shoEmojiFilter = false
      this.$store.state.ui.emojiIndex = index
    },
    setSliderKS: function (val) {
      this.sliderks = val
    },
    initDesignList: function () {
      if (!this.$store.state.design.shareuc.product) return
      var val = this.$store.state.design.shareuc.designData.designid
      var ks = this.$store.state.design.shareuc.product.ks
      if (val === '' || ks === 'undefined') return
      this.updateSliderKS(ks)
    },
    updateSliderKS: function () {
      // 判断k数是否支持
      if (this.$store.state.brand.brandJson.setting.ksList && !this.$store.state.brand.brandJson.setting.ksList.value.includes(this.sliderks)) {
        this.ksList = []
        return
      }
      // 根据k数返回接片方式
      if (this.sliderks === 5 || this.sliderks === 9) {
        this.ksList = ['ow', 'oa']
      } else if (this.sliderks === 6) {
        this.ksList = ['6w', '6a6', '6ab', '6aa', '6ab3', '6abc2', '6aw', '6bb', '6s']
      } else if (this.sliderks === 7) {
        this.ksList = ['7w', '7aw', '7a7', '7s']
      } else if (this.sliderks === 8) {
        this.ksList = ['8w', '8aw', '8a8', '8ab4', '8b8', '8s']
      }
    },
    hidePanelKS: function () {
      clearTimeout(this.hoverCtrl)
      this.activePanelKS = false
    },
    leaveSliderKS: function () {
      clearTimeout(this.hoverCtrl)
      this.hoverCtrl = setTimeout(() => {
        this.activePanelKS = false
      }, 200)
    },
    overSliderKS: function () {
      clearTimeout(this.hoverCtrl)
      this.hoverCtrl = setTimeout(() => {
        this.activePanelKS = true
      }, 200)
    },
    clickTopBtn: async function (item) {
      console.log('clickTopBtn', item)
      if (item === 'fonts') {
        this.$emit('addText')
      } else if (item === 'backside') {
        this.$parent.switchBagSide()
      } else if (item === 'emoji') {
        this.shoEmojiFilter = true
        this.$store.state.ui.tab = 'tab-5'
        setTimeout(() => {
          this.$store.state.design.shareuc.activeSticker = true
        }, 0)
      } else if (item === 'handwrite') {
        this.$emit('handwrite')
      } else {
        this.$emit('change2d')
        if (item === 'ow' || item === 'oa') {
          item = this.slliderks + item.substring(1, 2)
        }
        // 保存key
        const currentKey = `design_${this.$store.state.design.shareuc.designData.designid}`
        this.$store.state.design.cacheKeys.push(currentKey)
        localStorage.setItem('cache_design_keys', JSON.stringify(this.$store.state.design.cacheKeys))
        // 保存当前设计
        console.log('保存设计', currentKey)
        // 过滤不可见
        const keys = Object.keys(this.$store.state.design.shareuc.designData.inprint)
        keys.forEach(designarea => {
          const inprint = this.$store.state.design.shareuc.designData.inprint[designarea]
          inprint[0].imagelist = inprint[0].imagelist.filter(item => item.visible)
          inprint[0].textlist = inprint[0].textlist.filter(item => item.visible)
        })
        localStorage.setItem(currentKey, JSON.stringify(this.$store.state.design.shareuc.designData.inprint))
        // this.$store.commit('setDesignid', item)
        // 默认设计
        const defaultDesign = this.$store.state.design.shareuc.product.defaultDesign
        if (defaultDesign && defaultDesign[item]) {
          const { data } = await axios.get(`https://ucjp.shareuc.com/shareuc/${defaultDesign[item]}.json`)
          this.$store.state.design.shareuc.designData.inprint = data.design.inprint
          this.$store.state.design.shareuc.designData.designid = item
          this.$store.state.ui.update2d = true
        } else {
          // 判断缓存
          const cache = localStorage.getItem(`design_${item}`)
          if (cache) {
            console.log('有缓存', `design_${item}`)
            this.$store.state.design.shareuc.designData.inprint = JSON.parse(cache)
            this.$store.state.design.shareuc.designData.designid = item
            this.$store.state.ui.update2d = true
          } else {
            this.$store.commit('setDesignid', item)
          }
        }
        this.$store.state.ui.activeDesignArea = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  z-index: 1;
  width: 100%;
  height: 7vh;
  min-height: 7vh;
  display: flex;
  background-color: #cccccc;
  &-left {
    width: 7vh;
    height: 7vh;
    min-width: 7vh;
    max-width: 7vh;
    left: 0;
    display: flex;
  }
  &-right {
    width: 7vh;
    height: 7vh;
    min-width: 7vh;
    max-width: 7vh;
    right: 0;
    display: flex;
  }
  &-middle {
    width: 100%;
    height: 7vh;
    flex-grow: 1;
    display: flex;
  }
}
.header-middle {
  display: flex;
  height: 100%;
  flex-grow: 1;
  align-items: center;
  justify-content: center;// 水平居中
  position: relative;
}

.btnsContainer {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: calc(27vw - 7vh - 10px);
}

.btnsContainerPhone {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: calc(100vw - 7vh - 10px);
}

.topBtnItem {
  // width: calc((27vw - 7vh - 10px) * 0.1);
  height: calc((27vw - 7vh - 10px) * 0.1);
}

.topBtnItemPhone {
  // width: calc((100vw - 7vh - 10px) * 0.1);
  height: calc((100vw - 7vh - 10px) * 0.1);
}

.ruler {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  margin-right: 10px;
  position: relative;
}

.knob {
  background-image: url('../assets/images/knob.png');
  background-size: contain;
  width: 36px;
  height: 56px;
  margin-top: 80%;
}

.panelks {
  position: absolute;
  width: 300px;
  top: 7vh;
  margin-top: -15px;
  margin-left: -150px;
  left: 50%;
  z-index: 2;
}

.panelks-phone {
  margin-top: 0;
}

.active {
  filter: drop-shadow(1px 0 0 #0382ff) drop-shadow(-1px 0 0 #0382ff) drop-shadow(0 1px 0 #0382ff) drop-shadow(0 -1px 0 #0382ff);
  -webkit-filter: drop-shadow(1px 0 0 #0382ff) drop-shadow(-1px 0 0 #0382ff) drop-shadow(0 1px 0 #0382ff) drop-shadow(0 -1px 0 #0382ff);
}
</style>
