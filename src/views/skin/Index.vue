<template>
  <div>
    <my-header centerType="button">
      <template v-slot:left>
        <img
          class="ma-auto"
          height="80%"
          :title="$t('lang.titleHome')"
          src="@/assets/images/back.png"
          alt=""
          @click="clickLeft"
        />
      </template>
      <template v-slot:middle></template>
    </my-header>
    <div style="width: 100%;overflow-y: auto;overflow-x: hidden;text-align: center;" :style="{ height: contentHeight + 'px' }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import MyHeader from '@/components/Header'
export default {
  components: {
    MyHeader
  },
  data () {
    return {
      contentHeight: window.innerHeight * 0.93
    }
  },
  computed: {
  },
  methods: {
    clickLeft () {
      this.$store.state.skin.shouldStop = true
      if (this.$store.state.skin.videoStream) {
        console.log('关闭摄像头')
        this.$store.state.skin.videoStream.getTracks().forEach((track) => {
          track.stop()
        })
      }
      if (this.$route.name === 'Skin') {
        this.$router.push('/')
      } else {
        this.$router.push('/skin')
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
