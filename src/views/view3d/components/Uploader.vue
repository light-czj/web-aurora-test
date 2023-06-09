<template>
  <div class="upload" v-if="isUploading">
    <v-progress-circular
      :rotate="-90"
      :size="100"
      :width="8"
      :value="order.progress"
      color="black"
    >
      {{ Math.ceil(order.progress) }}%
    </v-progress-circular>
    <v-btn fab class="btnCancel" @click="cancelUpload"
      ><v-icon>mdi-close</v-icon></v-btn
    >
  </div>
</template>

<script>
import UploadTask from '@/js/uploadTask.js'
import moment from 'dayjs'
// import localForage from '@/js/localForage'
import utils from '@/js/utils'
import postOrder from '@/js/postOrder'

export default {
  name: 'Uploader',
  data () {
    return {
      isUploading: false,
      isAdding: false,
      isAddToCart: false,
      order: { progress: 0 },
      tags: ['XS(52cm~54cm)', 'S(54cm~56cm)', 'M(56cm~58cm)', 'L(58cm~60cm)', 'XL(60cm~62cm)'],
      uploadData: {}
    }
  },
  mounted () {},
  computed: {},
  methods: {
    genName () {
      var ptype = this.$store.state.design.shareuc.designData.ptype
      const temp = this.$store.state.config.jp ? 'jp' : 'jpg'
      if (this.$store.state.brand.sid) {
        return (
          moment().format('YYYYMMDDHHmmss') +
          `_${this.$store.state.config.brand}_(${ptype}_` +
          this.$store.state.design.shareuc.designData.designid +
          `)-${temp}-` +
          this.$store.state.brand.sid
        )
      } else {
        return (
          moment().format('YYYYMMDDHHmmss') +
          `_${this.$store.state.config.brand}_(${ptype}_` +
          this.$store.state.design.shareuc.designData.designid +
          `)-${temp}`
        )
      }
    },
    async save () {
      await this.upload()
      this.uploadData = {}
      // this.$parent.showAnimate()
    },
    async upload (callback = null) {
      if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        await this.upload_cap(callback)
      } else {
        await this.upload_other(callback)
      }
    },
    async upload_cap (callback) {
      if (this.isUploading) return
      this.isUploading = true
      this.$store.state.design.shareuc.designData.size = this.tags[this.$store.state.design.size[0]]
      this.uploadName = this.genName()
      let customid = ''
      if (this.$store.state.design.shareuc.designData.ptype === 'umb') {
        customid = this.getCustomID(
          this.$store.state.design.shareuc.product.bone,
          this.$store.state.design.shareuc.option.auroraid,
          this.$store.state.design.shareuc.product.umbtype
        )
      } else if (this.$store.state.design.shareuc.designData.ptype === 'scarf') {
        customid = this.getCustomIDScarf(
          this.$store.state.design.shareuc.product.id
        )
      } else if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        customid = this.getCustomIDScarf(
          this.$store.state.design.shareuc.product.id
        )
      }
      const order = {
        name: this.uploadName,
        created: '',
        count: 1,
        status: 0,
        price: 0,
        completed: false,
        progress: 0,
        task: null,
        customid: customid,
        customname: '',
        amount: this.$store.state.design.shareuc.row.price,
        size: this.tags[this.$store.state.design.size[0]]
      }
      this.order = order
      // 保存json,缩略图到本地
      await this.saveLocal()
      const pid = this.$store.state.design.shareuc.designData.pid
      const opid = this.$store.state.design.shareuc.designData.opid
      const task = new UploadTask(pid, opid, order, this.isAddToCart, this.tags[this.$store.state.design.size[0]])
      order.task = task
      await task.start(this.uploadData)
      console.log('上传结束', order.created)
      if (order.created !== '') {
        const ptype = this.$store.state.design.shareuc.designData.ptype
        if (ptype === 'scarf') {
          order.customname = `#${order.created.split('_')[0]}_2 - ${
            this.$store.state.design.shareuc.row.text
          }`
        } else if (ptype === 'gift') {
          order.customname = `#${order.created.split('_')[0]}_4 - ${
            this.$store.state.design.shareuc.row.text
          }`
        } else {
          order.customname = `#${order.created.split('_')[0]} - ${
            this.$store.state.design.shareuc.row.text
          }`
        }
        // 添加购物车
        for (let i = 0; i < this.$store.state.design.size.length; i++) {
          const o = JSON.parse(JSON.stringify(order))
          if (i !== 0) {
            o.size = this.tags[this.$store.state.design.size[i]]
            o.created = await postOrder(pid, opid, this.$store.state.design.shareuc.designData, this.uploadName, this.tags[this.$store.state.design.size[i]])
            if (ptype === 'scarf') {
              o.customname = `#${o.created.split('_')[0]}_2 - ${
                this.$store.state.design.shareuc.row.text
              }`
            } else if (ptype === 'gift') {
              o.customname = `#${o.created.split('_')[0]}_4 - ${
                this.$store.state.design.shareuc.row.text
              }`
            } else {
              o.customname = `#${o.created.split('_')[0]} - ${
                this.$store.state.design.shareuc.row.text
              }`
            }
          }
          console.log('添加购物车', o)
          this.$store.commit('addShopCart', {
            type: ptype,
            order: o
          })
          this.$store.commit('saveShopCart')
        }
        this.$store.commit('setSnackbar', {
          active: true,
          msg: this.$t('lang.labelSaveSuccess'),
          color: 'success',
          timeout: 2000
        })
        setTimeout(() => {
          this.isUploading = false
          this.$router.push('/shopcart')
        }, 1000)
      } else {
        this.$store.commit('setSnackbar', {
          active: true,
          msg: this.$t('lang.labelSaveFail'),
          color: 'error',
          timeout: 2000
        })
        this.isUploading = false
      }
    },
    async upload_other (callback) {
      if (this.isUploading) return
      this.isUploading = true
      this.uploadName = this.genName()
      let customid = ''
      if (this.$store.state.design.shareuc.designData.ptype === 'umb') {
        customid = this.getCustomID(
          this.$store.state.design.shareuc.product.bone,
          this.$store.state.design.shareuc.option.auroraid,
          this.$store.state.design.shareuc.product.umbtype
        )
      } else if (this.$store.state.design.shareuc.designData.ptype === 'scarf') {
        customid = this.getCustomIDScarf(
          this.$store.state.design.shareuc.product.id
        )
      } else if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        customid = this.getCustomIDScarf(
          this.$store.state.design.shareuc.product.id
        )
      }
      const order = {
        name: this.uploadName,
        created: '',
        count: 1,
        status: 0,
        price: 0,
        completed: false,
        progress: 0,
        task: null,
        customid: customid,
        customname: '',
        amount: this.$store.state.design.shareuc.row.price
      }
      this.order = order
      // 保存json,缩略图到本地
      await this.saveLocal()
      const pid = this.$store.state.design.shareuc.designData.pid
      const opid = this.$store.state.design.shareuc.designData.opid
      const task = new UploadTask(pid, opid, order, this.isAddToCart)
      order.task = task
      await task.start(this.uploadData)
      console.log('上传结束', order.created)
      if (order.created !== '') {
        this.$store.state.design.shareuc.created = order.created
        const ptype = this.$store.state.design.shareuc.designData.ptype
        if (ptype === 'scarf') {
          order.customname = `#${order.created.split('_')[0]}_2 - ${
            this.$store.state.design.shareuc.row.text
          }`
        } else if (ptype === 'gift') {
          order.customname = `#${order.created.split('_')[0]}_4 - ${
            this.$store.state.design.shareuc.row.text
          }`
        } else {
          order.customname = `#${order.created.split('_')[0]} - ${
            this.$store.state.design.shareuc.row.text
          }`
        }
        this.$store.commit('addShopCart', {
          type: ptype,
          order
        })
        this.$store.commit('saveShopCart')
        this.$store.commit('setSnackbar', {
          active: true,
          msg: this.$t('lang.labelSaveSuccess'),
          color: 'success',
          timeout: 2000
        })
        if (!callback) {
          setTimeout(() => {
            this.isUploading = false
            this.$router.push('/shopcart')
          }, 1000)
        } else {
          callback(order.created)
        }
      } else {
        this.$store.commit('setSnackbar', {
          active: true,
          msg: this.$t('lang.labelSaveFail'),
          color: 'error',
          timeout: 2000
        })
        this.isUploading = false
      }
    },
    getCustomIDScarf (id) {
      let ret = ''
      this.$store.state.brand.brandJson.idList.forEach(item => {
        if (
          item.bone.toString() === id.toString()
        ) {
          ret = item.id
        }
      })
      return ret
    },
    getCustomID (bone, auroraid, umbtype) {
      console.log('getCustomID', bone, auroraid, umbtype)
      let ret = ''
      this.$store.state.brand.brandJson.idList.forEach(item => {
        if (
          item.bone.toString() === bone.toString() &&
          item.auroraid.toString() === auroraid.toString() &&
          item.umbtype === umbtype
        ) {
          ret = item.id
        }
      })
      return ret
    },
    cancelUpload () {
      this.isUploading = false
      if (this.order && this.order.task) {
        this.order.task.cancel()
      }
    },
    /**
     * 保存文件到本地
     */
    async saveLocal () {
      await this.saveTextCaptures()
      await this.saveJSON()
      await this.saveCaptures()
      await this.saveCapture3D()
    },

    async saveCapture3D () {
      if (this.$store.state.design.shareuc.designData.ptype === 'gift') {
        const base64List = await this.$parent.capture3Ds()
        for (let i = 0; i < base64List.length; i++) {
          let key = ''
          if (i === 0) {
            key = `${this.uploadName}_3d.png`
          } else {
            key = `${this.uploadName}_3d_${i}.png`
          }
          // await localForage.setItem(key, base64List[i])
          this.uploadData[key] = base64List[i]
          // console.log('保存缩略图3D', key, base64List[i])

          this.totalCount++
        }
      } else {
        const base64 = await this.$parent.capture3Ds()
        const key = `${this.uploadName}_3d.png`
        // await localForage.setItem(key, base64)
        this.uploadData[key] = base64
        // console.log('保存缩略图3D', key)

        this.totalCount++
      }
    },

    /**
     * 保存json
     */
    async saveJSON () {
      // 判断文字
      var design = JSON.parse(
        JSON.stringify(this.$store.state.design.shareuc.designData)
      )
      if (design.inprint.length > 0) {
        for (let i = 0; i < design.inprint.length; i++) {
          for (let j = 0; j < design.inprint[i].config.textlist.length; j++) {
            if (!design.inprint[i].config.textlist[j].visible) {
              delete design.inprint[i].config.textlist[j]
            }
          }
          for (let j = 0; j < design.inprint[i].config.imagelist.length; j++) {
            if (!design.inprint[i].config.imagelist[j].visible) {
              delete design.inprint[i].config.imagelist[j]
            }
          }
          design.inprint[i].config.textlist = design.inprint[
            i
          ].config.textlist.filter(function (val) {
            return val
          })
          design.inprint[i].config.imagelist = design.inprint[
            i
          ].config.imagelist.filter(function (val) {
            return val
          })
        }
      }

      this.$store.commit('setInfo')

      var upload = {
        info: this.$store.state.design.shareuc.info,
        design: design
      }

      const key = this.uploadName + '.json'
      // localForage.setItem(key, JSON.stringify(upload))
      this.uploadData[key] = JSON.stringify(upload)

      this.totalCount++
    },

    async saveTextCaptures () {
      let count = 0
      for (
        let i = 0;
        i < this.$store.state.design.shareuc.product.designArea.length;
        i++
      ) {
        const type = this.$store.state.design.shareuc.product.designArea[i]
        for (
          let j = 0;
          j < this.$store.state.design.shareuc.designData.inprint[type].length;
          j++
        ) {
          for (
            let k = 0;
            k <
            this.$store.state.design.shareuc.designData.inprint[type][j]
              .textlist.length;
            k++
          ) {
            const text = this.$store.state.design.shareuc.designData.inprint[
              type
            ][j].textlist[k]
            if (text.content !== '') {
              count++
              const base64 = this.$parent.$refs.pixiText.text2base64(
                text.content,
                text.font,
                text.fontcolor
              )
              text.image = `${this.uploadName}_text${count}.png`
              // await localForage.setItem(text.image, base64)
              this.uploadData[text.image] = base64
            }
          }
        }
      }
    },

    /**
     * 保存缩略图
     */
    async saveCaptures () {
      for (
        let i = 0;
        i < this.$store.state.design.shareuc.product.designArea.length;
        i++
      ) {
        const designArea = this.$store.state.design.shareuc.product.designArea[i]
        const canvasTexture = this.$store.state.design.textures[designArea]
        if (!canvasTexture) {
          return new Error(`!canvasTexture in ${designArea}`)
        }
        const base64 = canvasTexture.image.toDataURL('image/jpg')
        let key = ''
        if (designArea === 'umb') {
          key = `${this.uploadName}.jpg`
        } else {
          key = `${this.uploadName}_${utils.uperFirst(designArea)}.jpg`
        }
        // await localForage.setItem(key, base64)
        this.uploadData[key] = base64
        console.log('保存缩略图', key)

        this.totalCount++
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btnCancel {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -60px;
  margin-left: 40px;
  width: 4vh;
  height: 4vh;
}
</style>
