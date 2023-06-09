<template>
  <div style="width: 100%;height: 100%;position: relative;" v-if="$store.state.skin.row">
    <v-container class="px-14 py-0 pb-4" v-if="resultOption">
      <v-img style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
      <div class="mt-4" style="font-weight: bold;font-size: x-large;">foulatelier</div>
      <div class="slide-wrapper">
        <div class="slide" ref="slide">
          <div class="slide-page-wrapper">
            <div v-for="(item, index) in resultOption" class="slide-page" :class="'page' + index" :key="index">
              <div style="display: flex;">
                <v-img style="margin-top: 12px;" :src="`https://uc.shareuc.com/silk/${item.image[0]}`" width="50%" contain class="mx-auto"></v-img>
                <v-img style="margin-top: 12px;" :src="`https://uc.shareuc.com/silk/${item.image[1]}`" width="50%" contain class="mx-auto"></v-img>
              </div>
              <div class="my-4" style="font-weight: bold;">{{ item.result_title }}</div>
              <div v-html="item.result_info" class="desc"></div>
            </div>
          </div>
        </div>
        <div class="dots-wrapper">
          <span
            class="dot"
            v-for="index in resultOption.length"
            :key="index"
            :class="{'active': currentPageIndex === (index - 1)}"></span>
        </div>
      </div>
      <v-img @click="onBuy" style="margin-top: 24px;color: #ffffff;" :src="require(`@/assets/skin/button_buy.png`)" width="50%" contain class="mx-auto flex align-center"></v-img>
      <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="50%" contain class="mx-auto flex align-center">back</v-img>
    </v-container>
  </div>
</template>

<script>
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)

export default {
  data () {
    return {
      currentPageIndex: 0
    }
  },
  computed: {
    resultOption () {
      let index = 0
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1] + this.$store.state.skin.selects[2]) {
        case 0:
        case 1:
          if (this.$store.state.skin.selects[3] === 0) {
            index = 0
          } else {
            index = 2
          }
          break
        case 2:
        case 3:
          if (this.$store.state.skin.selects[3] === 0) {
            index = 1
          } else {
            index = 3
          }
          break
      }
      if (this.$store.state.brand.brandJson) {
        return this.$store.state.brand.brandJson.skin.scarfResult[index].option
      } else {
        return null
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.slide = new BScroll(this.$refs.slide, {
        scrollX: true,
        scrollY: false,
        slide: {
          autoplay: false
        },
        momentum: false,
        bounce: false,
        stopPropagation: true,
        click: true
      })
      this.slide.on('slideWillChange', (page) => {
        this.currentPageIndex = page.pageX
      })
    },
    onBack () {
      this.$router.push('/skin7')
    },
    onBuy () {
      console.log('buy')
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-wrapper {
  width: 100%;
  position: relative;
}
.slide {
  min-height: 1px;
  overflow: hidden;
}
.slide-page-wrapper {
  white-space: nowrap;
}
.slide-page {
  display: inline-block;
  width: 100%;
}
.dots-wrapper {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
}
.dot {
  display: inline-block;
  margin: 0 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: lightgray;
  &.active {
    background: gray;
  }
}
.desc {
  white-space: break-spaces;
  text-align: left;
  font-size: small;
}
</style>
