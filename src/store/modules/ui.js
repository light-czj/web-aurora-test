import router from '@/router'
import store from '@/store'

const state = {
  bodyHeight: '0',
  activeDesignArea: false,
  firstCome: true,
  homeIndex: 1,
  galleryIndex: 0,
  loading: false,
  rotation: 0,
  zoom: 1,
  color2d: '#FFFFFF',
  color3d: '#EFEFD0',
  textColor: '#000000',
  imageColor: '#FFFFFF',
  inputText: '',
  os: {},
  agree: false,
  snackbar: {
    active: false,
    msg: '',
    color: 'success',
    timeout: -1
  },
  iframe: {
    title: '',
    url: '',
    showAgree: true,
    agree: true,
    from: '/'
  },
  update2d: false,
  update3d: false,
  canUndo: false,
  canRedo: false,
  step: 1,
  loaded3d: false,
  size: {
    tabWidth: 0,
    tabHeight: 0
  },
  lastPage: 'Home',
  designSleeve: false,
  showFileSizeConfirm: false,
  currentFont: '',
  colorType: '',
  tab: 'tab-5',
  showFilters: false,
  filter: 0,
  emojiIndex: 0,
  showStatus: false,
  progress: '',
  setZoom: false,
  setRotation: false,
  isZoomIn: false,
  activeKuapian: false
}
const mutations = {
  setPlatform (state) {
    var os = (function () {
      var ua = navigator.userAgent
      var isWindowsPhone = /(?:Windows Phone)/.test(ua)
      var isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone
      var isAndroid = /(?:Android)/.test(ua)
      var isFireFox = /(?:Firefox)/.test(ua)
      var isPad =
        /(?:iPad|PlayBook)/.test(ua) ||
        (isAndroid && !/(?:Mobile)/.test(ua)) ||
        (isFireFox && /(?:Tablet)/.test(ua))
      var isPhone = /(?:iPhone)/.test(ua) || isPad
      var isPC = (!isPhone && !isAndroid && !isSymbian)
      var isMini = ua.toLowerCase().indexOf('miniprogram') > -1
      var isLine = ua.toLowerCase().indexOf('line') > -1
      var isWX = ua.toLowerCase().indexOf('micromessenger') > -1
      var isIphoneX =
        /iphone/gi.test(window.navigator.userAgent) &&
        window.devicePixelRatio &&
        window.devicePixelRatio === 2 &&
        window.screen.width === 414 &&
        window.screen.height === 896
      return {
        isPad,
        isPhone,
        isAndroid,
        isPC,
        isMini,
        isLine,
        isWX,
        isIphoneX
      }
    })()
    state.os = os
  },
  setSnackbar (state, data) {
    state.snackbar = data
  },
  setIframe (state, data) {
    state.iframe = data
    router.push('/webview')
  }
}
const actions = {}
const getters = {
  textureSize: state => {
    if (store.state.config.urls.galleryUrl !== 'https://uc.shareuc.com/') {
      return '?x-oss-process=image/resize,w_1024'
    } else {
      return '?imageMogr2/thumbnail/1024x'
    }
  },
  productSize: state => {
    if (state.os.isPhone) {
      if (store.state.config.urls.galleryUrl !== 'https://uc.shareuc.com/') {
        return '?x-oss-process=image/resize,w_512'
      } else {
        return '?imageMogr2/thumbnail/512x'
      }
    } else {
      if (store.state.config.urls.galleryUrl !== 'https://uc.shareuc.com/') {
        return '?x-oss-process=image/resize,w_1024'
      } else {
        return '?imageMogr2/thumbnail/1024x'
      }
    }
  },
  gallerySize: state => {
    if (store.state.config.urls.galleryUrl !== 'https://uc.shareuc.com/') {
      if (store.state.config.jp) {
        if (state.os.isPhone) {
          return '?x-oss-process=image/resize,w_128'
        } else {
          return '?x-oss-process=image/resize,w_512'
        }
      } else {
        return ''
      }
    } else {
      if (state.os.isPhone) {
        return '?imageMogr2/thumbnail/128x'
      } else {
        return '?imageMogr2/thumbnail/512x'
      }
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
