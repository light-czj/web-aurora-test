<template>
  <div :class="{ page: true, 'ma-2': $store.state.ui.os.isPC }">
    <template v-if="$store.state.ui.os.isPC">
      <div
        ref="swiper"
        class="swiper-gallery"
        :style="`height:${$store.state.ui.size.tabHeight - 16}px;`"
      >
        <div ref="container" class="swiper-wrapper"></div>
      </div>
    </template>
    <template v-else>
      <div ref="swiper" class="swiper-gallery swiper-gallery-phone">
        <div ref="container" class="swiper-wrapper"></div>
      </div>
    </template>
  </div>
</template>

<script>
import Swiper from 'swiper'
var this_ = null
export default {
  name: 'SwiperGallery',
  data () {
    return {
      parentHeight: 0,
      showEmoji: false,
      swiper: null,
      lastGalleryIndex: -1
    }
  },
  components: {},
  props: {
    row: {
      type: Number,
      default: 2
    }
  },
  watch: {
    '$store.state.brand.loadJsonComplete': function () {
      this.initSwiper()
    },
    '$store.state.ui.galleryIndex': function () {
      this.updateSwiper()
    }
  },
  computed: {
    list () {
      if (!this.$store.state.brand.brandJson) {
        return []
      } else {
        return this.$store.state.brand.brandJson.texture[
          this.$store.state.ui.galleryIndex
        ].images
      }
    }
  },
  methods: {
    updateSwiper: function () {
      if (!this.$store.state.ui.os.isPC) {
        this.updateSwiperPhone()
      } else {
        this.updateSwiperPC()
      }
    },
    updateSwiperPC: function () {
      this.swiper.slideNext(0)
      if (this.lastGalleryIndex === this.$store.state.ui.galleryIndex) return
      var cols = 3
      const width = this.$refs.container.clientWidth
      const list = this.list
      const group = Math.ceil(list.length / cols)
      var slides = []
      var lastGroup = list.length - cols * (group - 1)
      for (var i = 0; i < group; i += 1) {
        var slide = `<div style="width: ${width}px;height: ${width /
          cols}px;display: flex">`
        var count = i === group - 1 ? lastGroup : cols
        for (let j = 0; j < count; j++) {
          var pos = list[i * cols + j].pos || 'bottom'
          if (!list[i * cols + j].id.startsWith('color~')) {
            var url = `url(${this_.$store.state.config.urls.galleryUrl}${list[
              i * cols + j
            ].id.replace(' ', '%20')}.jpg${this_.$store.getters.gallerySize})`
            slide += `<div style="flex: 0 0 ${100 /
              cols}%;background-position: ${pos};background-repeat: no-repeat;background-size: cover;background-image:
${url}" class="gallery~${list[i * cols + j].id}~${i * cols + j}"></div>`
          } else {
            var color = list[i * cols + j].id.replace('color~', '#')
            slide += `<div style="flex: 0 0 ${100 /
              cols}%;background-position: ${pos};background-repeat: no-repeat;background-size: cover;background-color:
${color}" class="gallery~${list[i * cols + j].id}~${i * cols + j}"></div>`
          }
        }
        slide += '</div>'
        slides.push(slide)
      }
      this.swiper.virtual.removeAllSlides()
      if (this.list.length > 0) {
        this.swiper.virtual.appendSlide(slides)
      }
      this.lastGalleryIndex = this.$store.state.ui.galleryIndex
    },
    updateSwiperPhone: function () {
      this.cols = window.innerWidth / (this.parentHeight / this.row)
      const list = this.list
      const group = Math.ceil(list.length / this.row)
      const itemWidth = this.parentHeight / this.row
      var slides = []
      var lastGroup = list.length - this_.row * (group - 1)
      for (var i = 0; i < group; i += 1) {
        var slide = `<div style="width: ${itemWidth}px;height: ${this_.row *
          itemWidth}px;display: flex;flex-direction: column">`
        var count = i === group - 1 ? lastGroup : this_.row
        for (let j = 0; j < count; j++) {
          if (!list[i * this_.row + j].id.startsWith('color~')) {
            var url = `${this_.$store.state.config.urls.galleryUrl}${list[
              i * this_.row + j
            ].id.replace(' ', '%20')}.jpg${this_.$store.getters.gallerySize}`
            slide += `<div style="flex: 0 0 ${100 /
              this_.row}%;height: ${itemWidth}px;background-position: bottom;background-repeat: no-repeat;background-size:
cover;background-image: url(${url})" class="gallery~${
              list[i * this_.row + j].id
            }~${i * this_.row + j}"></div>`
          } else {
            var color = list[i * this_.row + j].replace('color~', '#')
            slide += `<div style="flex: 0 0 ${100 /
              this_.row}%;height: ${itemWidth}px;background-position: bottom;background-repeat: no-repeat;background-size:
cover;background-color: ${color}" class="gallery~${
              list[i * this_.row + j].id
            }~${i * this_.row + j}"></div>`
          }
        }
        slide += '</div>'
        slides.push(slide)
      }
      this.swiper.virtual.removeAllSlides()
      if (this.list.length > 0) {
        this.swiper.virtual.appendSlide(slides)
      }
    },
    initSwiper: function () {
      if (!this.$store.state.ui.os.isPC) {
        this.initSwiperPhone()
      } else {
        this.initSwiperPC()
      }
      this.lastGalleryIndex = this.$store.state.ui.galleryIndex
    },
    initSwiperPC: function () {
      var cols = 3
      const width = this.$refs.container.clientWidth
      const height = this.$refs.container.clientHeight
      const list = this.list
      const group = Math.ceil(list.length / cols)
      const rows = height / (width / cols)
      this.swiper = new Swiper('.swiper-gallery', {
        on: {
          // 点击图库
          click: e => {
            var className = e.target.className
            if (!className.startsWith('gallery~')) return
            var texName = className.split('~')[1]
            var index = Number(className.split('~')[2])
            // console.log('点击图库:', texName, index)
            if (this.showEmoji) {
              console.log('emoji:', texName)
            } else {
              if (texName.startsWith('pantone')) {
                if (this.$store.state.ui.homeIndex === 0) {
                  this.$store.commit('setIframe', {
                    title: '',
                    url:
                      this.$store.state.config.urls.domain +
                      'app/color/index.html?',
                    from: '/design',
                    showAgree: false
                  })
                } else {
                  this.$store.state.ui.colorType = 'umb'
                  this.$emit('getLastColor')
                  this.$store.state.design.shareuc.currentColor = ''
                  this.$router.push('/color')
                }
              } else {
                // region 图库
                if (texName.startsWith('color~')) {
                  this.$parent.changePatchColor(texName.replace('color~', '#'))
                } else {
                  var src = `${this.$store.state.config.urls.galleryUrl}${texName}.jpg${this.$store.getters.textureSize}`
                  this.$emit('changePatchTexture', {
                    src: src,
                    texName: texName,
                    texHeight: 0,
                    realSizeY: 0,
                    pixel: this.list[index].pixel || 72
                  })
                }
                // endregion
              }
            }
          }
        },
        direction: 'vertical',
        slidesPerView: rows,
        centeredSlides: false,
        spaceBetween: 0,
        virtual: {
          slides: (function () {
            var slides = []
            var lastGroup = list.length - cols * (group - 1)
            for (var i = 0; i < group; i += 1) {
              var slide = `<div style="width: ${width}px;height: ${width /
                cols}px;display: flex">`
              var count = i === group - 1 ? lastGroup : cols
              for (let j = 0; j < count; j++) {
                var pos = list[i * cols + j].pos || 'bottom'
                if (!list[i * cols + j].id.startsWith('color~')) {
                  var url = `url(${
                    this_.$store.state.config.urls.galleryUrl
                  }${list[i * cols + j].id.replace(' ', '%20')}.jpg${
                    this_.$store.getters.gallerySize
                  })`
                  slide += `<div style="flex: 0 0 ${100 /
                    cols}%;background-position: ${pos};background-repeat: no-repeat;background-size: cover;background-image:
${url}" class="gallery~${list[i * cols + j].id}~${i * cols + j}"></div>`
                } else {
                  var color = list[i * cols + j].id.replace('color~', '#')
                  slide += `<div style="flex: 0 0 ${100 /
                    cols}%;background-position: ${pos};background-repeat: no-repeat;background-size: cover;background-color:
${color}" class="gallery~${list[i * cols + j].id}~${i * cols + j}"></div>`
                }
              }
              slide += '</div>'
              slides.push(slide)
            }
            return slides
          })()
        }
      })

      if (this.$refs.swiper) {
        this.$refs.swiper.addEventListener('wheel', e => {
          if (e.deltaY < 0) {
            // 向上
            if (this.swiper) {
              this.swiper.slidePrev(3)
            }
          } else {
            // 向下
            if (this.swiper) {
              this.swiper.slideNext(3)
            }
          }
        })
      }
    },
    initSwiperPhone: function () {
      this.cols = window.innerWidth / (this.parentHeight / this.row)
      const list = this.list
      const group = Math.ceil(list.length / this.row)
      const itemWidth = this.parentHeight / this.row
      this.swiper = new Swiper('.swiper-gallery', {
        on: {
          // 点击图库
          click: e => {
            var className = e.target.className
            if (!className.startsWith('gallery~')) return
            var texName = className.split('~')[1]
            var index = Number(className.split('~')[2])
            // console.log('点击图库:', texName, index)
            if (this.showEmoji) {
              console.log('emoji:', texName)
            } else {
              if (texName.startsWith('pantone')) {
                if (this.$store.state.ui.homeIndex === 0) {
                  this.$store.commit('setIframe', {
                    title: '',
                    url:
                      this.$store.state.config.urls.domain +
                      'app/color/index.html?',
                    from: '/design',
                    showAgree: false
                  })
                } else {
                  this.$store.state.ui.colorType = 'umb'
                  this.$emit('getLastColor')
                  this.$store.state.design.shareuc.currentColor = ''
                  this.$router.push('/color')
                }
              } else {
                // region 图库
                if (texName.startsWith('color~')) {
                  this.$parent.changePatchColor(texName.replace('color~', '#'))
                } else {
                  var src = `${this.$store.state.config.urls.galleryUrl}${texName}.jpg${this.$store.getters.textureSize}`
                  this.$emit('changePatchTexture', {
                    src: src,
                    texName: texName,
                    texHeight: 0,
                    realSizeY: 0,
                    pixel: this.list[index].pixel || 72
                  })
                }
                // endregion
              }
            }
          }
        },
        // direction: 'vertical',
        slidesPerView: this.cols,
        centeredSlides: false,
        spaceBetween: 0,
        virtual: {
          slides: (function () {
            var slides = []
            var lastGroup = list.length - this_.row * (group - 1)
            for (var i = 0; i < group; i += 1) {
              var slide = `<div style="width: ${itemWidth}px;height: ${this_.row *
                itemWidth}px;display: flex;flex-direction: column">`
              var count = i === group - 1 ? lastGroup : this_.row
              for (let j = 0; j < count; j++) {
                if (!list[i * this_.row + j].id.startsWith('color~')) {
                  var url = `${this_.$store.state.config.urls.galleryUrl}${list[
                    i * this_.row + j
                  ].id.replace(' ', '%20')}.jpg${
                    this_.$store.getters.gallerySize
                  }`
                  slide += `<div style="flex: 0 0 ${100 /
                    this_.row}%;height: ${itemWidth}px;background-position: bottom;background-repeat: no-repeat;background-size:
cover;background-image: url(${url})" class="gallery~${
                    list[i * this_.row + j].id
                  }~${i * this_.row + j}"></div>`
                } else {
                  var color = list[i * this_.row + j].replace('color~', '#')
                  slide += `<div style="flex: 0 0 ${100 /
                    this_.row}%;height: ${itemWidth}px;background-position: bottom;background-repeat: no-repeat;background-size:
cover;background-color: ${color}" class="gallery~${
                    list[i * this_.row + j].id
                  }~${i * this_.row + j}"></div>`
                }
              }
              slide += '</div>'
              slides.push(slide)
            }
            return slides
          })()
        }
      })
    }
  },
  mounted () {
    this_ = this
    this.parentHeight = parseFloat(getComputedStyle(this.$parent.$el).height)
    if (this.$store.state.brand.loadJsonComplete) {
      this.initSwiper()
    }
  }
}
</script>

<style lang="scss" scoped>
.swiper-gallery-phone {
  width: 100vw;
  height: 12vh;
}
.swiper-gallery-pc {
  width: 27vw;
}
</style>
