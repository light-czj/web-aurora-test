<template>
  <div :class="{ 'edit': true, 'editPC': $store.state.ui.os.isPC }">
    <img class="editImg" :src="require(`@/assets/images/${item}.png`)" v-for="(item,index) in list" :key="'editImg' + index" @click="onClick(item)">
    <swatches
      style="position: absolute;right: 10px;margin-top: 5px;"
      v-model="$store.state.ui.imageColor"
      swatches="text-advanced"
      popover-to="center"
      @close="onClose"
      :trigger-style="{ 'width': '40px', 'height': '40px'}"
    ></swatches>
  </div>
</template>

<script>
import Swatches from 'vue-swatches'
export default {
  name: 'ImageEdit',
  components: {
    Swatches
  },
  data () {
    return {
      list: ['removeImage']
    }
  },
  methods: {
    onClose (val) {
      this.$parent.changeLogoColor(val)
    },
    onClick (val) {
      this.$parent.removeImage()
    }
  }
}
</script>

<style lang="scss" scoped>
.edit {
  width: 100vw;
  height: 8vh;
  background-color: #cccccc;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
.editImg {
  margin-right: 5px;
  width: 5vh;
  height: 5vh;
}
.editPC {
  width: 73vw;
  left: 0;
  top: 0;
  z-index: 2;
}
</style>
