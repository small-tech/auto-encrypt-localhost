const os = require('os')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

module.exports = function () {

  const _platform = os.platform()
  const _architecture = os.arch()

  const platformMap = {
    linux: 'linux',
    darwin: 'darwin',
    win32: 'windows'
  }

  const architectureMap = {
    arm: 'arm',
    x64: 'amd64'
  }

  const platform = platformMap[_platform]
  const architecture = architectureMap[_architecture]

  if (platform === undefined) throw new Error('Unsupported platform', _platform)
  if (architecture === undefined) throw new Error('Unsupported architecture', _architecture)

  const mkcertVersion = '1.3.0'

  let mkcertBinary = path.join(__dirname, 'mkcert-bin', `mkcert-v${mkcertVersion}-${platform}-${architecture}`)

  if (platform === 'windows') mkcertBinary += '.exe'

  const homeDir = os.homedir()
  const nodecertDir = path.join(homeDir, '.nodecert')

  // Check if the local certificate authority and local keys exist.
  function allOK() {
    return fs.existsSync(path.join(nodecertDir, 'rootCA.pem')) && fs.existsSync(path.join(nodecertDir, 'rootCA-key.pem')) && fs.existsSync(path.join(nodecertDir, 'localhost.pem')) && fs.existsSync(path.join(nodecertDir, 'localhost-key.pem'))
  }

  let log = []

  if (!allOK()) {
    // Create certificates.
    if (!fs.existsSync(nodecertDir)) {
      fs.mkdirSync(nodecertDir)
    }
    childProcess.execFile(mkcertBinary, ['-install'], {env: { CAROOT: nodecertDir, PATH: process.env.PATH},}, (error, stdout, stderr) => {
      log = log.concat([error, stdout, stderr])
      childProcess.execFile(mkcertBinary, [`-key-file=${path.join(nodecertDir, 'localhost-key.pem')}`, `-cert-file=${path.join(nodecertDir, 'localhost.pem')}`, 'localhost', '127.0.0.1', '::1'], {env: { CAROOT: nodecertDir }}, (error, stdout, stderr) => {
        log = log.concat([error, stdout, stderr])
        if (!allOK()) {
          console.log(log)
          process.exit(1)
        }
      })
    })
  }
}()
