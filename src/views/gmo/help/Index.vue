<template>
  <div :style="`height: ${height}px;`">
    <iframe style="width: 100%;height: 100%;"
            scrolling="auto"
            frameborder="0"
            @load="onIframeLoad"
            :src="src">
    </iframe>
  </div>
</template>

<script>
export default {
  name: 'Iframe',
  components: {
  },
  data () {
    return {
      height: window.innerHeight * 0.92
    }
  },
  computed: {
    src () {
      if (this.$store.state.ui.homeIndex === 0) {
        return 'https://aurora-store.jp/view/page/faq?ptk=395e577d2a66e4648871b9e62bad48b8221ba29d'
      } else if (this.$store.state.ui.homeIndex === 1) {
        return 'https://aurora-store.jp/view/page/faq-scarf?ptk=395e577d2a66e4648871b9e62bad48b8221ba29d'
      } else {
        return 'https://aurora-store.jp/view/page/faq-hat?ptk=395e577d2a66e4648871b9e62bad48b8221ba29d'
      }
    }
  },
  mounted () {
    this.$store.state.ui.loading = true
    window.addEventListener('message', (event) => {
      var msg = event.data
      if (!msg.cmd) return
      switch (msg.cmd) {
        case 'help':
          this.next()
          break
      }
    })
  },
  methods: {
    next () {
      this.$router.push({
        name: this.$store.state.ui.lastPage
      })
    },
    onIframeLoad () {
      this.$store.state.ui.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
