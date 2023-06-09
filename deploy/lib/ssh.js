
// eslint-disable-next-line camelcase
const node_ssh = require('node-ssh')
// eslint-disable-next-line new-cap
const ssh = new node_ssh()

function connectServe (sshInfo) {
  return new Promise((resolve, reject) => {
    ssh.connect({ ...sshInfo }).then(async () => {
      resolve(ssh)
    }).catch((err) => {
      reject(console.error('3-' + sshInfo.host + ' 连接失败', err))
    })
  })
}

module.exports = connectServe
