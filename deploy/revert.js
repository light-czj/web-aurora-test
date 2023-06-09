#!/usr/bin/env node
const config = require('./config')
const connectServe = require('./lib/ssh')
const runCommand = require('./lib/commander')
const pkg = require('../package.json')

// 版本回退
async function main () {
  const version = '1.0.183'
  const deployDir = config.deployDir + 'web/' + pkg.name + '/'
  const ssh = await connectServe(config.ssh) // 连接
  await runCommand(ssh, 'ln -snf ' + deployDir + pkg.name + '-' + version + ' ' + pkg.name, config.deployDir) // 软连接
  process.exit()
}
main()
