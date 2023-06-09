<template>
  <div class="page">
    <three-canvas
      class="threeCanvas"
      :style="`height: ${contentHeight}px;`"
      ref="threeCanvas"
    >
    </three-canvas>
    <horizon-list
      ref="horizonList"
      :list="horizonList"
      :horizonStyle="horizonStyle"
      :click="clickHorizon"
    ></horizon-list>
    <vertical-list
      ref="verticalList"
      type="3d"
      :color="color3d"
      :list="verticalList"
      scene="view3d"
      :colorList="colorList"
      :selectColor="selectColor"
    ></vertical-list>
    <my-footer class="footer">
      <slot>
        <template v-if="isLine">
          <button
            title="友だち追加"
            text
            @click="addLine"
            height="7vh"
            style="min-width: 100%;background-color: #00c300;color: white;text-transform: capitalize;font-size: 2vh;padding: 10px;"
          >
            <img
              style="height: 5vh;vertical-align: middle;"
              :src="require(`@/assets/images/platform-line.png`)"
            />
            友だち追加
          </button>
        </template>
        <template v-else>
          <button
            :title="$t('lang.buy')"
            text
            @click="startDesign"
            height="7vh"
            style="min-width: 50%;background-color: black;color: white;text-transform: capitalize;font-size: 2vh;padding: 10px;"
          >
            {{ $t('lang.buy') }}
          </button>
          <v-divider inset vertical></v-divider>
          <button
            :title="$t('lang.titleShare')"
            text
            @click="shareDesign"
            height="7vh"
            style="border-left: 1px solid white;min-width: 50%;background-color: black;color: white;text-transform: capitalize;font-size: 2vh;padding: 10px;"
          >
            {{ $t('lang.titleShare') }}
          </button>
        </template>
      </slot>
    </my-footer>
  </div>
</template>

<script>
import MyFooter from '@/components/Footer'
import HorizonList from '@/components/HorizonList'
import ThreeCanvas from '@/components/ThreeCanvas'
import * as THREE from 'three'
import axios from 'axios'
import utils from '@/js/utils'
import VerticalList from '@/components/VerticalList'

export default {
  name: 'View3d',
  components: {
    MyFooter,
    ThreeCanvas,
    HorizonList,
    VerticalList
  },
  data () {
    return {
      contentHeight: window.innerHeight * 0.93,
      product: null,
      option: null,
      designData: {},
      gender: 'female',
      horizonList: [],
      horizonStyle: {
        backgroundColor: 'lightgray'
      },
      isLine: false,
      color3d: ''
    }
  },
  watch: {
    '$store.state.brand.loadJsonComplete': function () {
      this.init()
    }
  },
  computed: {
    colorList () {
      if (this.product && this.product.gender === 'female') {
        return this.product.colorList || []
      } else {
        return []
      }
    },
    verticalList () {
      var ret = []
      if (this.designData.ptype === 'gift') {
        ret.push({
          img: require('@/assets/images/color.png'),
          title: 'color',
          tag: '/color'
        })
      }
      return ret
    }
  },
  mounted () {
    if (this.$store.state.brand.loadJsonComplete) {
      this.init()
    }
  },
  methods: {
    selectColor: function (color) {
      console.log('selectColor', color)
      this.$store.commit('setHandleColor', color)
      this.$refs.threeCanvas.changeClothColor(color)
    },
    init: async function () {
      var id = this.$route.query.id

      var img = ''
      var pid = ''
      var opid = ''
      var ptype = ''
      var type3d = ''
      var color = ''
      var type = ''
      var ucolor = ''

      if (typeof id !== 'undefined') {
        // 读取url中的订单号
        let orderInfo = null
        let res = null
        let isOld = false
        try {
          res = await this.getOrder(`${this.$store.state.config.urls.taskUrl}${id}`)
          orderInfo = res.data.data
          if (!orderInfo) {
            throw new Error('订单不存在')
          }
          console.log('订单1', res.data, orderInfo)
        } catch (error) {
          res = await this.getOrder(`https://jp.shareuc.com/order/task/${id}`)
          orderInfo = res.data.iterms[0]
          console.log('订单2', res.data, orderInfo)
          isOld = true
        }
        // 读取json
        let res_ = null
        let jsonName = ''
        try {
          if (isOld) {
            res_ = await axios.get(`${this.$store.state.config.urls.downUrl}${orderInfo.name}.json?time=${new Date().getTime()}`)
          } else {
            jsonName = orderInfo.name ? orderInfo.name : `${orderInfo.order_sn}_${orderInfo.brand}_(${orderInfo.order_type})-${orderInfo.order_area}-${orderInfo.store || ''}`
            res_ = await axios.get(`${this.$store.state.config.urls.downUrl}${jsonName}.json`)
          }
        } catch (error) {
          console.error(error)
          res_ = await axios.get(`${'https://app.shareuc.com/'}${orderInfo.name}.json?time=${new Date().getTime()}`)
        }
        var designInfo = res_.data.design
        this.designData = designInfo
        console.log('json', res_)
        if (res_.status !== 200) return
        pid = orderInfo.umb
        if (!pid) {
          pid = res_.data.design.pid
        }
        console.log('pid', pid)
        img = isOld ? orderInfo.name : jsonName
        opid = parseInt(orderInfo.handle)
        // 修复C,D伞头为-1
        if ((pid === 'C' || pid === 'D') && opid === -1) {
          opid = 0
        }
        if (orderInfo.color) {
          color = orderInfo.color.replace('#', '0x')
        }
        ptype = designInfo.ptype
        type3d = designInfo.type3d
        type = designInfo.type
        if (designInfo.umbColor) {
          ucolor = designInfo.umbColor.replace('#', '0x')
        }
      } else if (this.$store.state.share !== null) {
        img = this.$store.state.share.img
        pid = this.$store.state.share.pid
        opid = this.$store.state.share.opid
        ptype = this.$store.state.share.ptype
        type3d = this.$store.state.share.type3d
        color = this.$store.state.share.color.replace('#', '0x')
        type = this.$store.state.share.type
        ucolor = this.$store.state.share.ucolor.replace('#', '0x')
      } else {
        return
      }

      this.designData.ptype = ptype
      this.designData.pid = pid
      this.designData.opid = opid
      this.designData.type3d = type3d
      this.designData.type = type
      this.designData.umbColor = ucolor
      this.designData.handleColor = color
      this.$store.state.brand.brandJson[ptype].some((item, index) => {
        if (item.id === pid) {
          this.product = item
          return true
        }
      })
      if (ptype === 'umb') {
        this.horizonStyle.backgroundColor = ''
        this.$store.state.brand.brandJson.handles.some((item, index) => {
          if (item.id === Number(opid)) {
            this.option = item
            return true
          }
        })
      }
      if (ptype === 'mask') {
        this.gender = this.designData.type3d
      }
      if (!this.product) return
      const url = this.$store.state.config.urls.downUrl
      this.product.designArea.forEach(item => {
        if (item === 'umb') {
          if (ptype === 'umb') {
            this.designData.type3d = 'open'
          }
          this.$store.state.design.textures[
            item
          ] = new THREE.TextureLoader().load(`${url}${img}.jpg`)
        } else {
          this.$store.state.design.textures[
            item
          ] = new THREE.TextureLoader().load(
            `${url}${img}_${utils.uperFirst(item)}.jpg`
          )
        }
      })
      this.designData.handleColor = color
      setTimeout(() => {
        this.$refs.threeCanvas.loadThree(
          this.designData,
          this.product,
          this.option
        )
        if (ptype === 'scarf') {
          this.$refs.threeCanvas.changeClothColor(color)
          this.$refs.verticalList.setColor(color.replace('0x', '#'))
        }
        if (ptype === 'gift') {
          this.$refs.threeCanvas.changeLineColor(designInfo.lineColor)
          this.$refs.threeCanvas.changeHookColor(designInfo.hookColor)
          this.$refs.threeCanvas.changeInsideColor(designInfo.insideColor)
        }
      }, 1)
      this.setHorizonList()
    },
    addLine: function () {
      window.open('https://line.me/R/ti/p/%40790oqfzd', '_blank')
    },
    setHorizonList () {
      var ret = []
      if (this.designData.ptype === 'umb') {
        if (this.product !== null) {
          if (this.product.open === true) {
            ret = [
              {
                img: require('@/assets/images/open.png'),
                title: this.$t('lang.titleUmbOpen')
              }
            ]
          }
          if (this.product.fold === true) {
            ret.push({
              img: require('@/assets/images/fold.png'),
              title: this.$t('lang.titleUmbFold')
            })
          }
          if (this.product.sleeve === true) {
            ret.push({
              img: require('@/assets/images/sleeve.png'),
              title: this.$t('lang.titleUmbSleeve')
            })
          }
        }
      } else if (this.designData.ptype === 'scarf') {
        for (let i = 0; i < this.product.silkstatus; i++) {
          ret.push({
            img: require('@/assets/images/' + this.product.sprite + '_' + (i + 1) + '.png'),
            status: i + 1,
            title: ''
          })
        }
      }
      this.horizonList = ret
    },
    getOrder: function (url) {
      return new Promise((resolve, reject) => {
        axios.get(url).then(res => {
          resolve(res)
        })
      })
    },
    getJson: function (id) {
      return new Promise((resolve, reject) => {
        const url = this.$store.state.config.urls.downUrl
        axios.get(`${url}${id}.json`).then(res => {
          resolve(res)
        })
      })
    },
    downloadImages: function () {
      this.$refs.threeCanvas.downloadImages()
    },
    clickHorizon: function (item) {
      if (this.designData.ptype === 'scarf') {
        this.designData.type3d = item.status
        setTimeout(() => {
          this.$refs.threeCanvas.loadThree(this.designData, this.product, this.option)
        }, 1)
        return
      }
      if (item.img.indexOf('/handle') > -1) {
        if (this.$refs.handleList) {
          this.$refs.handleList.toggle()
        }
      } else if (item.img.indexOf('/download') > -1) {
        this.downloadImages()
      } else {
        var type3d = ''
        if (item.img.indexOf('/open') > -1) {
          type3d = 'open'
        }
        if (item.img.indexOf('/fold') > -1) {
          type3d = 'fold'
        }
        if (item.img.indexOf('/sleeve') > -1) {
          type3d = 'sleeve'
        }
        this.designData.type3d = type3d
        setTimeout(() => {
          this.$refs.threeCanvas.loadThree(
            this.designData,
            this.product,
            this.option
          )
        }, 1)
      }
    },
    startDesign () {
      this.$router.push('/shopcart')
    },
    shareDesign () {
      this.$copyText(window.location.href).then(
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
  }
}
</script>

<style lang="scss" scoped>
.threeCanvas {
  background-image: url('../../assets/images/bg3d.jpg');
  background-size: auto 100%;
  background-repeat: repeat;
  background-position: center;
}
.footer-title {
  background-color: black;
  color: white;
}
.footer {
  display: flex;
}
</style>
