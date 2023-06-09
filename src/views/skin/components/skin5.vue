<template>
  <div style="width: 100%;height: 93vh;position: relative;" v-if="$store.state.skin.row">
    <template v-if="$store.state.skin.row.type === 'umb'">
      <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;">
        <v-progress-circular
          indeterminate
          color="#F089C4"
          :size="200"
          :width="6"
        >
          <div style="color: black;">診断中</div>
        </v-progress-circular>
      </div>
    </template>
    <template v-else>
      <v-img v-if="$store.state.skin.row" style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
      <div style="margin-top: 12px;color: #FF8AC5;font-weight: bold;">Check4</div>
      <p style="margin-top: 12px;" v-html="title">
      </p>
      <v-container class="px-14 py-0">
        <v-img @click="onClick(0)" :src="$store.state.skin.selects[3] === 0 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" contain width="100%" style="display: flex;align-items: center;">
          <v-img width="70%" contain class="mx-auto" v-if="option1.endsWith('.png')" :src="require(`@/assets/skin/${option1}`)"></v-img>
          <div v-else>{{ option1 }}</div>
        </v-img>
        <v-img @click="onClick(1)" :src="$store.state.skin.selects[3] === 1 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" class="my-2" contain width="100%" style="display: flex;align-items: center;">
          <v-img width="70%" contain class="mx-auto" v-if="option2.endsWith('.png')" :src="require(`@/assets/skin/${option2}`)"></v-img>
          <div v-else>{{ option2 }}</div>
        </v-img>
      </v-container>
      <v-img @click="onNext" style="margin-top: 12px;" :src="require(`@/assets/skin/button_next.png`)" width="34%" contain class="mx-auto"></v-img>
      <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="34%" contain class="mx-auto flex align-center">back</v-img>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  mounted () {
    if (this.$store.state.skin.row && this.$store.state.skin.row.type === 'umb') {
      setTimeout(() => {
        this.$router.push('/skin6')
      }, 1000)
    }
  },
  computed: {
    title () {
      let ret = ''
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1] + this.$store.state.skin.selects[2]) {
        case 0:
          ret = 'あなたの第一印象は<br>どちらに近いですか'
          break
        case 1:
          ret = 'あなたの第一印象は<br>どちらに近いですか'
          break
        case 2:
          ret = 'あなたの第一印象は<br>どちらに近いですか'
          break
        case 3:
          ret = 'あなたの第一印象は<br>どちらに近いですか'
          break
      }
      return ret
    },
    option1 () {
      let ret = ''
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1] + this.$store.state.skin.selects[2]) {
        case 0:
          ret = '明るく可愛らしい印象'
          break
        case 1:
          ret = '元気でハツラツとした印象'
          break
        case 2:
          ret = 'やさしく爽やかな印象'
          break
        case 3:
          ret = '透明感があり上品な印象'
          break
      }
      return ret
    },
    option2 () {
      let ret = ''
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1] + this.$store.state.skin.selects[2]) {
        case 0:
          ret = 'ゴージャスで落ち着いた印象'
          break
        case 1:
          ret = 'ナチュラルで落ち着きのある印象'
          break
        case 2:
          ret = 'クールで華やかな印象'
          break
        case 3:
          ret = 'はっきりと洗練された印象'
          break
      }
      return ret
    }
  },
  methods: {
    onBack () {
      this.$router.push('/skin4')
    },
    onClick (index) {
      Vue.set(this.$store.state.skin.selects, 3, index)
    },
    onNext () {
      this.$router.push('/skin6')
    }
  }
}
</script>

<style lang="scss" scoped></style>
