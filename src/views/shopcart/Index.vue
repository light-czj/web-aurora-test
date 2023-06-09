<template>
  <div class="page">
    <my-header class="header">
      <template v-slot:left>
        <img class="ma-auto" height="80%" :title="$t('lang.titleHome')" src="@/assets/images/back.png" alt="" @click="onLeftClick">
      </template>
      <template v-slot:middle>
        <div :class="{ 'header-title': true, 'title3dPhone': $store.state.ui.os.isPhone }">
          オーダーするデザインの注文番号に✔️を入れてください
        </div>
      </template>
      <template v-slot:right>
        <div :class="{ 'titleRight': true, 'fontSizePhone': $store.state.ui.os.isPhone }" @click="dialog_clear = true">{{ $t('lang.clear') }}</div>
      </template>
    </my-header>
    <div :style="`height: ${height}px;-webkit-overflow-scrolling: touch;overflow-y: scroll; overflow-x: hidden;`">
      <v-row>
        <v-col v-for="(order, index) in lists" :key="'order' + index" cols="12" md="4" sm="6" style="box-sizing: border-box;">
          <shop-cart-item :order="order" :parent="that"></shop-cart-item>
        </v-col>
      </v-row>
      <form name="redirect_form" action="https://aurora-store.jp/api/basket/add.html" method="post">
        <input id="myInput" type="hidden" name="brand_info" value="">
      </form>
    </div>
    <v-btn class="btnBuy" block @click="clickBuy">{{ $t('lang.buy') }}</v-btn>
    <v-dialog
      v-model="dialog_clear"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">{{ $t('lang.confirmClear') }}</v-card-title>

        <v-card-text>
          {{ $t('lang.warningClear') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="dialog_clear = false"
          >
          {{ $t('lang.cancel') }}
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            @click="confirmClear"
          >
            {{ $t('lang.clear') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog_delete"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('lang.remove') }}
        </v-card-title>

        <v-card-text>
          {{ $t('lang.warningRemove') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="dialog_delete = false"
          >
          {{ $t('lang.cancel') }}
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            @click="confirmDelete"
          >
          {{ $t('lang.confirmRemove') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="activeEmail" max-width="290">
      <v-card>
        <v-container>
          <v-text-field
            v-model="email"
            :error-messages="emailErrors"
            label="E-mail"
            required
            @input="$v.email.$touch()"
            @blur="$v.email.$touch()"
          ></v-text-field>
        </v-container>
        <v-card-actions>
          <v-btn @click="sendEmail" block>
            <div class="text-capitalize">Send</div>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import MyHeader from '@/components/Header'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
import ShopCartItem from './components/ShopCartItem'
import { commitProduct } from '@/api/gmo'
import { getCartToken } from '@/api/user'
// eslint-disable-next-line no-unused-vars
import utils from '@/js/utils'
import { getAccessToken } from '@/api/order'
import axios from 'axios'
// eslint-disable-next-line no-unused-vars
function sortFunc (a, b) {
  return b.index - a.index
}
export default {
  name: 'shopcart',
  components: {
    ShopCartItem,
    MyHeader
  },
  mixins: [validationMixin],
  validations: {
    name: { required },
    email: { required, email },
    select: { required },
    checkbox: {
      checked (val) {
        return val
      }
    }
  },
  data () {
    return {
      height: window.innerHeight * 0.78,
      name: '',
      dialog_clear: false,
      dialog_delete: false,
      that: null,
      data: null,
      tab: 0,
      tabs: [{
        type: 'umb'
      }, {
        type: 'scarf'
      }, {
        type: 'gift'
      }],
      tabHeight: 0,
      activeEmail: false,
      email: '',
      url: '',
      agreeURL: ''
    }
  },
  computed: {
    lists () {
      var ret = []
      for (var key in this.$store.state.shopcart.orders) {
        if (key === this.tabs[this.$store.state.ui.homeIndex].type) {
          ret = this.$store.state.shopcart.orders[key].filter(
            item => item.status !== 2 && item.name.indexOf(`_${this.$store.state.config.brand}_` > -1)
          )
        }
      }
      return ret
    },
    emailErrors () {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.email && errors.push('Must be valid e-mail')
      !this.$v.email.required && errors.push('E-mail is required')
      return errors
    }
  },
  mounted () {
    this.that = this
    this.agreeURL = this.$store.state.config.urls.domain + 'share3d/Terms_Aurora_shop.html?sid=' + this.$store.state.brand.sid + '&width=' + window.innerWidth + `&random=${utils.randomWord(3)}`
  },
  watch: {
    '$store.state.ui.agree' (val) {
      if (val) {
        this.clickBuy()
      }
    }
  },
  methods: {
    submit () {
      this.$v.$touch()
    },
    clear () {
      this.$v.$reset()
      this.email = ''
    },
    showEmail (url) {
      this.clear()
      this.activeEmail = true
      this.url = url
    },
    sendEmail () {
      if (this.$v.email.$dirty) {
        console.log('发送邮件', this.email, this.url)
        this.activeEmail = false
        if (process.env.NODE_ENV === 'production') {
          // eslint-disable-next-line no-undef
          Email.send({
            SecureToken: 'bae210d3-170d-46a9-aa38-0248c91e6611',
            To: this.email,
            From: '418525489@qq.com',
            Subject: 'ShareUC 3D',
            Body: this.url
          }).then(
            message => {
              console.log('发送结果', message)
              this.$store.commit('setSnackbar', {
                active: true,
                msg: message,
                color: message === 'OK' ? 'success' : 'error',
                timeout: 2000
              })
            }
          )
        } else {
          // eslint-disable-next-line no-undef
          Email.send({
            Host: 'smtp.qq.com',
            Username: '418525489@qq.com',
            Password: 'upcxgcfsvabvbhae',
            To: this.email,
            From: '418525489@qq.com',
            Subject: 'ShareUC 3D',
            Body: this.url
          }).then(
            message => {
              console.log('发送结果', message)
              this.$store.commit('setSnackbar', {
                active: true,
                msg: message,
                color: message === 'OK' ? 'success' : 'error',
                timeout: 2000
              })
            }
          )
        }
      }
    },
    deleteOrder (name) {
      this.dialog_delete = true
      this.name = name
    },
    confirmDelete () {
      this.dialog_delete = false
      // this.data = deleteCart(this.tabs[this.tab].type, this.name)
      let type = ''
      if (this.$store.state.ui.homeIndex === 0) {
        type = 'umb'
      } else if (this.$store.state.ui.homeIndex === 1) {
        type = 'scarf'
      } else if (this.$store.state.ui.homeIndex === 2) {
        type = 'gift'
      }
      this.$store.commit('deleteShopCart', {
        type,
        name: this.name
      })
      this.$store.commit('saveShopCart')
    },
    async clickBuy () {
      const setting = this.$store.state.brand.brandJson.setting
      if (typeof setting.agree3d === 'undefined' || !setting.agree3d.value) {
        if (!this.$store.state.ui.agree) {
          this.$store.commit('setIframe', {
            title: '',
            url: this.agreeURL,
            from: '/shopcart',
            showAgree: true
          })
          return
        }
      }
      this.$store.state.ui.agree = false
      const array = []
      const orders = this.$store.state.shopcart.orders
      for (var key in orders) {
        if (key === this.tabs[this.$store.state.ui.homeIndex].type) {
          orders[key].map((order, index) => {
            if (order.status === 1) {
              array.push(order)
            }
          })
        }
      }
      if (array.length === 0) return
      this.$store.state.ui.loading = true
      try {
        await getCartToken()
        for (const item of array) {
          await this.setStatus([item])
          await this.postBuy1([item])
        }
        this.postBuy2(array)
        // array.forEach(item => {
        //   item.status = 2
        // })
        this.$store.commit('saveShopCart')
        this.$store.commit('setSnackbar', {
          active: true,
          msg: '購入に成功する',
          color: 'success',
          timeout: 2000
        })
      } catch (err) {
        console.error(err)
        this.$store.commit('setSnackbar', {
          active: true,
          msg: '購入に失敗する',
          color: 'error',
          timeout: 2000
        })
      }
      this.$store.state.ui.loading = false
    },
    async setStatus (array) {
      const token = await getAccessToken()
      const list = []
      this.ordersBuy = ''
      array.forEach(item => {
        const ordersn = item.created.split('_')[0]
        list.push(ordersn)
      })
      console.log('list', list)
      const formData = new FormData()
      formData.append('access_token', token)
      formData.append('order_sn', list.join(','))
      await axios.post('https://cms.shareuc.com/api/order/confirm', formData)
      array.forEach(item => {
        const ordersn = item.created.split('_')[0]
        list.push(ordersn)
        if (this.ordersBuy === '') {
          this.ordersBuy += ordersn
        } else {
          this.ordersBuy += '、' + ordersn
        }
        item.status = 2
      })
    },
    async postBuy1 (array) {
      for (var i = 0; i < array.length; i++) {
        const item = array[i]
        if (item.name.indexOf('(gift') > -1) {
          await commitProduct({
            ids: item.created + '_' + item.customid,
            name: `${item.customname} ${item.size}`,
            note: `${item.customname} ${item.size}`,
            amount: item.amount,
            delivery_type: item.name.indexOf('(scarf') > -1 ? '20220121120409' : '20201223093754',
            url_image: `https://ucjpacc.shareuc.com/shareuc/${item.name}_3d.png`
          })
        } else {
          await commitProduct({
            ids: item.created + '_' + item.customid,
            name: item.customname,
            note: item.customname,
            amount: item.amount,
            delivery_type: item.name.indexOf('(scarf') > -1 ? '20220121120409' : '20201223093754'
          })
        }
      }
    },
    postBuy2: function (array) {
      // 2,shareuc30001,1||2,shareuc30002,1
      let data = ''
      array.forEach((item, index) => {
        if (index > 0) {
          data += '||'
        }
        data += '2,shareuc' + item.created.split('_')[0] + '_' + item.customid + ',' + item.count
      })
      console.log('data2=', data)
      document.getElementById('myInput').setAttribute('value', data)
      document.redirect_form.submit()
    },
    onLeftClick () {
      this.dialog_delete = false
      this.dialog_clear = false
      if (this.$store.state.ui.homeIndex === 0) {
        this.$router.push('/umb')
      } else if (this.$store.state.ui.homeIndex === 1) {
        this.$router.push('/scarf')
      } else if (this.$store.state.ui.homeIndex === 2) {
        this.$router.push('/cap')
      }
    },
    onRightClick () {
      this.dialog_clear = true
    },
    confirmClear () {
      console.log('清空')
      // this.data = clearCart()
      this.$store.commit('clearShopCart', {
        type: this.tabs[this.$store.state.ui.homeIndex].type
      })
      this.$store.commit('saveShopCart')
      this.dialog_clear = false
    }
  }
}
</script>

<style lang="scss" scoped>
.naviBarStyle {
  background-color: #cccccc;
  width: 100%;
  position: absolute;
  z-index: 1;
}
.titleRight {
  height: 7vh;
  line-height: 7vh;
  color: white;
  right: 15px;
  position: absolute;
}
.btnBuy {
  width: 100%;
  height: 7vh;
  min-height: 7vh;
  background-color: black !important;
  color: white;
  font-size: 2vh;
}
.header-title {
  font-size: 2vh;
  color: white;
  background-color: black;
  text-align: center;
}
.header {
  background-color: black !important;
}
.title3dPhone {
  width: 50vw;
  font-size: 10px;
}
.fontSizePhone {
  font-size: 10px;
}
</style>
