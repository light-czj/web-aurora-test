import localforage from 'localforage'

export default {
  setItem: async function (key, value) {
    return new Promise((resolve, reject) => {
      localforage.setItem(key, value).then(value => {
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  },
  getItem: async function (key) {
    return new Promise((resolve, reject) => {
      localforage.getItem(key).then(value => {
        resolve(value)
      }).catch(err => {
        reject(err)
      })
    })
  },
  removeItem: async function (key) {
    return new Promise((resolve, reject) => {
      localforage.removeItem(key).then(() => {
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  },
  clear: async function () {
    return new Promise((resolve, reject) => {
      localforage.clear().then(() => {
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  }
}
