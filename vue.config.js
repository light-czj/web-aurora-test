module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: './',
  devServer: {
    proxy: {
      '/shop': {
        target: 'https://jp.shareuc.com',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/shop': '/'
        }
      }
    }
  }
}
