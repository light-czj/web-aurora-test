<template>
  <div style="width: 100%;height: 100%;position: relative;" v-if="$store.state.skin.row">
    <template v-if="$store.state.skin.row.type === 'umb'">
      <v-img style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
      <div style="margin-top: 12px;color: #FF8AC5;font-weight: bold;">{{ title }}</div>
      <p style="margin-top: 12px;">
        {{ title1 }}
      </p>
      <v-container class="px-14 py-0" v-if="colorSet">
        <v-row>
          <v-col cols="4" md="4" v-for="(item, index) in colorSet.colors" :key="index">
            <v-img @click="toNext(item)" :src="require('@/assets/skin/umb.png')" contain :style="{ backgroundColor: '#' + item.colorhex }">
            </v-img>
          </v-col>
        </v-row>
        <p style="margin-top: 12px;">
          気になる色の傘をタップすると
          おすすめの商品が表示されます
        </p>
        <p style="margin-top: 12px;">
          {{ colorSet && colorSet.text }}
        </p>
        <v-img @click="onDesign" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="50%" contain class="mx-auto flex align-center">デザイン開始</v-img>
        <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="50%" contain class="mx-auto flex align-center">back</v-img>
      </v-container>
    </template>
    <template v-else>
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
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  computed: {
    title () {
      if (this.$store.state.skin.result === 0) {
        return 'Light color'
      } else if (this.$store.state.skin.result === 1) {
        return 'Warm color'
      } else {
        return 'Vivid color'
      }
    },
    title1 () {
      if (this.$store.state.skin && this.$store.state.skin.row.type === 'scarf') {
        return 'あなたに似合うスカーフの色はこちら！'
      } else {
        return 'あなたに似合う傘の色はこちら！'
      }
    },
    colorSet () {
      if (this.$store.state.brand.brandJson) {
        return this.$store.state.brand.brandJson.skin.colorSet[this.$store.state.skin.result]
      } else {
        return null
      }
    }
  },
  methods: {
    onBack () {
      this.$router.push('/skin4')
    },
    toNext (item) {
      console.log(item)
      this.$store.state.skin.product = item
      this.$router.push('/skin7')
    },
    onDesign () {
      this.$store.state.ui.homeIndex = 0
      this.$router.push('/umb')
    }
  },
  mounted () {
    if (this.$store.state.skin.row && this.$store.state.skin.row.type === 'scarf') {
      setTimeout(() => {
        this.$router.push('/skin7')
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped></style>
