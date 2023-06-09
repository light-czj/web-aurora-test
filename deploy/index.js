#!/usr/bin/env node
const path = require('path')
const config = require('./config')
const compressFile = require('./lib/compress')
const connectServe = require('./lib/ssh')
const uploadFile = require('./lib/uploadFile')
const runCommand = require('./lib/commander')
const pkg = require('../package.json')
const fs = require('fs-extra')

// 部署到服务器
async function main () {
  const zipName = `${pkg.name}-${pkg.version}.zip`
  const localFile = path.join(__dirname, 'dist.zip')
  if (config.openCompress) {
    // 删除dist.zip
    await fs.remove(localFile)
    await compressFile(config.targetDir, localFile)
  }
  const deployDir = config.deployDir + 'web/' + pkg.name + '/'
  const ssh = await connectServe(config.ssh) // 连接
  await uploadFile(ssh, localFile, deployDir + zipName) // 上传
  await runCommand(ssh, 'unzip ' + zipName, deployDir) // 解压
  await runCommand(ssh, 'mv dist ' + zipName.replace('.zip', ''), deployDir) // 修改文件名称
  await runCommand(ssh, 'rm -f ' + zipName, deployDir) // 删除.zip
  await runCommand(ssh, 'ln -snf ' + deployDir + zipName.replace('.zip', '') + ' ' + pkg.name, config.deployDir) // 软连接
  process.exit()
}
main()
