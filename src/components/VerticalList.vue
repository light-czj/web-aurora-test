<template>
  <div :class="{'vertical': true, 'vertical-pc': $store.state.ui.os.isPC && type === '2d' }">
    <div>
      <swatches
        :title="colorTitle"
        class="z-index-max"
        v-if="colorList && colorList.length > 0"
        v-model="selectedColor"
        :swatches="colorList"
        row-length="2"
        show-border
        popover-to="left"
        @input="selectColor(selectedColor)"
        :trigger-style="{ 'border-style': 'solid', 'border-width': 'thin' }"
        :wrapper-style="{ 'max-height': '40vh' }"
      >
        <v-btn width="6vh" height="6vh" icon slot="trigger" :value="color" class="form__input__element" readonly>
          <img v-if="scene === 'design'" :src="require('@/assets/images/color.png')" style="width: 6vh;height: 6vh">
          <img v-else :src="require('@/assets/images/color3d.png')" style="width: 6vh;height: 6vh">
          <div v-if="scene === 'design'" class="btndesc">{{ colorTitle }}</div>
        </v-btn>
      </swatches>
      <div v-for="(item, index) in list" :key="'vertical' + index">
        <img class="vertical-item"
          :title='item.title'
          :src='item.img'
          :style="verticalStyle"
          @click="onClick(item.tag)">
        <div v-if="item.desc" style="font-size: small;">{{ item.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Swatches from 'vue-swatches'
export default {
  name: 'vertical-list',
  components: {
    Swatches
  },
  mounted () {
    // 初始化
    this.selectedColor = this.color
  },
  computed: {
    colorTitle () {
      return 'ふちの色'
    }
  },
  data () {
    return {
      selectedColor: ''
    }
  },
  props: {
    type: {
      default: '2d',
      type: String
    },
    scene: {
      default: 'design',
      type: String
    },
    colorList: {
      type: Array,
      default: () => {
        return []
      }
    },
    selectColor: {
      default: () => {},
      type: Function
    },
    click: {
      default: () => {},
      type: Function
    },
    list: {
      type: Array,
      default: () => {
        return []
      }
    },
    verticalStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    color: {
      default: '',
      type: String
    }
  },
  methods: {
    onClick: function (val) {
      this.click(val)
    },
    setColor (val) {
      this.selectedColor = val
    }
  }
}
</script>

<style lang="scss" scoped>
.vertical {
  z-index: 2;
  position: absolute;
  height: 200px;
  top: 50%;
  margin-top: -100px;
  right: 0;
  width: 7vh;
  display: flex;
  align-items: center;
  &-item {
    height: 6vh;
    width: 6vh;
    display: block;
    margin-bottom: 5px;
  }
}
.vertical-pc {
  right: 27vw;
}
.btndesc {
  position: absolute;
  bottom: 0;
  margin-bottom: -12px;
  font-weight: bold
}
</style>
