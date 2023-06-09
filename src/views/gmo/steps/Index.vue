<template>
  <div class="page">
    <div class="step ma-0 pa-0">
      <v-stepper
        v-model="$store.state.ui.step"
        steps
        :alt-labels="!$store.state.ui.os.isPC && !$store.state.ui.os.isPad"
      >
        <v-stepper-header style="height: 8vh;">
          <template v-for="n in steps">
            <v-stepper-step
              :key="`${n}-step`"
              :complete="false"
              :step="n"
              :editable="canEdit(n)"
              @click.prevent="clickStep(n)"
            >
              {{ lists[n - 1].title }}
            </v-stepper-step>
            <v-divider v-if="n !== steps" :key="n"></v-divider>
          </template>
        </v-stepper-header>
      </v-stepper>
      <div v-if="!$store.state.ui.os.isPC && !$store.state.ui.os.isPad" class="stepTitle">{{ lists[$store.state.ui.step - 1].title }}</div>
    </div>
    <div class="full" :style="`height: ${contentHeight}px;overflow: hidden;`">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import store from '@/store'
export default {
  name: 'Home',
  components: {},
  data () {
    return {
      steps: 6,
      contentHeight: window.innerHeight * 0.92,
      routes: ['Home', 'Product', 'Design', 'View3d', 'ShopCart', 'Help']
    }
  },
  computed: {
    lists () {
      const title3d = 'プレビューする'
      const title1 = this.$store.state.ui.homeIndex === 0 ? 'デザインをする' : 'スタート'
      const title2 = '種類を選択'
      return [
        {
          title: title1
        },
        {
          title: title2
        },
        {
          title: 'デザインをする'
        },
        {
          title: title3d
        },
        {
          title: '内容確認'
        },
        {
          title: 'よくある質問'
        }
      ]
    }
  },
  mounted () {
    if (!this.$store.state.ui.os.isPC && !this.$store.state.ui.os.isPad) {
      const eles = document.getElementsByClassName('v-stepper__step')
      eles.forEach((ele, index) => {
        ele.style.flexBasis = (window.innerWidth / (this.steps + 1)) + 'px'
        ele.style.marginTop = '0'
        ele.style.paddingTop = '0'
        ele.style.paddingBottom = '0'
        ele.children[0].style.marginBottom = '5px'
        if (index === 5) {
          ele.children[0].style =
            'margin-top: 5px;margin-bottom: 0;transform: scale(0.8);'
        } else {
          ele.children[0].style =
            'margin-top: 5px;margin-bottom: 0;transform: scale(0.8);'
        }
        if (ele.children[2]) {
          ele.children[2].style =
          'display: initial;font-size: 12px;transform: scale(0.8);'
        }
      })
      const dividers = document.getElementsByClassName('v-divider')
      dividers.forEach(divider => {
        divider.style.margin = '16px -16px 0 -16px'
      })
    } else {
      const eles = document.getElementsByClassName('v-stepper__step')
      eles.forEach((ele, index) => {
        if (index === 5) {
          ele.children[0].style.display = 'none'
        }
        // 显示步骤文字
        ele.children[1].style.display = 'initial'
      })
    }
    this.setSetp(this.$route.name)
  },
  watch: {
    '$route.name' (val) {
      this.setSetp(val)
    }
  },
  methods: {
    setSetp (val) {
      console.log('setSetp', val)
      if (val === 'Home') {
        // 重置
        this.$store.state.design.shareuc.row = null
        this.$store.state.ui.loaded3d = false
      }
      this.routes.some((route, index) => {
        if (route === val) {
          this.$store.state.ui.step = index + 1
          return true
        }
      })
    },
    getCartCount () {
      let ret = 0
      const orders = this.$store.state.shopcart.orders
      if (this.$store.state.ui.homeIndex === 0) {
        if (orders.umb) {
          ret = orders.umb.filter(order => order.status !== 2).length
        }
      } else if (this.$store.state.ui.homeIndex === 1) {
        if (orders.scarf) {
          ret += orders.scarf.filter(order => order.status !== 2).length
        }
      } else if (this.$store.state.ui.homeIndex === 2) {
        if (orders.gift) {
          ret += orders.gift.filter(order => order.status !== 2).length
        }
      }
      return ret
    },
    clickStep (n) {
      // 跳转页面时关闭进度条
      this.$store.state.ui.loading = false
      if (n === 5 && this.getCartCount() === 0) {
        store.commit('setSnackbar', {
          active: true,
          msg: 'データが保存されていません',
          color: 'error',
          timeout: 2000
        })
        return
      }
      if (this.$route.name === this.routes[n - 1]) return
      if (!this.canEdit(n)) return
      this.$store.state.ui.step = n
      if (n === 6) {
        this.$store.state.ui.lastPage = this.$route.name
      }
      if (n === 2) {
        if (this.$store.state.ui.homeIndex === 0) {
          this.$router.push('/umb')
        } else if (this.$store.state.ui.homeIndex === 1) {
          this.$router.push('/scarf')
        } else if (this.$store.state.ui.homeIndex === 2) {
          this.$router.push('/cap')
        }
      } else {
        this.$router.push({
          name: this.routes[n - 1]
        })
      }
    },
    canEdit (n) {
      if (n === 3 && !this.$store.state.design.shareuc.row) {
        return false
      }
      if (n === 4 && !this.$store.state.ui.loaded3d) {
        return false
      }
      if (n === 5 && this.getCartCount() === 0) {
        return false
      }
      return true
    }
  }
}
</script>
<style scoped lang="scss">
.step {
  height: 8vh;
  width: 100vw;
  position: absolute;
}
.full {
  margin-top: 8vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.stepTitle {
  position: absolute;
  top: 32px;
  font-size: 10px;
  width: 100%;
  text-align: center;
}
</style>
