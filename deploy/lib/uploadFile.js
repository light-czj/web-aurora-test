// uploadFile.js

async function uploadFile (ssh, localFile, targetFile) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    console.log('4-开始文件上传')
    // await handleSourceFile(ssh, config)
    ssh.putFile(localFile, targetFile).then(async () => {
      resolve(console.log('5-文件上传完成'))
    }, (err) => {
      reject(console.error('5-上传失败！', err))
    })
  })
}

module.exports = uploadFile
