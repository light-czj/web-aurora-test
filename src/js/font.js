import store from '@/store'
import axios from 'axios'
import utils from '@/js/utils'
import localForage from '@/js/localForage'
// import * as PIXI from 'pixi.js'

async function loadFont (name) {
  console.log('加载字体', name)
  const f = store.state.brand.brandJson.fontList.find(font => font.name === name)
  if (!f) return false
  if (f.loaded) return true
  if (f.url.endsWith('.fnt')) {
    return new Promise((resolve) => {
      resolve()
      // PIXI.Loader.shared.add(name, f.url).load(() => { resolve() })
    })
  } else {
    // 判断本地缓存
    const key = 'FONT_' + f.name.toUpperCase()
    const localFont = await localForage.getItem(key)
    let hashBase64 = ''
    if (!localFont) {
      const { data } = await axios({ url: f.url, responseType: 'blob' })
      hashBase64 = await utils.blobToBase64(data)
      localForage.setItem(key, hashBase64)
      console.log('请求', key)
    } else {
      hashBase64 = localFont
      console.log('缓存', key)
    }
    return new Promise((resolve, reject) => {
      const font = new FontFace(name, 'url(' + hashBase64 + ')', { style: 'normal', weight: 700 })
      font.load().then((loadedFontFace) => {
        document.fonts.add(loadedFontFace)
        f.loaded = true
        resolve()
      }).catch(function (error) {
        console.error('addFont failed. Maybe the font you are trying to load is too big?\n' + error)
        reject(error)
      })
    })
  }
}

function initWebFont () {
  // // Load them google fonts before starting...!
  window.WebFontConfig = {
    google: {
      families: store.getters.getFontList
    }
    // fontactive (familyName, fvd) {
    //   console.log('字体可用', familyName)
    // },
    // fontinactive (familyName, fvd) {
    //   console.log('字体不可用', familyName)
    // }
  };
  /* eslint-disable */
  // include the web-font loader script
  (function() {
      const wf = document.createElement('script');
      wf.src = `${document.location.protocol === 'https:' ? 'https' : 'http'
      }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
      wf.type = 'text/javascript';
      wf.async = 'true';
      const s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
  }());
  /* eslint-enabled */
}

export {
  initWebFont,
  loadFont
}
