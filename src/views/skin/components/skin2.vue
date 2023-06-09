<template>
  <div style="width: 100%;height: 100%;position: relative;" v-if="$store.state.skin.row">
    <v-img style="margin-top: 12px;" :src="require(`@/assets/skin/skin_title_${$store.state.skin.row.type}.png`)" width="50%" contain class="mx-auto"></v-img>
    <div style="margin-top: 12px;color: #FF8AC5;font-weight: bold;">Check1</div>
    <template v-if="$store.state.skin.row.type === 'umb'">
      <p style="margin-top: 12px;">
        好きな色・よく着る色を2つ<br>
        選択してください
      </p>
      <v-container class="px-14 py-0">
        <v-row>
          <v-col cols="3" md="4" v-for="(item, index) in list" :key="index">
            <v-img @click="onSelect(item)" :src="require('@/assets/skin/tshirt.png')" contain :style="{ backgroundColor: item.color }">
              <div style="position: absolute;width: 100%;height: 100%;">
                <div v-if="$store.state.skin.selected.includes(item.color)" style="border: 1px solid black;border-radius: 5px;width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
                  <div style="color: white;font-weight: bold;">{{ $store.state.skin.selected.indexOf(item.color) + 1 }}</div>
                </div>
              </div>
            </v-img>
          </v-col>
        </v-row>
      </v-container>
      <v-img @click="onNext" style="margin-top: 12px;" :src="require(`@/assets/skin/button_next.png`)" width="34%" contain class="mx-auto"></v-img>
      <v-img @click="onBack" style="margin-top: 12px;color: #F18ABB;" :src="require(`@/assets/skin/bg_button2.png`)" width="34%" contain class="mx-auto flex align-center">back</v-img>
    </template>
    <template v-else>
      <p style="margin-top: 12px;">
        肌の色はどちらに近いですか
      </p>
      <v-container class="px-14 py-0">
        <v-img @click="onClick(0)" :src="$store.state.skin.selects[0] === 0 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" contain width="100%" style="display: flex;align-items: center;">オークル系</v-img>
        <v-img @click="onClick(1)" :src="$store.state.skin.selects[0] === 1 ? require(`@/assets/skin/select_thick.png`) : require(`@/assets/skin/select_medium.png`)" class="my-2" contain width="100%" style="display: flex;align-items: center;">ピンク系</v-img>
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
      this.$router.push('/skin1')
    },
    onClick (index) {
      Vue.set(this.$store.state.skin.selects, 0, index)
    },
    onSelect (item) {
      if (this.$store.state.skin.selected.includes(item.color)) {
        this.$store.state.skin.selected.splice(this.$store.state.skin.selected.indexOf(item.color), 1)
      } else if (this.$store.state.skin.selected.length < 2) {
        this.$store.state.skin.selected.push(item.color)
      }
      if (this.$store.state.skin.selected.length === 0) {
        // 清空分数
        this.$store.state.skin.scores = [0, 0, 0]
      } else {
        let score = 40
        if (this.$store.state.skin.selected.length === 2) {
          score = 30
        }
        if (item.category === 'light') {
          this.$store.state.skin.scores[0] += score
        } else if (item.category === 'warm') {
          this.$store.state.skin.scores[1] += score
        } else {
          this.$store.state.skin.scores[2] += score
        }
      }
    },
    onNext () {
      if (this.$store.state.skin.row.type === 'scarf') {
        Vue.set(this.$store.state.skin.selects, 1, 0)
        this.$router.push('/skin3')
        return
      }
      if (this.$store.state.skin.selected.length === 2) {
        this.$router.push('/skin3')
      } else {
        this.$store.commit('setSnackbar', {
          active: true,
          msg: '二つ選んでください。',
          color: 'error',
          timeout: 2000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
