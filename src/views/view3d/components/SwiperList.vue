<template>
  <div ref="swiperlist" class="swiperlist" :style="`top: ${top}px;`">
    <swiper ref="swiperHandle" class="swiper" :options="swiperOption">
      <swiper-slide v-for="(item, index) in list" :key="'swiperlist' + index">
        <div style="height: 22vh;">
          <template
            v-if="item.id === $store.state.design.shareuc.designData.opid"
          >
            <img
              style="width: 100%;transform: scale(1);"
              :src="
                `${spriteUrl}${item.customid}${item.version}.png?x-oss-process=image/resize,w_128`
              "
              @click="onClick(item, index)"
            />
          </template>
          <template v-else>
            <img
              style="width: 100%;transform: scale(0.65);"
              :src="
                `${spriteUrl}${item.customid}${item.version}.png?x-oss-process=image/resize,w_128`
              "
              @click="onClick(item, index)"
            />
          </template>
          <p style="font-size: 2vh;">
            {{ item.material }}<br />
            {{ item.color }}
          </p>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
export default {
  name: 'swiper-list',
  data () {
    return {
      top: 0,
      elements0Height: 0,
      isShow: true,
      colsTitle: 2,
      scarfColorRow: 2,
      swiperOptionUmb: {
        height: window.innerHeight * 0.085,
        width: window.innerHeight * 0.085,
        spaceBetween: 20,
        centeredSlides: false,
        observer: true,
        observeParents: true
      }
    }
  },
  props: {
    type: {
      default: 'handle',
      type: String
    },
    spriteUrl: {
      default: '',
      type: String
    },
    swiperOption: {
      default: () => {
        return {
          height: window.innerHeight * 0.17,
          width: window.innerHeight * 0.17,
          spaceBetween: 20,
          centeredSlides: false,
          observer: true,
          observeParents: true
        }
      },
      type: Object
    },
    click: {
      default: () => {},
      type: Function
    }
  },
  watch: {},
  computed: {
    list () {
      return this.$store.state.design.shareuc.optionList || []
    }
  },
  activated () {
    const elements = document.getElementsByClassName('swiperlist')
    if (elements && elements.length > 0) {
      if (this.elements0Height === 0) {
        this.elements0Height = elements[0].clientHeight
      }
      this.top =
        window.innerHeight * 0.07 +
        (window.innerHeight * 0.78 - this.elements0Height)
    }
    if (this.$store.state.ui.os.isPC) {
      this.colsTitle = 4
      this.scarfColorRow = 2
    } else {
      this.colsTitle = 2
      this.scarfColorRow = 3
    }
  },
  methods: {
    hide: function () {
      this.isShow = false
      this.$refs.swiperlist.style.display = 'none'
    },
    show: function () {
      this.isShow = true
      this.$refs.swiperlist.style.display = 'initial'
    },
    toggle: function () {
      this.isShow = !this.isShow
      if (this.isShow) {
        if (this.type === 'handle' && this.list.length > 0) {
          this.$refs.swiperlist.style.display = 'initial'
        }
      } else {
        this.$refs.swiperlist.style.display = 'none'
      }
    },
    onClick: function (item, index) {
      this.click(item)
    }
  }
}
</script>

<style lang="scss" scoped>
.swiperlist {
  width: 100%;
  position: absolute;
  background-color: rgb(0.1, 0.1, 0.1, 0.05);
}
.swiper-slide {
  text-align: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  // transition: 300ms;
  transform: scale(0.65);
}
</style>
