import store from '@/store'
import * as _ from 'lodash'
import localforage from 'localforage'

/**
 * 获取相册
 */
function loadAlbums () {
  localforage.getItem('ALBUM').then(val => {
    store.state.album.list = val || []
    // console.log('相册记录', val)
  })
}

/**
 * 保存相册
 */
function saveAlbums () {
  try {
    const albums = _.cloneDeep(store.state.album.list)
    albums.forEach(item => {
      item.task = null
      item.file = true
    })
    localforage.setItem('ALBUM', albums)
  } catch (error) {
    console.log(error)
  }
}

/**
 * 删除相册
 */
function deleteAlbum (index) {
  store.state.album.list.splice(index, 1)
  saveAlbums()
}

export {
  loadAlbums,
  saveAlbums,
  deleteAlbum
}
