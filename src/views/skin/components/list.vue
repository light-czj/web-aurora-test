<template>
  <v-row style="background-color: #e8e8e8;" class="ma-0 pa-0">
    <v-col
      cols="12"
      md="4"
      v-for="(item, index) in list"
      :key="'list' + index"
      class="ma-0 pa-0"
    >
    <v-card class="mx-1 my-1 py-0 px-0">
      <v-img
        @click="toPage(item)"
        width="100%"
        contain
        class="mx-auto white--text align-end"
        :src="
          `${$store.state.config.urls.galleryUrl}${item.image}?x-oss-process=image/resize,w_512`
        "
      >
      </v-img>
    </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  components: {
  },
  computed: {
    list () {
      return this.$store.state.brand.brandJson && this.$store.state.brand.brandJson.skin.list
    }
  },
  methods: {
    toPage (item) {
      this.$store.state.skin.row = item
      this.$router.push('/skin1')
      // 清空分数
      this.$store.state.skin.selected = []
      this.$store.state.skin.scores = [0, 0, 0]
      this.$store.state.skin.result = 0
      this.$store.state.skin.product = null
      this.$store.state.skin.selects = [0, 0, 0, 0]
    }
  }
}
</script>

<style lang="scss" scoped></style>
