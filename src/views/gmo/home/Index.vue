<template>
  <div class="home">
    <div class="swiper-container resize">
        <div class="swiper-wrapper">
          <div class="swiper-slide"><img src="https://gigaplus.makeshop.jp/auroraweb01/ShareUC/システムTOP1.jpg" alt=""></div>
          <div class="swiper-slide"><img src="https://gigaplus.makeshop.jp/auroraweb01/ShareUC/システムTOP2.jpg" alt=""></div>
          <div class="swiper-slide"><img src="https://gigaplus.makeshop.jp/auroraweb01/ShareUC/システムTOP3.jpg" alt=""></div>
          <div class="swiper-slide"><img src="https://gigaplus.makeshop.jp/auroraweb01/ShareUC/システムTOP4.jpg" alt=""></div>
          <div class="swiper-slide"><img src="https://gigaplus.makeshop.jp/auroraweb01/ShareUC/システムTOP5.jpg" alt=""></div>
        </div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>

      <div class="wrapper noselect" style="margin-top: 10px;">
        <p class="txt">
         <strong> 「好きな画像を選ぶだけ」でご自身だけのオリジナル傘が１本から作れます！！</strong><br/>
            <br/>
            【価格（税込）】<br/>
            <strong><font color="red">{{ text }}</font></strong>の２種類です。<br/>
            <br/>
          ・オーダー傘のお届けは、<strong>約１か月</strong>となります。<br/>
            （時期により若干変動いたします。）<br/>
          ・本システムの決済は、<strong>クレジットカードのみ</strong>となります。<br/>
            （その他の決済方法は、対応しておりません。）<br/>
          ・オーダー品と既製品の同時購入は出来ません。<br/>
          ・オーダー傘の原産国は、中国製です。<br/>
            <br/>
            上記をご了承の上、この機会に世界に一つだけのオリジナル傘をオーダーください。<br/><br/>
        </p>
      </div>

      <div class="center mb2">
        <a @click="toPage('product', 0)" class="btn btn--black" style="margin-right: 10px;">伞</a>
        <a @click="toPage('product', 1)" class="btn btn--black">スカーフ</a>
      </div>

      <div class="center">
        <a @click="toPage('help')" class="btn btn--white btn--border-solid linkText">使い方はこちら</a>
      </div>

      <div class="wrapper noselect" style="margin-top: 10px;">
        <p class="txt">
    <strong>  【推奨環境】</strong><br/>
            <br/>
          <strong>＜PC＞</strong><br/>
          【OS】<br/>
          Window10以降、Mac OS 10以降<br/>
          【ブラウザ】<br/>
          Chrome最新バージョン、Safari最新バージョン<br/>
            <br/>
          <strong>＜スマートフォン＞</strong><br/>
          【iphone、iPad】<br/>
          iOS 13以降、Safari最新バージョン<br/>
          【Android】<br/>
          Android 10以降、Chrome最新バージョン<br/>
          ※上記以外の環境の場合、商品購入手続きができない場合がございます<br/>
        </p>
      </div>
  </div>
</template>

<script>
import Swiper from 'swiper'
export default {
  data () {
    return {
      height: window.innerHeight + 'px',
      text: '雨傘：５,５００円　晴雨兼用傘：６,６００円'
    }
  },
  mounted () {
    // eslint-disable-next-line no-unused-vars
    var swiper = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      loop: true,
      speed: 1000,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false
      }
    })
  },
  watch: {
    '$route.name' (val) {
      if (val === 'Home') {
        this.$store.state.design.shareuc.row = null
        this.$store.state.ui.loaded3d = false
      }
    }
  },
  methods: {
    toPage (page, index) {
      if (page === 'product') {
        this.$store.state.ui.homeIndex = index
      }
      this.$store.state.ui.loading = false
      this.$router.push('/' + page)
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
}
.resize img {
  width: 60vw;
}

.center{
  text-align: center;
}

.noselect{
  user-select: none;
}

/* button */
*,
*:before,
*:after {
  -webkit-box-sizing: inherit;
  box-sizing: inherit;
}
html {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: 62.5%;
}
.btn,
a.btn,
button.btn {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  position: relative;
  display: inline-block;
  padding: 1rem 4rem;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  letter-spacing: 0.1em;
  color: #212529;
  border-radius: 0.5rem;
}
.btn--black,
a.btn--black {
  color: #fff;
  background-color: #272727;
}
.btn--black:hover,
a.btn--black:hover {
  color: #fff;
  background: #4d4d4d;
}
.btn--white,
a.btn--white {
  color: #272727;
  background-color: #fff;
}
.btn--white:hover,
a.btn--white:hover {
  color: #272727;
  background: #a1eafc;
}
a.btn--white.btn--border-solid {
  border: 2px solid #272727;
}
.wrapper {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  background: #eee;
}

.txt {
  display: inline-block;
  text-align: left;
  font-size: 13px;
}

/* swiper */
.swiper-container {
  width: 60vw;
  height: 60vw;
}

body {
  background-color:#eeeeee;
}
.txt2 {
  display: inline-block;
  text-align: left;
  font-size: 18px;
}

.mb2{
  margin-bottom: 2em;
}
.mb3{
  margin-bottom: 3em;
}

</style>
