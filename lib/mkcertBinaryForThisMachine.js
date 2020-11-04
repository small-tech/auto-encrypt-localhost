const os      = require('os')
const fs      = require('fs-extra')
const path    = require('path')
const { log } = require('../lib/util/log')

/**
 * Returns the mkcert binary for this machine (platform + architecture) and
 * throws an error if there isn’t one for it.
 *
 * @param {String} settingsPath The path to store CA and certificate information at.
 * @returns {String} Path to the mkcert binary for this machine.
 * @alias module
 */
function mkcertBinaryForThisMachine (settingsPath) {
  const platformMap = {
    linux: 'linux',
    darwin: 'darwin',
    win32: 'windows'
  }

  const architectureMap = {
    arm: 'arm',
    arm64: 'arm64',
    x64: 'amd64'
  }

  const platform = platformMap[os.platform()]
  const architecture = architectureMap[os.arch()]

  if (platform === undefined) throw new Error('Unsupported platform', os.platform())
  if (architecture === undefined) throw new Error('Unsupported architecture', os.arch())

  const mkcertVersion = '1.4.2'

  const mkcertBinaryName = `mkcert-v${mkcertVersion}-${platform}-${architecture}`
  const mkcertBinaryRelativePath = path.join('..', 'mkcert-bin', mkcertBinaryName)
  let mkcertBinaryInternalPath = path.join(__dirname, mkcertBinaryRelativePath)

  if (platform === 'windows') mkcertBinaryInternalPath += '.exe'

  // Check if the platform + architecture combination is supported.
  if (!fs.existsSync(mkcertBinaryInternalPath)) throw new Error(`Unsupported platform + architecture combination for ${platform}-${architecture}`)

  // Check if an earlier version of the mkcert binary exists at the settings directory. If so, nuke and recreate the
  // settings directory so that the certificate is recreated using the latest version of Auto Encrypt Localhost
  // after an upgrade.
  const currentMkcertBinaryName = fs.readdirSync(settingsPath).filter(fileName => fileName.startsWith('mkcert'))[0]

  if (currentMkcertBinaryName !== undefined && currentMkcertBinaryName !== mkcertBinaryName) {
    const versionRegularExpression = /^mkcert-v(\d+\.\d+\.\d+)-/
    const oldVersion = currentMkcertBinaryName.match(versionRegularExpression)[1]
    const newVersion = mkcertBinaryName.match(versionRegularExpression)[1]
    log(`\n   🔼    ❨auto-encrypt-localhost❩ Upgrading mkcert from version ${oldVersion} to version ${newVersion}. Certificates will be recreated.`)
    fs.removeSync(settingsPath)
    fs.ensureDirSync(settingsPath)
  }

  // Copy the mkcert binary to the external Auto Encrypt Localhost directory so that we can call execSync() on it if
  // the app using this module is wrapped into an executable using Nexe (https://github.com/nexe/nexe) – like
  // Site.js (https://sitejs.org) is, for example. We use readFileSync() and writeFileSync() as
  // Nexe does not support copyFileSync() yet (see https://github.com/nexe/nexe/issues/607).
  const mkcertBinaryExternalPath = path.join(settingsPath, mkcertBinaryName)

  if (!fs.existsSync(mkcertBinaryExternalPath)) {
    try {
      const mkcertBuffer = fs.readFileSync(mkcertBinaryInternalPath, 'binary')
      fs.writeFileSync(mkcertBinaryExternalPath, mkcertBuffer, {encoding: 'binary', mode: 0o755})
    } catch (error) {
      throw new Error(`   🤯    ❨auto-encrypt-localhost❩ Panic: Could not copy mkcert to external directory: ${error.message}`)
    }
  }

  return mkcertBinaryExternalPath
}

module.exports = mkcertBinaryForThisMachine
