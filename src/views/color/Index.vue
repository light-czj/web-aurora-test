<template>
  <div class="page">
    <div class="header">
      <div class="title">{{ $store.state.ui.iframe.title }}</div>
      <v-btn class="btnClose" icon @click="close">
        <v-icon style="font-size: 4vh">mdi-close</v-icon>
      </v-btn>
    </div>
      <template v-if="$store.state.ui.os.isPC">
        <v-container class="contentWrapper">
          <div style="display: flex;justify-content: center;background-color: #ccc;margin: 12px;">
            <div>
              <v-row class="ma-0 pa-0" style="width: 56vh;">
                <v-col
                  cols="1.2"
                  v-for="(item, index) in colors"
                  :key="'color' + index"
                  class="ma-0 pa-0"
                  style="max-width: 7vh;"
                >
                <div class="color-item" :class="{ 'selected': index === selectedIndex }" :style="`backgroundColor: ${item.hex}`" @click="selectColor(item.hex, index)"></div>
                </v-col>
              </v-row>
            </div>
            <div style="margin-left: 29vh;left: 50%;margin-top: 7vh;position: absolute;">
              <div style="display: flex;">
                <div :class="{ 'noColor': !$store.state.design.shareuc.currentColor }" :style="`width: 14vh;height:7vh;background-color: ${$store.state.design.shareuc.currentColor};color: black;`">
                  <div style="position: absolute;text-align: center;width: 14vh;margin-top: -25px;">新規</div>
                </div>
                <div :class="{ 'noColor': !$store.state.design.shareuc.lastColor }" :style="`margin-left: 12px;width: 14vh;height:7vh;background-color: ${$store.state.design.shareuc.lastColor};color: black;`">
                  <div style="position: absolute;text-align: center;width: 14vh;margin-top: -25px;">現在の色</div>
                </div>
              </div>
              <v-btn x-large style="left: 0;margin-top: 12px;" @click="clickOK">確定</v-btn>
            </div>
          </div>
        </v-container>
      </template>
      <template v-else>
        <div style="display: flex;justify-content: center;padding-top: 7vh;background-color: #ccc;height: 100vh;overflow-y: auto;">
          <v-container>
            <div style="display: flex;margin-bottom: 10px;align-items: flex-end;">
              <div>
                <div style="text-align: center;">新規</div>
                <div :class="{ 'noColor': !$store.state.design.shareuc.currentColor }" :style="`width: 14vh;height:7vh;background-color: ${$store.state.design.shareuc.currentColor};color: black;`">
                </div>
              </div>
              <dir>
                <div style="text-align: center;">現在の色</div>
                <div :class="{ 'noColor': !$store.state.design.shareuc.lastColor }" :style="`margin-left: 10px;width: 14vh;height:7vh;background-color: ${$store.state.design.shareuc.lastColor};color: black;`">
                </div>
              </dir>
              <v-btn x-large style="margin-left: 20px;margin-top: 20px !important;" @click="clickOK">確定</v-btn>
            </div>
            <v-row class="ma-0 pa-0" style="width: 100%;">
              <v-col
                cols="1.5"
                v-for="(item, index) in colors"
                :key="'color' + index"
                class="ma-0 pa-0"
              >
              <div :class="{ 'selected': index === selectedIndex }" :style="`backgroundColor: ${item.hex};width: 11vw;height: 11vw;`" @click="selectColor(item.hex, index)"></div>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </template>
  </div>
</template>

<script>
export default {
  name: 'Color',
  data () {
    return {
      page: 1,
      selectedIndex: -1,
      pantone: ''
    }
  },
  mounted () {
  },
  activated () {
    this.selectedIndex = -1
    this.pantone = ''
  },
  computed: {
    list () {
      if (!this.$store.state.brand.brandJson) {
        return []
      } else {
        return this.$store.state.brand.brandJson.colorList
      }
    },
    colors () {
      if (this.$store.state.brand.brandJson) {
        if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
          return this.$store.state.brand.brandJson.linecolors
        } else {
          return this.$store.state.brand.brandJson.colors
        }
      } else {
        return {
          list: []
        }
      }
    }
  },
  methods: {
    close () {
      if (this.$store.state.ui.colorType === 'line') {
        this.$router.push('/view3d')
      } else {
        this.$router.push('/design')
      }
    },
    selectColor (color, index) {
      this.selectedIndex = index
      this.$store.state.design.shareuc.currentColor = color
      this.pantone = this.colors[index].pantone
      console.log('选中颜色', this.$route.name, color, this.pantone)
    },
    clickOK () {
      this.close()
      this.$store.state.design.shareuc.selectedColor = this.$store.state.design.shareuc.currentColor
      if (this.$store.state.ui.colorType === 'line') {
        this.$store.state.design.shareuc.pantone = this.pantone
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  height: 100%;
  width: 100%;
  text-align: center;
  line-height: 7vh;
  border-bottom: 1px solid #e8e8e8;
}
.header {
  position: absolute;
  width: 100%;
  height: 7vh;
  background-color: white !important;
  z-index: 1;
}
.page {
  background-color: #ccc;
}
.btnClose {
  position: absolute;
  top: 0;
  right: 1vh;
  height: 7vh;
}
.content {
  background-color: white;
  margin-top: 7vh;
  height: 100%;
  width: 100%;
}
.color-item {
  width: 7vh;
  height: 7vh;
}
.noColor {
  border: 1px dashed #e6ebed;
}
.contentWrapper {
  margin: 0;
  padding: 0;
  max-width: 100%;
  height: 93vh;
  overflow-y: auto;
  margin-top: 7vh;
}
.selected {
  border: 2px solid red;
}
</style>
