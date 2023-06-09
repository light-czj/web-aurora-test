<template>
  <div>
    <div :class="{ panel: !$store.state.ui.os.isPC, panelPC: $store.state.ui.os.isPC }">
      <template v-if="$store.state.ui.os.isPC">
        <div style="width: 6vh;height: 6vh;margin-right: 15px;line-height: 6vh;text-align:center;font-size: 5vh;" :class="{ 'selected': $store.state.design.shareuc.designArea === item.type }"
          v-for="(item,index) in designAreaList" :key="'editImg' + index" @click="onClick(item.type)">
          <img style="height: 6vh;" :src="require(`@/assets/images/${item.name}.png`)" alt="">
        </div>
        <template v-if="['hat_6abc', 'hat_6s'].indexOf($store.state.design.shareuc.designData.designid) > -1 && $store.state.design.shareuc.designArea === 'umb'">
          <img v-if="!$store.state.ui.isZoomIn" style="width: 6vh;height: 6vh;margin-right: 15px;" :src="require('@/assets/images/zoomin.png')" alt="" @click="zoomIn">
          <img v-else style="width: 6vh;height: 6vh;margin-right: 15px;" :src="require('@/assets/images/zoomout.png')" alt="" @click="zoomOut">
        </template>
      </template>
      <template v-if="!$store.state.ui.os.isPC && !$store.state.ui.isZoomIn">
        <div style="width: 5vh;height: 5vh;margin-right: 15px;line-height: 5vh;text-align:center;font-size: 5vh;" :class="{ 'selected': $store.state.design.shareuc.designArea === item.type }"
          v-for="(item,index) in designAreaList" :key="'editImg' + index" @click="onClick(item.type)">
          <img style="height: 5vh;" :src="require(`@/assets/images/${item.name}.png`)" alt="">
        </div>
        <template v-if="['hat_6abc', 'hat_6s'].indexOf($store.state.design.shareuc.designData.designid) > -1 && $store.state.design.shareuc.designArea === 'umb'">
          <img v-if="!$store.state.ui.isZoomIn" style="width: 4vh;height: 4vh;" :src="require('@/assets/images/zoomin.png')" alt="" @click="zoomIn">
          <img v-else style="width: 4vh;height: 4vh;" :src="require('@/assets/images/zoomout.png')" alt="" @click="zoomOut">
        </template>
      </template>
    </div>
    <div v-if="$store.state.ui.isZoomIn" :class="{ 'patch-edit-phone': !$store.state.ui.os.isPC, 'patch-edit-pc': $store.state.ui.os.isPC }">
      <img v-if="!$store.state.ui.os.isPC" style="width: 4vh;height: 4vh;" :src="require('@/assets/images/zoomout.png')" alt="" @click="zoomOut">
      <v-btn icon class="patch-edit-item" @click="lastPatch" x-large>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-btn icon class="patch-edit-item" @click="nextPatch" x-large>
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DesignAreaEidt',
  props: {
  },
  data () {
    return {
      index: 0
    }
  },
  methods: {
    onClick (val) {
      this.$emit('onClick', val)
    },
    zoomIn () {
      this.index = 0
      this.$store.state.ui.isZoomIn = !this.$store.state.ui.isZoomIn
      this.$emit('zoomIn', 0)
    },
    zoomOut () {
      this.$store.state.ui.isZoomIn = !this.$store.state.ui.isZoomIn
      this.$emit('zoomOut')
    },
    lastPatch () {
      this.index++
      const ks = this.$store.state.design.shareuc.product.ks
      if (this.index < 0) {
        this.index = ks - 1
      }
      if (this.index > ks - 1) {
        this.index = 0
      }
      this.$emit('zoomIn', this.index)
    },
    nextPatch () {
      this.index--
      const ks = this.$store.state.design.shareuc.product.ks
      if (this.index < 0) {
        this.index = ks - 1
      }
      if (this.index > ks - 1) {
        this.index = 0
      }
      this.$emit('zoomIn', this.index)
    }
  },
  computed: {
    designAreaList () {
      if (this.$store.state.design.shareuc.product && this.$store.state.design.shareuc.product.areas) {
        return this.$store.state.design.shareuc.product.areas
      } else {
        return []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 7vh;
  height: 5vh;
  // background-color: #cccccc;
}
.panelPC {
  width: 6vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  transform: translateY(-25%);
  right: 27vw;
  z-index: 2;
}
.selected {
  filter: drop-shadow(1px 0 0 #0382ff) drop-shadow(-1px 0 0 #0382ff) drop-shadow(0 1px 0 #0382ff) drop-shadow(0 -1px 0 #0382ff);
  -webkit-filter: drop-shadow(1px 0 0 #0382ff) drop-shadow(-1px 0 0 #0382ff) drop-shadow(0 1px 0 #0382ff) drop-shadow(0 -1px 0 #0382ff);
}
.patch-edit-pc {
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  z-index: 2;
  height: 7vh;
  left: 50%;
  transform: translateX(-50%);
  padding-right: 27vw;
}
.patch-edit-phone {
  position: absolute;
  bottom: 26vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
