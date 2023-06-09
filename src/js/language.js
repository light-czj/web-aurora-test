// 多语言
import utils from '@/js/utils'
/**
 * 切换语言
 * @param {语言} lang
 */
export const setLanguage = (lang) => {
  window.vue.$i18n.locale = lang
}

export const setLanguageAuto = () => {
  // 设置语言
  var systemLang = utils.getLanguage()
  var lang = ''
  if (systemLang === 'en-US') {
    lang = 'en'
  } else if (systemLang === 'ja-JP') {
    lang = 'jp'
  } else {
    lang = 'zh'
  }
  window.vue.$i18n.locale = lang
  console.log('系统语言', systemLang, '设置语言', lang)
}
