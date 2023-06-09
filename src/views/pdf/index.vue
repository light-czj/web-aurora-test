<template>
  <div class="page">
    <div class="header">
      <div class="title"></div>
      <v-btn class="btnClose" icon @click="close">
        <v-icon style="font-size: 4vh">mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="iframeContainer">
      <div style="width: 100%;overflow-y: auto;text-align: center;" :style="{ height: contentHeight }">
        <img v-if="$store.state.ui.os.isPC" src="https://ucjpacc.shareuc.com/assets/pdf/aurora-1.png" style="width: 80%;" />
        <img v-else src="https://ucjpacc.shareuc.com/assets/pdf/aurora-2.png" style="width: 100%;" />
      </div>
    </div>
    <v-btn text style="color: black;" class="btnAgree" @click="clickAgree">デザインをする</v-btn>
  </div>
</template>

<script>
export default {
  name: 'WebView',
  components: {
  },
  data () {
    return {
      agree: false,
      contentHeight: window.innerHeight * 0.86 + 'px'
    }
  },
  mounted () {
  },
  methods: {
    clickAgree () {
      // this.close()
      this.$store.state.ui.activeKuapian = true
      this.$router.push('/design')
    },
    close: function () {
      this.$router.push('/umb')
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
