<template>
  <div
    :style="
      `height: ${height}px;-webkit-overflow-scrolling: touch;overflow-y: scroll;`
    "
  >
    <iframe
      style="width: 100%;height: 100%;"
      scrolling="auto"
      frameborder="0"
      @load="onIframeLoad"
      src="https://aurora-store.jp/view/page/ordersystem?ptk=395e577d2a66e4648871b9e62bad48b8221ba29d"
    >
    </iframe>
  </div>
</template>

<script>
export default {
  name: 'Iframe',
  components: {},
  data () {
    return {
      height: window.innerHeight
    }
  },
  mounted () {
    // this.$store.state.ui.loading = true
    window.addEventListener('message', event => {
      var msg = event.data
      if (!msg.cmd) return
      switch (msg.cmd) {
        case 'redirect':
          this.redirect(msg.data)
          break
      }
    })
  },
  methods: {
    redirect (data) {
      // const page = data.page
      this.$store.state.ui.homeIndex = data.index
      // this.$store.state.ui.loading = false
      if (data.page === 'help') {
        this.$router.push('/help')
      } else if (data.page === 'product') {
        if (data.index === 0) {
          this.$router.push('/umb')
        } else if (data.index === 1) {
          this.$router.push('/scarf')
        } else if (data.index === 2) {
          this.$router.push('/cap')
        }
      }
    },
    onIframeLoad () {
      // this.$store.state.ui.loading = false
    }
  }
}
</script>

<style lang="scss" scoped></style>
