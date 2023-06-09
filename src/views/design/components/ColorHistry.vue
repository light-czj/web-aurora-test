<template>
  <div class="colors-container">
    <div v-for="(item, index) in $store.state.color.list" :key="index" class="color-item" :style="`background-color:#${item.hex}`" :title="`pantone ${item.pantone}`" @click="selectItem(index)"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectedItem: 1
    }
  },
  created () {},
  mounted () {},
  methods: {
    selectItem (index) {
      this.$emit('changeColor', this.$store.state.color.list[index].data)
    }
  }
}
</script>

<style scoped lang="scss">
.colors-container {
  display: flex;
  margin: 12px;
  height: 25vh;
  width: 10vh;
  flex-flow: wrap-reverse;
  flex-direction: column;
}
.color-item {
  width: 5vh;
  height: 5vh;
}
</style>
