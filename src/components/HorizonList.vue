<template>
  <div class="horizon" :style="`top: ${top}px;`">
    <img class="horizon-item"
         :style="horizonStyle"
         :src="item.img"
         :title="item.title"
         v-for="(item,index) in list" :key="'horizon' + index"
         @click="click(item)">
  </div>
</template>

<script>
export default {
  name: 'horizon-list',
  props: {
    parent: {
      type: Object,
      default: () => {}
    },
    list: {
      type: Array,
      default: () => {
        return []
      }
    },
    click: {
      type: Function,
      default: () => {
      }
    },
    horizonStyle: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      top: 0
    }
  },
  mounted () {
    const elements = document.getElementsByClassName('horizon')
    if (elements && elements.length > 0) {
      this.top = window.innerHeight * 0.93 - elements[0].clientHeight
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.horizon {
  position: absolute;
  height: 9vh;
  bottom: 7vh;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  &-item {
    height: 8vh;
    width: 8vh;
    border-radius: 1vh;
    margin-right:1vh;
  }
}
</style>
