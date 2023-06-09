<template>
  <div :style="`height: 12vh;width: 320px;display: flex;align-items: center;background-color: #cccccc;transform: scale(${ratio})`">
    <img class="ruler" :style="`width: 320px;height: 50px;margin-top: 1.5vh;position: absolute;`"
         :src="require(`@/assets/images/${img}`)" alt="">
    <v-slider :style="`width: 320px;`" v-model="sliderValue"
              :min="min" :max="max" :step="step" track-color="transparent" track-fill-color="transparent" thumb-color="transparent"
              :process-style="{ backgroundColor: 'transparent' }" thumb-label="always" thumb-size="0"
              @input="onChange" @mouseup="onMouseUp">
      <template v-slot:thumb-label>
        <div style="width: 36px;height: 54px;position: relative">
          <div class="imgGolf">
            <div style="height: 36px;line-height: 36px;text-align: center;color: black;margin-top: 20%;font-size: 15px">{{ sliderValue }}</div>
          </div>
        </div>
      </template>
    </v-slider>
  </div>
</template>

<script>
export default {
  name: 'ruler-slider',
  props: {
    img: {
      type: String,
      default: '@/assets/images/ruler_Zoom.png'
    },
    change: {
      type: Function,
      default: () => {
      }
    },
    end: {
      type: Function,
      default: () => {
      }
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 6
    },
    step: {
      type: Number,
      default: 0.1
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      sliderValue: 0
    }
  },
  mounted () {
    // 初始化
    this.sliderValue = this.value
  },
  computed: {
    ratio () {
      if (this.$store.state.ui.os.isPC) {
        if (window.innerWidth !== 1024) {
          return window.innerWidth / 1024 * 0.75
        } else {
          return 0.75
        }
      } else {
        if (window.innerHeight !== 812) {
          return window.innerHeight / 812 * 1.1
        } else {
          return 1
        }
      }
    }
  },
  methods: {
    onChange: function (val) {
      this.$emit('change', val)
    },
    onMouseUp: function (val) {
      this.$emit('end', val)
    },
    setValue: function (val) {
      this.sliderValue = val
    }
  }
}
</script>

<style lang="scss" scoped>
.imgGolf {
  background-image: url('../../../assets/images/icon_Golf.png');
  background-size: contain;
  width: 36px;
  height: 56px;
  margin-top: 80%;
}
</style>
