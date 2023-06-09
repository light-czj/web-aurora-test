<template>
  <div class="page">
    <div class="header">
      <div class="title">{{ $store.state.ui.iframe.title }}</div>
      <v-btn class="btnClose" icon @click="close">
        <v-icon style="font-size: 4vh">mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="iframeContainer">
      <iframe style="width: 100%;height: 100%;"
              ref="myiframe"
              scrolling="auto"
              frameborder="0"
              :src="$store.state.ui.iframe.url"
              @load="onIframeLoad">
      </iframe>
    </div>
    <template v-if="$store.state.ui.iframe.showAgree">
      <v-btn text v-if="!agree" style="color: red;" class="btnAgree" disabled>同意してカートに入れる</v-btn>
      <v-btn text v-else style="color: green;" class="btnAgree" @click="clickAgree">同意してカートに入れる</v-btn>
    </template>
  </div>
</template>

<script>
export default {
  name: 'WebView',
  components: {
  },
  data () {
    return {
      agree: false
    }
  },
  mounted () {
    window.addEventListener('message', (event) => {
      var msg = event.data
      if (!msg.cmd) return
      // console.log('iframe消息:', msg.cmd, msg)
      switch (msg.cmd) {
        case 'pantone':
          this.close()
          break
        case 'agree':
          this.agree = msg.data
          break
      }
    })
    this.forbiddenScale()
  },
  methods: {
    clickAgree () {
      this.$store.state.ui.agree = true
      this.close()
    },
    forbiddenScale: function () {
      // 禁止ios捏合缩放
      this.$refs.myiframe.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
          event.preventDefault()
        }
      })
      this.$refs.myiframe.addEventListener('gesturestart', function (event) {
        event.preventDefault()
      })
    },
    close: function () {
      this.$router.push(this.$store.state.ui.iframe.from)
    },
    onIframeLoad: function () {
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  height: 100%;
  width: 100%;
  text-align: center;
  line-height: 7vh;
  border-bottom: 1px solid #e8e8e8;
}
.header {
  position: absolute;
  width: 100%;
  height: 7vh;
  background-color: white !important;
}
.btnClose {
  position: absolute;
  top: 0;
  right: 1vh;
  height: 7vh;
}
.iframeContainer {
  background-color: white;
  margin-top: 7vh;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
.btnAgree {
  position: fixed;
  width: 100%;
  bottom: 0;
  background-color: white;
  height: 7vh;
  min-height: 7vh;
  font-size: 3vh;
  border-top: 1px solid #e8e8e8;
}
</style>
