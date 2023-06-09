// 打包之前删除控制台打印
var plugins = []
if (['production', 'prod'].includes(process.env.NODE_ENV)) {
  plugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: plugins
}
