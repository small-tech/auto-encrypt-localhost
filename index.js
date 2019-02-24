const os = require('os')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

const _platform = os.platform()
const _architecture = os.arch()

console.log(`${_platform} ${_architecture}`)

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

// We sync the version of this library with the version of mkcert.
const version = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).version

let mkcertBinary = path.join(__dirname, 'mkcert-bin', `mkcert-v${version}-${platform}-${architecture}`)

console.log('mkcertBinary', mkcertBinary)

if (platform === 'windows') mkcertBinary += '.exe'

//
// Check if your local certificate authority and your local keys exist.
// By convention, these are stored in:
//
// CA: ~/.nodecert/mkcert
// P12 file: ~/.nodecert/localhost.pem
// Key file: ~/.nodecert/localhost-key.pem
//

const homeDir = os.homedir()
const nodecertDir = path.join(homeDir, '.nodecert')

if (fs.existsSync(path.join(nodecertDir, 'rootCA.pem')) && fs.existsSync(path.join(nodecertDir, 'rootCA-key.pem')) && fs.existsSync(path.join(nodecertDir, 'localhost.pem')) && fs.existsSync(path.join(nodecertDir, 'localhost-key.pem'))) {
  console.log('> Local certificate authority and certificates already exist.')
} else {
  // Create certificates.
  console.log('> Creating local certificate authority and certificates…')
  if (!fs.existsSync(nodecertDir)) {
    fs.mkdirSync(nodecertDir)
  }
  childProcess.execFile(mkcertBinary, ['-install'], {env: { CAROOT: nodecertDir, path: process.env.path},}, (error, stdout, stderr) => {
    console.log('error', error)
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    childProcess.execFile(mkcertBinary, [`-key-file=${path.join(nodecertDir, 'localhost-key.pem')}`, `-cert-file=${path.join(nodecertDir, 'localhost.pem')}`, 'localhost', '127.0.0.1', '::1'], {env: { CAROOT: nodecertDir }}, (error, stdout, stderr) => {
      console.log('error', error)
      console.log('stdout', stdout)
      console.log('stderr', stderr)
    })
  })
}
