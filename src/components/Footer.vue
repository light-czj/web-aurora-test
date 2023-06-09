<template>
  <div class="footer">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style lang="scss" scoped>
.footer {
  width: 100%;
  height: 7vh;
  min-height: 7vh;
  background-color: #cccccc;
  &-title {
    width: 100%;
    height: 7vh;
    line-height: 7vh;
    text-align: center;
  }
}
</style>
