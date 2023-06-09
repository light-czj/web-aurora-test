<template>
  <v-container class="container" style="max-width: 600px;">
    <div @click="activeTimeline = !activeTimeline" style="text-align: right;cursor: pointer;">
      订单状态: {{ title }}
      <v-icon left v-if="activeTimeline">
        mdi-chevron-up
      </v-icon>
      <v-icon left v-else>
        mdi-chevron-down
      </v-icon>
    </div>
    <v-timeline
      v-if="activeTimeline"
      dense
      clipped
    >
      <v-timeline-item
        v-for="(item, index) in statusList"
        :key="'timeline' + index"
        class="mb-0 pb-0"
        :class="{ 'hide': !item.active }"
        :color="item.color"
        small
      >
        <v-row justify="space-between" :style="{ color: item.color }">
          <v-col cols="6">
            {{ item.jp }}
          </v-col>
          <v-col
            class="text-right"
            cols="6"
          >
            {{ item.timeValue !== 0 ? item.timeValue : '' }}
          </v-col>
        </v-row>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>

<script>
import dayjs from 'dayjs'
export default {
  props: {
    order: {
      default: () => {},
      type: Object
    }
  },
  data () {
    return {
      activeTimeline: false,
      status: -1,
      statusList: [
        { status: [0], zh: '设计完成', jp: 'デザイン完成', time: 'create_time', color: 'gray', required: true },
        // { status: [1], zh: '用户提交订单', jp: 'ユーザーが注文を出す', time: 'confirm_time', color: 'gray', required: true },
        // { status: [2, 4, 6, 7], zh: '订单审核通过', jp: '受注決定', time: 'audit_time', color: 'gray', required: true },
        // { status: [3, 5, 8], zh: '订单审核不通过', jp: '注文が承認されない', time: null, color: 'gray', required: false },
        { status: [9, 10, 16], zh: '工厂生产中', jp: '工場生産仕掛品', time: null, color: 'gray', required: true },
        // { status: [11], zh: '工厂生产完成', jp: '工場生産完了', time: null, color: 'gray', required: true },
        // { status: [12], zh: '已发货', jp: '出荷済み', time: null, color: 'gray', required: true },
        { status: [13, 14], zh: '已收货', jp: '受信', time: null, color: 'gray', required: true },
        // { status: [15], zh: '收到货后发现有问题', jp: '商品到着時に発見された問題点', time: null, color: 'gray', required: false },
        { status: [], zh: '订单计划送达时间', jp: '订单计划送达时间', time: 'expire_time', color: 'gray', required: true }
      ],
      events: [],
      input: null,
      nonce: 0
    }
  },
  computed: {
    title () {
      let ret = ''
      let currentIndex = 0
      this.statusList.forEach((item, index) => {
        item.timeValue = item.time ? this.order[item.time] : ''
        if (item.status.indexOf(this.order.status) > -1) {
          ret = item.jp
          item.color = '#1867c0'
          item.active = true
          currentIndex = index
        } else {
          item.color = '#808080'
          item.active = item.required ? item.required : false
        }
        if (item.time && typeof this.order[item.time] === 'number' && this.order[item.time] !== 0) {
          const temp = this.order[item.time]
          item.timeValue = dayjs.unix(temp).format('YYYY-MM-DD HH:mm:ss')
          console.log('解析时间', temp, dayjs.unix(temp).format('YYYY-MM-DD HH:mm:ss'))
        }
      })
      this.statusList.forEach((item, index) => {
        if (index < currentIndex) {
          item.color = '#779bc5'
        }
      })
      return ret
    },
    timeline () {
      return this.events.slice().reverse()
    }
  },
  mounted () {
    console.log(this.order)
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.container {
  position: absolute;
  right: 0;
}
</style>
