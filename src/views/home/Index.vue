<template>
  <div class="page">
    <v-container class="logoContainer">
      <v-row>
        <img class="logo mx-auto" src="@/assets/images/logo_shareuc.png" alt="" srcset="">
      </v-row>
    </v-container>
    <div class="full">
      <v-tooltip v-model="showToolTip" bottom>
        <template v-slot:activator="{}">
      <template v-if="$store.state.ui.os.isPC && !$store.state.ui.os.isMini">
      <div class="imageHomePC" @click="clickbg"></div>
      </template>
      <template v-else>
        <div class="imageHome" @click="clickbg"></div>
      </template>
        </template>
        <span style="margin-top: -50px;">Please select the following customizable items</span>
      </v-tooltip>
    </div>
    <my-footer class="footer">
      <slot>
        <div class="productList" ref="productList" :style="{ width: toolbarWidth }">
          <img class="my-auto" height="80%" :src="require(`@/assets/images/product_${item.img}.png`)" alt=""
          v-for="(item, index) in products"
          :key="'category' + index"
          :title="item.title"
          @click="setCategory(index)">
        </div>
      </slot>
    </my-footer>
  </div>
</template>

<script>
import MyFooter from '../../components/Footer'
export default {
  name: 'home',
  components: {
    MyFooter
  },
  data () {
    return {
      showToolTip: false,
      toolBarStyle: {
        width: '100vw',
        height: '7vh'
      },
      naviBarStyle: {
        backgroundColor: '',
        width: '100%'
      }
    }
  },
  computed: {
    toolbarWidth () {
      if (this.$store.state.ui.os.isPC && !this.$store.state.ui.os.isMini) {
        return '30%'
      } else {
        return '100%'
      }
    },
    products () {
      return [
        {
          img: 'umb',
          title: this.$t('lang.titleProductUmb')
        },
        {
          img: 'bag',
          title: this.$t('lang.titleProductBag')
        },
        {
          img: 'gift',
          title: this.$t('lang.titleProductGift')
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    clickbg () {
      this.showToolTip = !this.showToolTip
    },
    setCategory: function (index) {
      this.showToolTip = false
      this.$store.state.ui.homeIndex = index
      if (index === 0) {
        this.$router.push('/umb')
      } else if (index === 1) {
        this.$router.push('/scarf')
      } else {
        this.$router.push('/cap')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-tooltip__content {
    margin-top: -7vh;
  }
  .logoContainer {
    width: 100%;
    position: absolute;
  }
  .logo {
    margin-top: 7vh;
    height: 7vh;
  }
  .imageHomePC {
    width: 100%;
    height: 100%;
    background-position: bottom;
    background-image: url('../../assets/images/home_pc.jpg');
    background-size: cover;
  }
  .imageHome {
    width: 100%;
    height: 100%;
    background-position: bottom;
    background-image: url('../../assets/images/home_phone.jpg');
    background-size: cover;
  }
  .productList {
    height: 7vh;
    display: flex;
    justify-content: space-around;
  }
  .footer {
    display: flex;
    justify-content: center;
  }
</style>
