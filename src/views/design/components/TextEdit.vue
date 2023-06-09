<template>
  <div :class="{ 'edit': true, 'editPC': $store.state.ui.os.isPC }">
    <div v-if="$store.state.ui.os.isPC" style="display: flex;align-items: center;width: 100%;">
      <v-text-field
        ref="textInput"
        class="ma-0 pa-0"
        v-model="$store.state.ui.inputText"
        hide-details
        color="#00A596"
        :placeholder="$t('lang.placeholderText')"
        prepend-inner-icon="T"
        single-line
        clearable
        @input="onInput"
      ></v-text-field>
      <swatches
        v-model="$store.state.ui.textColor"
        swatches="text-advanced"
        popover-to="left"
        @close="onClose"
        :trigger-style="{ 'width': '40px', 'height': '40px', 'margin-left':'10px', 'margin-top': '5px'}"
      ></swatches>
      <select v-model="$store.state.ui.currentFont" @change="selectFont" ref="fontFamily" class="fontFamily" style="margin-left: 10px;">
      </select>
    </div>
    <template v-else>
      <div style="display: flex;align-items: center;height: 7vh;">
        <v-text-field
          ref="textInput"
          class="ma-0 pa-0"
          v-model="$store.state.ui.inputText"
          hide-details
          color="#00A596"
          :placeholder="$t('lang.placeholderText')"
          prepend-inner-icon="T"
          single-line
          clearable
          @input="onInput"
        ></v-text-field>
        <swatches
          v-model="$store.state.ui.textColor"
          swatches="text-advanced"
          popover-to="left"
          @close="onClose"
          :trigger-style="{ 'width': '40px', 'height': '40px', 'margin-left':'10px', 'margin-top': '5px'}"
        ></swatches>
      </div>
      <v-menu
        bottom
        :close-on-click="true"
        :offset-y="true"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            style="color: white;"
            color="black"
            v-bind="attrs"
            v-on="on"
            @click="activeLayer = true"
          >
            {{ $store.state.ui.currentFont  }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(font, index) in $store.getters.getFontList"
            :key="'font' + index"
            @click="selectFontByFont(font)"
          >
            <v-list-item-title :style="{ fontFamily: font }">{{ font }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <div v-if="activeLayer" style="position: absolute;top: 0;left: 0;width: 100vw;height: 100vh;background-color: transparent;" @click="activeLayer = false"></div>
  </div>
</template>

<script>
import Swatches from 'vue-swatches'
export default {
  name: 'TextEdit',
  components: {
    Swatches
  },
  data () {
    return {
      fonts: this.$store.getters.getFontList,
      textInput: null,
      activeLayer: false
    }
  },
  mounted () {
    if (this.$store.state.ui.os.isPC) {
      this.$store.getters.getFontList.forEach(font => {
        const o = document.createElement('option')
        o.text = font
        o.value = font
        o.style.fontFamily = font
        this.$refs.fontFamily.add(o)
      })
    }
    if (this.$refs.textInput) {
      try {
        this.textInput = this.$refs.textInput.$el.children[0].children[0].children[1].children[0]
      } catch (error) {
        console.error(error)
      }
    }
  },
  watch: {
    '$store.state.ui.currentFont' (val) {
      if (this.textInput) {
        this.textInput.style.fontFamily = val
      }
    }
  },
  methods: {
    onInput (val) {
      this.$parent.changeText(val)
    },
    onClose (val) {
      this.$parent.changeTextColor(val)
    },
    selectFont () {
      // if (this.textInput) {
      //   this.textInput.style.fontFamily = this.$store.state.ui.currentFont
      // }
      this.$emit('selectFont', this.$store.state.ui.currentFont)
    },
    selectFontByFont (font) {
      console.log('选中字体', font)
      if (!font) return
      this.activeLayer = false
      this.$store.state.ui.currentFont = font
      this.$emit('selectFont', this.$store.state.ui.currentFont)
    }
  }
}
</script>

<style lang="scss" scoped>
.edit {
  width: 100vw;
  height: 15vh;
  background-color: #cccccc;
  position: fixed;
  padding: 10px;
  top: 0;
}
.editPC {
  width: 27vw;
  right: 0;
  top: 14vh;
  z-index: 2;
  height: 71vh;
  position: absolute;
}
.fontFamily {
  background-color: #14171d;
  color: #fff;
  border-color: #3d495a;
  height: 30px;
  line-height: 30px;
  border-radius: 3px;
  margin: 0;
  padding: 0;
  -webkit-appearance: auto;
}
.v-menu__content {
  max-height: 250px;
}
.v-list {
  background-color: black;
}
.v-list-item__title {
  color: white;
}
</style>
