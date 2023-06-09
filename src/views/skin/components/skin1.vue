<template>
  <div style="width: 100%;height: 100%;position: relative;background-repeat: no-repeat;background-size: cover;padding: 0 10px 10px 10px;" :style="{ backgroundImage: `url(${require('@/assets/skin/bg.png')})` }">
    <div style="width: 100%;height: 100%;position: relative;background-color: white;display: flex;align-items: center;">
      <v-img
        @click="$router.push('/skin2')"
        height="90%"
        contain
        class="mx-auto white--text align-end"
        :src="require(`@/assets/skin/skin1_${$store.state.skin.row.type}.png`)"
      >
      </v-img>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
  }
}
</script>

<style lang="scss" scoped></style>
