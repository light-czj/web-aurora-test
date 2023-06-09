<template>
  <v-card v-if="data.file" class="text-center imageConverter">
    <template v-if="!$store.state.ui.os.isPC">
      <template v-if="data.progress !== 100">
        <v-progress-circular
          class="mx-auto"
          :rotate="360"
          :size="height"
          :width="8"
          :value="data.progress"
          color="black"
        >
          {{ data.progress }}
        </v-progress-circular>
      </template>
      <template v-else>
        <v-img
          :src="data.small"
          :height="height"
          contain
          @click="selectAlbum"
        >
          <template v-slot:placeholder>
            <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
            >
              <v-progress-circular
                indeterminate
                color="grey lighten-2"
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </template>
      <div style="position: absolute;top: -10px;right: -10px">
        <v-btn @click="deleteGallery" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </template>
    <template v-else>
      <v-btn icon @click="deleteGallery" style="position: absolute;top: 0;right: 0;z-index: 1;"><v-icon>mdi-close</v-icon></v-btn>
      <v-list-item class="grow pa-0">
        <template v-if="data.progress !== 100">
          <v-progress-circular
            class="mx-auto"
            :rotate="360"
            :size="100"
            :width="8"
            :value="data.progress"
            color="black"
          >
            {{ data.progress }}
          </v-progress-circular>
        </template>
        <template v-else>
          <v-avatar class="ma-2" size="8vw" tile>
            <v-img
              :src="data.small"
              contain
              @click="selectAlbum"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-2"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-avatar>
          <v-list-item-content class="ma-2">
            <v-list-item-group class="ma-0 pa-0">
              <v-text-field
                class="pa-0 ma-0"
                type="number"
                v-model="data.w"
                single-line
                :prefix="$t('lang.labelWidth')"
                suffix="ピクセル"
                @input="inputSizeX"
                @change="changeSizeY"
                @mousedown="clickTextField"
                readonly
              ></v-text-field>
              <v-text-field
                class="pa-0 ma-0"
                type="number"
                v-model="data.h"
                single-line
                :prefix="$t('lang.labelHeight')"
                suffix="ピクセル"
                @input="inputSizeY"
                @change="changeSizeY"
                @mousedown="clickTextField"
                readonly
              ></v-text-field>
            </v-list-item-group>
          </v-list-item-content>
        </template>
      </v-list-item>
    </template>
  </v-card>
</template>

<script>
export default {
  name: 'ImageConverter',
  data () {
    return {
      height: '0'
    }
  },
  props: {
    parent: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
  },
  created () {
    this.height = window.innerHeight * 0.12 - 24
  },
  methods: {
    deleteGallery () {
      this.$emit('deleteGallery', this.index)
    },
    qrGallery: function () {
      this.data.showQR = !this.data.showQR
    },
    inputDpi: function (val) {
      this.data.pixel = val
    },
    changeDpi: function (val) {
      this.data.sizeX = Math.round(this.data.w / this.data.pixel * 2.54) * 10
      this.data.startX = Math.round(this.data.w / this.data.pixel * 2.54) * 10
      this.data.sizeY = Math.round(this.data.h / this.data.pixel * 2.54) * 10
      this.data.startY = Math.round(this.data.h / this.data.pixel * 2.54) * 10
      this.$emit('changePatchTexture', {
        isFile: true,
        src: this.data.src,
        texName: this.data.fname,
        realSizeY: this.data.sizeY * 0.1,
        pixel: this.data.pixel,
        source: this.data.source
      })
    },
    inputSizeX: function (val) {
      this.data.sizeX = Math.round(val)
      this.data.sizeY = Math.round(this.data.startY * this.data.sizeX / this.data.startX)
    },
    inputSizeY: function (val) {
      this.data.sizeY = Math.round(val)
      this.data.sizeX = Math.round(this.data.startX * this.data.sizeY / this.data.startY)
    },
    changeSizeY: function () {
      this.$emit('changePatchTexture', {
        isFile: true,
        src: this.data.src,
        texName: this.data.fname,
        realSizeY: this.data.sizeY * 0.1,
        pixel: this.data.pixel,
        source: this.data.source
      })
    },
    clickTextField: function () {
    },
    selectAlbum: function () {
      this.$emit('selectAlbum', {
        isFile: true,
        src: this.data.src,
        texName: this.data.fname,
        pixel: this.data.pixel,
        isLogo: this.data.isLogo,
        realSizeY: this.data.sizeY * 0.1,
        source: this.data.source
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.imageConverter {
  margin-bottom: 10px;
}
</style>
