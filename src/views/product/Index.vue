<template>
  <div class="page" ref="product" @scroll="onScrollChange">
    <v-container grid-list-sm fluid class="ma-0 pa-0">
      <v-row style="background-color: #e8e8e8;" class="ma-0 pa-0">
        <v-col
          cols="6"
          md="4"
          v-for="(item, index) in products"
          :key="'list' + index"
          class="ma-0 pa-0"
        >
          <template v-if="item.images.length === 1">
            <v-card class="mx-1 my-1 py-0 px-0">
              <template v-if="$store.state.ui.os.isPC">
                <v-img
                  width="75%"
                  contain
                  class="mx-auto white--text align-end"
                  aspect-ratio="0.62"
                  :src="
                    `${$store.state.config.urls.galleryUrl}${item.images[0]}?x-oss-process=image/resize,w_512`
                  "
                >
                </v-img>
                <v-btn
                  block
                  text
                  tile
                  style="color: white;background-color: #231815;"
                  @click="selectProduct(item)"
                >
                  <div style="margin-left: -16px;">次に進む</div>
                </v-btn>
              </template>
              <template v-else>
                <v-img
                  contain
                  class="mx-auto white--text align-end"
                  aspect-ratio="0.62"
                  :src="
                    `${$store.state.config.urls.galleryUrl}${item.images[0]}?x-oss-process=image/resize,w_512`
                  "
                >
                </v-img>
                <v-btn
                  block
                  text
                  tile
                  style="color: white;background-color: #231815;"
                  @click="selectProduct(item)"
                >
                  <div style="margin-left: -16px;">次に進む</div>
                </v-btn>
              </template>
            </v-card>
          </template>
          <v-card v-else class="mx-1 my-1 py-0 px-0">
            <swiper class="ma-0 pa-0">
              <swiper-slide
                class="swiper-slide"
                v-for="(image, index_) in item.images"
                :key="'row' + index_"
              >
                <template v-if="$store.state.ui.os.isPC">
                  <v-img
                    width="75%"
                    contain
                    class="mx-auto white--text align-end"
                    aspect-ratio="0.62"
                    :src="
                      `${$store.state.config.urls.galleryUrl}${image}?x-oss-process=image/resize,w_512`
                    "
                  >
                  </v-img>
                  <v-btn
                    block
                    text
                    tile
                    style="color: white;background-color: #231815;"
                    @click="selectProduct(item)"
                  >
                    <div style="margin-left: -16px;">次に進む</div>
                  </v-btn>
                </template>
                <template v-else>
                  <v-img
                    contain
                    class="mx-auto white--text align-end"
                    aspect-ratio="0.62"
                    :src="
                      `${$store.state.config.urls.galleryUrl}${image}?x-oss-process=image/resize,w_512`
                    "
                  >
                  </v-img>
                  <v-btn
                    block
                    text
                    tile
                    style="color: white;background-color: #231815;"
                    @click="selectProduct(item)"
                  >
                    <div style="margin-left: -16px;">次に進む</div>
                  </v-btn>
                </template>
              </swiper-slide>
              <!-- 分页器 -->
              <!-- <div class="swiper-pagination"  slot="pagination"></div> -->
            </swiper>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
// import axios from 'axios'
export default {
  name: 'Product',
  components: {},
  data: () => ({
    swiperOption: {
      // 显示分页
      pagination: {
        el: '.swiper-pagination'
      },
      // 开启循环模式
      loop: false,
      scrollTopValue: 0
    }
  }),
  activated () {
    /**
     * 定位页面滑动位置，需要配合keepAlive 来使用
     */
    this.$refs.product.scrollTop = this.scrollTopValue
  },
  mounted () {
    // 获取ui尺寸
    this.$store.state.ui.size.stepHeight = this.$refs.product.clientHeight
    const headerHeight =
      window.innerHeight - this.$store.state.ui.size.stepHeight
    this.$store.state.ui.size.tabHeight =
      this.$refs.product.clientHeight - (headerHeight / 8) * 7 * 3
  },
  computed: {
    products () {
      if (this.$store.state.brand.brandJson) {
        return this.$store.state.brand.brandJson.list[this.$store.state.ui.homeIndex].items
      } else {
        return []
      }
    }
  },
  methods: {
    onScrollChange: function ($e) {
      this.scrollTopValue = $e.target.scrollTop
    },
    async selectProduct (item) {
      // 清空设计缓存
      this.$store.state.design.cacheKeys.forEach(item => {
        localStorage.removeItem(item)
        console.log('清空设计', item)
      })
      this.$store.state.design.cacheKeys = []
      localStorage.removeItem('cache_design_keys')
      this.$store.state.design.shareuc.pantone = ''
      this.$store.state.ui.filter = item.filter
      if (item.product === 'gift') {
        this.$store.state.design.shareuc.selectedColor = '#ffffff'
      }
      this.$store.state.ui.galleryIndex = item.gallery || 0
      this.$store.commit('setRow', item)
      this.$store.commit('setProductByid', {
        ptype: item.product,
        id: item.id,
        designid: item.designid
      })
      // 测试加载网络订单
      // const { data } = await axios.get(
      //   'http://ucjpacc.shareuc.com/shareuc/20210129103915_gmo_(umb_8a8)-jp-0.json'
      // )
      // this.$store.state.design.shareuc.designData = data.design
      this.$store.state.ui.activeDesignArea = false
      this.$store.state.design.shareuc.activeSticker = false
      this.$store.state.ui.activeKuapian = true
      this.$router.push('/design')
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  overflow-y: auto;
}
.smallBtn {
  transform: scale(0.3);
}
</style>
