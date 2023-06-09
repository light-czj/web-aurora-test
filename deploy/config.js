const fs = require('fs')

const config = {
  ssh: {
    host: '47.74.10.113',
    port: '22',
    username: 'root',
    privateKey: fs.readFileSync('C:/Users/Administrator/.ssh/id_rsa', 'utf8') // 公钥添加到服务端
  },
  targetDir: './dist', // 目标压缩目录(可使用相对地址)
  targetFile: 'dist.zip', // 目标文件
  openCompress: true, // 是否开启压缩
  deployDir: '/var/www/html/' // 远端目录
}

module.exports = config
