<template>
  <div style="width: 100%;height: 100%;position: relative;" v-if="$store.state.skin.row">
    <v-img style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
    <div style="margin-top: 12px;color: #FF8AC5;font-weight: bold;">Check2</div>
    <template v-if="$store.state.skin.row.type === 'umb'">
      <p style="margin-top: 12px;">
        手首を撮影しましょう
      </p>
      <v-img style="margin-top: 12px;" :src="require(`@/assets/skin/instruct_hand.png`)" width="34%" contain class="mx-auto"></v-img>
      <v-img @click="onNext" style="margin-top: 50px;" :src="require(`@/assets/skin/button_next.png`)" width="34%" contain class="mx-auto"></v-img>
      <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="34%" contain class="mx-auto flex align-center">back</v-img>
    </template>
    <template v-else>
      <p style="margin-top: 12px;">
        {{ $store.state.skin.selects[0] === 0 ? '瞳の色はどちらに近いですか' : 'いつも選ぶ口紅の色は' }}
      </p>
      <v-container class="px-14 py-0">
        <v-img @click="onClick(0)" :src="$store.state.skin.selects[1] === 0 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" contain width="100%" style="display: flex;align-items: center;">
          {{ $store.state.skin.selects[0] === 0 ? 'オークル系' : 'オレンジ系' }}
        </v-img>
        <v-img @click="onClick(1)" :src="$store.state.skin.selects[1] === 1 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" class="my-2" contain width="100%" style="display: flex;align-items: center;">
          {{ $store.state.skin.selects[0] === 0 ? 'ピンク系' : 'ローズ系' }}
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
  data () {
    return {
      selected: []
    }
  },
  components: {
  },
  computed: {
    list () {
      return this.$store.state.brand.brandJson && this.$store.state.brand.brandJson.skin.colorCheck
    }
  },
  methods: {
    onBack () {
      this.$router.push('/skin2')
    },
    onClick (index) {
      Vue.set(this.$store.state.skin.selects, 1, index)
    },
    onNext () {
      Vue.set(this.$store.state.skin.selects, 2, 0)
      this.$router.push('/skin4')
    }
  }
}
</script>

<style lang="scss" scoped></style>
