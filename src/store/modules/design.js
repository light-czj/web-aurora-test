import store from '@/store'

const state = {
  shareuc: {
    isSleeveDesigned: false,
    row: null,
    product: null,
    option: null,
    designData: {
      designid: '',
      handleColor: '',
      hookColor: '#000000',
      insideColor: '#000000',
      umbColor: '',
      inprint: {},
      ptype: ''
    },
    info: {},
    optionList: [],
    selectedColor: '',
    currentColor: '',
    pantone: '',
    lastColor: '',
    activeSticker: false,
    created: '',
    designArea: '',
    lineColor: '#ffffff',
    loading2d: false,
    quality: 100
  },
  cacheKeys: JSON.parse(localStorage.getItem('cache_design_keys') || '[]'),
  textures: {},
  size: []
}
const mutations = {
  createDesignArea (state, type) {
    state.shareuc.designData.inprint[type] = []
    // console.log('添加局部', type)
  },
  setInfo (state) {
    state.shareuc.info.version = store.state.config.version
    state.shareuc.info.brand = store.state.config.brand
  },
  setType3d (state, val) {
    state.shareuc.designData.type3d = val
  },
  setTexture (state, data) {
    state.textures[data.type] = data.texture
  },
  setRow (state, data) {
    state.shareuc.row = data
    if (data.designid) {
      state.shareuc.designData.designid = data.designid
    }
  },
  setProductByid (state, params) {
    console.log('setProductByid', params.ptype, params.id)

    state.shareuc.designData = {
      designArea: 'umb',
      ptype: params.ptype,
      pid: '',
      opid: '',
      designid: '',
      type3d: '',
      handleColor: '',
      umbColor: '',
      hookColor: '#000000',
      insideColor: '#000000',
      inprint: {}
    }
    var data = store.state.brand.brandJson
    var ptype = state.shareuc.designData.ptype
    state.shareuc.option = null
    data[ptype].some((item, index) => {
      if (item.id === params.id) {
        state.shareuc.product = item
        if (state.shareuc.product.sleeve === false) {
          sessionStorage.removeItem('printSleeve')
        }
        state.shareuc.designData.pid = item.id
        if (ptype === 'umb') {
          if (typeof data.handles === 'undefined') {
            state.shareuc.optionList = []
          } else {
            state.shareuc.optionList = data.handles.filter(
              (it, index, array) => {
                if (it.id === item.handle) {
                  state.shareuc.option = it
                }
                if (!item.handles) {
                  return false
                } else {
                  return item.handles.indexOf(it.id) > -1
                }
              }
            )
          }
          if (typeof item.handle === 'undefined') {
            state.shareuc.designData.opid = -1
          } else {
            state.shareuc.designData.opid = item.handle
          }
          if (
            typeof params.designid !== 'undefined' &&
            params.designid !== ''
          ) {
            state.shareuc.designData.designid = params.designid
          } else {
            state.shareuc.designData.designid = item.ks + 'w'
          }
          state.shareuc.designData.type3d = 'open'
        } else if (ptype === 'scarf') {
          sessionStorage.removeItem('printSleeve')
          state.shareuc.option = null
          state.shareuc.optionList = null
          state.shareuc.designData.opid = item.model
          state.shareuc.designData.designid = params.designid
          state.shareuc.designData.type3d = '1'
          state.shareuc.designData.edgeColor = '#ffffff'
          store.state.ui.color2d = '#ffffff'
          state.shareuc.designData.handleColor = '#EFEFD0'
          store.state.ui.color3d = '#EFEFD0'
        } else if (ptype === 'bag') {
          sessionStorage.removeItem('printSleeve')
          state.shareuc.option = null
          state.shareuc.optionList = null
          state.shareuc.designData.opid = item.model
          state.shareuc.designData.designid =
            state.shareuc.product.id.replace('silk', '') + '1'
          state.shareuc.designData.type3d = ''
        } else if (ptype === 'mask') {
          sessionStorage.removeItem('printSleeve')
          state.shareuc.option = null
          state.shareuc.optionList = null
          state.shareuc.designData.opid = item.model
          state.shareuc.designData.designid = params.designid
        } else if (ptype === 'gift') {
          sessionStorage.removeItem('printSleeve')
          state.shareuc.option = null
          state.shareuc.optionList = null
          state.shareuc.designData.opid = item.model
          state.shareuc.designData.designid = params.designid
        }
        return true
      }
    })

    if (!state.shareuc.product) {
      console.error('product不存在', params.id)
    }

    store.state.ui.update2d = true
  },
  setLocalData (state, data) {
    state.shareuc = data
  },
  addPatch (state, params) {
    if (
      typeof state.shareuc.designData.inprint[params.designArea] === 'undefined'
    ) {
      state.shareuc.designData.inprint[params.designArea] = []
    }
    state.shareuc.designData.inprint[params.designArea].push(params.entity)
    // console.log('addPatch', params)
  },
  setDesignid (state, data) {
    state.shareuc.designData.inprint = {}
    state.shareuc.designData.designid = data
    store.state.ui.update2d = true
  },
  setHandleColor (state, data) {
    state.shareuc.designData.handleColor = data
    store.state.ui.color3d = data
  },
  setEdgeColor (state, val) {
    state.shareuc.designData.edgeColor = val
    store.state.ui.color2d = val
  },
  setOption (state, opid) {
    if (opid === '') return
    if (typeof store.state.brand.brandJson.handles !== 'undefined') {
      store.state.brand.brandJson.handles.some((item, index) => {
        if (item.id === opid) {
          state.shareuc.designData.opid = opid
          state.shareuc.option = item
          return true
        }
      })
    } else {
      state.shareuc.designData.opid = ''
      state.shareuc.option = null
    }
  }
}
const actions = {}
const getters = {}

export default {
  state,
  mutations,
  actions,
  getters
}
