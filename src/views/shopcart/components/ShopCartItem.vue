<template>
  <v-card outlined>
    <v-list-item three-line>
      <v-list-item-avatar tile size="80" style="margin-left: 50px;">
        <v-img contain :src="src" @click="showBigImg(src)"></v-img>
      </v-list-item-avatar>
      <v-list-item-avatar
        tile
        size="80"
        style="margin-left: 0;"
        v-if="showSleeveImg"
      >
        <v-img
          contain
          :src="srcSleeve"
          @error="onError"
          @click="showBigImg(srcSleeve)"
        ></v-img>
      </v-list-item-avatar>
      <template v-if="$store.state.ui.os.isPC">
        <template v-if="order.completed">
          <v-list-item-content>
            <v-list-item-title class="headline mb-1"
              >{{ $t('lang.orderIdTitle')
              }}{{ order.created | orderTitleFilter }}</v-list-item-title
            >
            <v-list-item-title
              class="headline mb-1"
              style="color: red;"
              v-if="order.price !== 0"
              >{{ order.price * order.count }}</v-list-item-title
            >
            <template v-if="order.status === 0">
              <v-img
                :src="require('@/assets/images/cart_unchecked.png')"
                style="position: absolute;top: 0;left: 0;width: 50px;"
                @click="setStatus(1)"
              ></v-img>
            </template>
            <template v-else-if="order.status === 1">
              <v-img
                :src="require('@/assets/images/cart_checked.png')"
                style="position: absolute;top: 0;left: 0;width: 50px;"
                @click="setStatus(0)"
              ></v-img>
            </template>
            <template v-else-if="order.status === 2">
              <v-img
                :src="require('@/assets/images/cart_confirmed.png')"
                style="position: absolute;top: 0;left: 0;width: 50px;"
              ></v-img>
            </template>
            <v-btn absolute icon style="top: 0;right: 0;" @click="deleteOder">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-list-item-content>
        </template>
        <template v-else>
          <v-list-item-content>
            <v-btn absolute icon style="top: 0;right: 0;" @click="deleteOder">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-list-item-content>
        </template>
      </template>
    </v-list-item>
    <template v-if="!$store.state.ui.os.isPC">
      <template v-if="order.completed">
        <v-list-item-content>
          <v-list-item-title class="headline mb-1 text-center"
            >{{ $t('lang.orderIdTitle')
            }}{{ order.created | orderTitleFilter }}</v-list-item-title
          >
          <v-list-item-title
            class="headline mb-1"
            style="color: red;"
            v-if="order.price !== 0"
            >{{ order.price * order.count }}</v-list-item-title
          >
          <template v-if="order.status === 0">
            <v-img
              :src="require('@/assets/images/cart_unchecked.png')"
              style="position: absolute;top: 0;left: 0;width: 50px;"
              @click="order.status = 1"
            ></v-img>
          </template>
          <template v-else-if="order.status === 1">
            <v-img
              :src="require('@/assets/images/cart_checked.png')"
              style="position: absolute;top: 0;left: 0;width: 50px;"
              @click="order.status = 0"
            ></v-img>
          </template>
          <template v-else-if="order.status === 2">
            <v-img
              :src="require('@/assets/images/cart_confirmed.png')"
              style="position: absolute;top: 0;left: 0;width: 50px;"
            ></v-img>
          </template>
          <v-btn absolute icon style="top: 0;right: 0;" @click="deleteOder">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-content>
      </template>
      <template v-else>
        <v-list-item-content>
          <v-btn absolute icon style="top: 0;right: 0;" @click="deleteOder">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-content>
      </template>
    </template>
    <template v-if="order.completed">
      <v-card-actions>
        <v-btn text class="px-0" @click="clickPrint" style="margin-bottom: 20px;margin-right: 15px;margin-left: 20px;border-radius: 20px;background-color: #4a90e2;color: white;">
          <div style="font-size: small;margin: 15px;">オーダーシート</div>
        </v-btn>
        <div class="text-center">
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                text
                class="px-0"
                @click="clickShare"
                v-bind="attrs"
                v-on="on"
                style="margin-bottom: 20px;border-radius: 20px;background-color: #f5a623;color: white;"
              >
                <div style="font-size: small;margin: 15px;">シェアする</div>
              </v-btn>
            </template>
            <v-card>
              <v-card-actions style="overflow-y: auto;">
                <div
                  v-for="(item, index) in btns"
                  :key="'share' + index"
                  class="mx-1"
                >
                  <v-btn icon :title="item" @click="clickShare(item)">
                    <v-img
                      :class="{ 'bigImage': item === '3d' }"
                      aspect-ratio="1"
                      contain
                      :src="require(`@/assets/images/${item}.png`)"
                    ></v-img>
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>
        <v-btn v-if="order.name.indexOf('gift') > -1"  text class="px-0 mx-1" @click="clickAR" style="margin-bottom: 20px;">
          <img
            :src="require('@/assets/images/ar.png')"
            :style="`height: ${height};`"
          />
        </v-btn>
      </v-card-actions>
    </template>
    <template v-else>
      <v-card-actions>
        <template v-if="!order.task">
          <v-progress-linear value="0" height="25">
            <strong>0%</strong>
          </v-progress-linear>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click="newTask"
                ><v-icon>mdi-upload</v-icon></v-btn
              >
            </template>
            <span>{{ $t('lang.save') }}</span>
          </v-tooltip>
        </template>
        <template v-else>
          <v-progress-linear
            v-if="!order.task.fail"
            v-model="order.task.progress"
            height="25"
          >
            <strong>{{ Math.ceil(order.task.progress) }}%</strong>
          </v-progress-linear>
          <template v-else>
            <v-progress-linear color="red darken-2" value="0" height="25">
              <strong>{{ $t('lang.labelSaveFail') }}</strong>
            </v-progress-linear>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="start"
                  ><v-icon>mdi-upload</v-icon></v-btn
                >
              </template>
              <span>{{ $t('lang.save') }}</span>
            </v-tooltip>
          </template>
        </template>
      </v-card-actions>
    </template>

    <v-dialog v-model="previewImg" fullscreen>
      <v-card style="background-color: #06060687;" @click="previewImg = false">
        <div
          style="height: 100vh;width: 100vw;display: flex;justify-content: center;"
        >
          <v-img
            :style="`max-width:${bigImgWidth};`"
            contain
            :src="bigImgSrc"
            @click="previewImg = false"
          ></v-img>
        </div>
        <v-btn
          style="position: absolute;top: 10px; right: 10px;width: 7vh;height: 7vh;"
          icon
          @click="previewImg = false"
          ><v-icon style="color: white;">mdi-close</v-icon></v-btn
        >
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import localforage from 'localforage'
import UploadTask from '@/js/uploadTask.js'
import Vue from 'vue'
import utils from '@/js/utils'
// import VueQrcode from '@chenfengyuan/vue-qrcode'
export default {
  components: {
    // VueQrcode
  },
  props: {
    order: {
      default: () => {},
      type: Object
    },
    updateOrder: {
      default: () => {},
      type: Function
    },
    parent: {
      default: () => {},
      type: Object
    }
  },
  filters: {
    orderTitleFilter (orderId) {
      const index = orderId.indexOf('_')
      if (index > -1) {
        return orderId.substring(0, index)
      } else {
        return orderId
      }
    }
  },
  data () {
    return {
      menu: false,
      btns: ['line', 'facebook', 'twitter', 'ins', 'pinterest', '3d', 'link'],
      height: '30px',
      localStr: '',
      showSleeveImg: true,
      previewImg: false,
      bigImgSrc: '',
      bigImgWidth: 0
    }
  },
  watch: {},
  computed: {
    canEdit () {
      return this.order.status !== 2
    },
    src () {
      if (this.order.completed) {
        if (this.order.name.indexOf('-jp-') > -1) {
          if (this.order.name.indexOf('(gift') > -1) {
            return (
              this.$store.state.config.urls.downUrl +
              this.order.name +
              '_3d.png?x-oss-process=image/resize,w_128'
            )
          } else {
            return (
              this.$store.state.config.urls.downUrl +
              this.order.name +
              '.jpg?x-oss-process=image/resize,w_128'
            )
          }
        } else {
          return (
            this.$store.state.config.urls.downUrl +
            this.order.name +
            '.jpg?imageMogr2/thumbnail/128x'
          )
        }
      } else {
        return this.localSrc
      }
    },
    srcSleeve () {
      if (this.order.completed) {
        if (this.order.name.indexOf('-jp-') > -1) {
          return (
            this.$store.state.config.urls.downUrl +
            this.order.name +
            '_Sleeve.jpg?x-oss-process=image/resize,w_128'
          )
        } else {
          return (
            this.$store.state.config.urls.downUrl +
            this.order.name +
            '_Sleeve.jpg?imageMogr2/thumbnail/128x'
          )
        }
      } else {
        return this.localSrc
      }
    }
  },
  mounted () {
    this.showSleeveImg = this.order.name.indexOf('gift') === -1
    this.bigImgWidth = Math.min(window.innerWidth, window.innerHeight) * 0.9
    if (!this.$store.state.ui.os.isPC) {
      this.height = '20px'
    }
    this.isTask = typeof this.order.task !== 'undefined'
    this.getSrc()
  },
  methods: {
    setStatus (val) {
      this.order.status = val
    },
    clickAR () {
      // if (this.$store.state.ui.os.isPC) {
      // } else {
      //   window.open(`https://jp.shareuc.com/ar/#/?id=${this.order.created}`, '__blank')
      // }
      window.open(`https://jp.shareuc.com/ar/#/?id=${this.order.created}`, '__blank')
    },
    showBigImg (src) {
      if (src) {
        this.previewImg = true
        this.bigImgSrc = src
          .replace('w_128', 'w_1024')
          .replace('/128x', '/1024x')
      }
    },
    onError () {
      console.log('伞套图片加载失败')
      this.showSleeveImg = false
    },
    getSrc () {
      localforage.getItem(this.order.name + '.jpg').then(val => {
        this.localSrc = val
      })
    },
    // 暂停
    pause () {},
    // 继续
    start () {
      this.order.task.start()
    },
    newTask () {
      Vue.set(this.order, 'task', new UploadTask(this.order))
      this.isTask = true
    },
    clickEdit () {
      this.canEdit = !this.canEdit
    },
    click3d () {
      this.$router.push({
        path: '/share',
        query: {
          id: this.order.created
        }
      })
    },
    clickPrint () {
      let url = ''
      // if (this.order.umb === 'Hat04') {
      //   url = `https://jp.shareuc.com/share3d/AuroraOrder_hat04.html?id=${this.order.created}&t=${new Date().getTime()}`
      // } else if (this.order.umb === 'Hat05') {
      //   url = `https://jp.shareuc.com/share3d/AuroraOrder_hat05.html?id=${this.order.created}&t=${new Date().getTime()}`
      // }
      if (this.order.name.indexOf('(scarf_') > -1) {
        url = `https://jp.shareuc.com/share3d/AuroraScarfWeb.html?id=${
          this.order.created
        }&dir=${this.$store.state.config.dir}&random=${utils.randomWord(
          3
        )}&width=${window.innerWidth}`
      } else {
        url = `https://jp.shareuc.com/share3d/auroraWebOrderShop.html?id=${
          this.order.created
        }&dir=${this.$store.state.config.dir}&random=${utils.randomWord(
          3
        )}&width=${window.innerWidth}`
      }
      console.log('查看表单', url)
      window.open(url, '__blank')
    },
    clickShare (type) {
      const url =
        `https://jp.shareuc.com/${this.$store.state.config.dir}/#/share?id=` +
        this.order.created
      if (type === 'line') {
        if (this.$store.state.ui.os.isPC) {
          window.open(
            `https://lineit.line.me/share/ui?url=${encodeURIComponent(url)}`
          )
        } else {
          window.open(`line://msg/text/${encodeURIComponent(url)}`)
        }
      } else if (type === 'facebook') {
        window.open(
          `http://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        )
      } else if (type === 'email') {
        this.parent.showEmail(url)
      } else if (type === 'twitter') {
        window.open(
          `https://twitter.com/share?url=${encodeURIComponent(
            url + '\n#auroraオーダーシステム'
          )}`,
          '_blank'
        )
      } else if (type === 'ins') {
        this.$copyText(url).then(
          () => {
            window.open('https://www.instagram.com/', '_blank')
          },
          () => {}
        )
      } else if (type === 'pinterest') {
        this.$copyText(url).then(
          () => {
            window.open(
              `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
                url
              )}`,
              '_blank'
            )
          },
          () => {}
        )
      } else if (type === '3d') {
        window.open(url, '_blank')
      } else if (type === 'link') {
        this.$copyText(url).then(
          () => {
            this.$store.commit('setSnackbar', {
              active: true,
              msg: this.$t('lang.copySuccess'),
              color: 'success',
              timeout: 2000
            })
          },
          () => {
            this.$store.commit('setSnackbar', {
              active: true,
              msg: this.$t('lang.copyFail'),
              color: 'error',
              timeout: 2000
            })
          }
        )
      }
    },
    increase () {
      this.order.count++
      this.parent.updateData()
    },
    decrease () {
      this.order.count--
      this.parent.updateData()
    },
    change (value) {
      this.order.count = value
    },
    deleteOder () {
      if (this.order.task) {
        this.order.task.cancel()
      }
      this.parent.deleteOrder(this.order.name)
    }
  }
}
</script>

<style scoped lang="scss">
.bigImage {
  transform: scale(1.25);
}
</style>
