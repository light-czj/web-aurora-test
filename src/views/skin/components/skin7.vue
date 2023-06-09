<template>
  <div style="width: 100%;height: 100%;position: relative;" v-if="$store.state.skin.row">
    <v-img style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
    <template v-if="$store.state.skin.row.type === 'umb'">
      <div style="margin-top: 12px;color: #FF8AC5;font-weight: bold;">fu-hen</div>
      <v-container class="px-14 py-0" v-if="colorSet">
        <v-img style="margin-top: 12px;" :src="`https://uc.shareuc.com/texture/skin/${$store.state.skin.product.image}`" width="100%" contain class="mx-auto"></v-img>
        <p :v-html="colorSet.detail"></p>
        <p>
          ¥{{ colorSet.price }}（本体価格）<br>
          日本製<br>
          {{ colorSet.id }}
        </p>
        <v-img @click="onBuy" style="margin-top: 12px;" :src="require(`@/assets/skin/button_buy.png`)" width="50%" contain class="mx-auto"></v-img>
        <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="50%" contain class="mx-auto flex align-center">back</v-img>
      </v-container>
    </template>
    <template v-else-if="scarfResult">
      <div style="margin-top: 12px;font-weight: bold;">{{ scarfResult.text }}</div>
      <v-container class="px-14 py-0 pb-4" v-if="colorSet">
        <div style="margin-top: 12px;">{{ scarfResult.title }}</div>
        <v-img :src="require(`@/assets/skin/bar_summer.png`)" width="50%" contain class="mx-auto"></v-img>
        <div v-html="scarfResult.description"></div>
        <div style="margin-top: 12px;">Styling point</div>
        <v-img :src="require(`@/assets/skin/bar_summer.png`)" width="50%" contain class="mx-auto"></v-img>
        <div v-html="scarfResult.Styling_point"></div>
        <v-img @click="onNext" style="margin-top: 12px;color: #ffffff;font-size: xx-small;" :src="require(`@/assets/skin/bg_button.png`)" width="60%" contain class="mx-auto flex align-center">おすすめアイテムはこちら</v-img>
        <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="60%" contain class="mx-auto flex align-center">back</v-img>
      </v-container>
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
    colorSet () {
      if (this.$store.state.brand.brandJson) {
        return this.$store.state.brand.brandJson.skin.colorSet[this.$store.state.skin.result]
      } else {
        return null
      }
    },
    scarfResult () {
      let index = 0
      switch (this.$store.state.skin.selects[0] + this.$store.state.skin.selects[1] + this.$store.state.skin.selects[2]) {
        case 0:
        case 1:
          if (this.$store.state.skin.selects[3] === 0) {
            index = 0
          } else {
            index = 2
          }
          break
        case 2:
        case 3:
          if (this.$store.state.skin.selects[3] === 0) {
            index = 1
          } else {
            index = 3
          }
          break
      }
      if (this.$store.state.brand.brandJson) {
        return this.$store.state.brand.brandJson.skin.scarfResult[index]
      } else {
        return null
      }
    }
  },
  methods: {
    onBuy () {
      console.log('onBuy')
    },
    onBack () {
      if (this.$store.state.skin.row.type === 'umb') {
        this.$router.push('/skin6')
      } else {
        this.$router.push('/skin5')
      }
    },
    onNext () {
      this.$router.push('/skin8')
    }
  }
}
</script>

<style lang="scss" scoped></style>
