const os   = require('os')
const fs   = require('fs-extra')
const path = require('path')

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
    x64: 'amd64'
  }

  const platform = platformMap[os.platform()]
  const architecture = architectureMap[os.arch()]

  if (platform === undefined) throw new Error('Unsupported platform', os.platform())
  if (architecture === undefined) throw new Error('Unsupported architecture', os.arch())

  const mkcertVersion = '1.4.0'

  const mkcertBinaryName = `mkcert-v${mkcertVersion}-${platform}-${architecture}`
  const mkcertBinaryRelativePath = path.join('..', 'mkcert-bin', mkcertBinaryName)
  let mkcertBinaryInternalPath = path.join(__dirname, mkcertBinaryRelativePath)

  if (platform === 'windows') mkcertBinaryInternalPath += '.exe'

  // Check if the platform + architecture combination is supported.
  if (!fs.existsSync(mkcertBinaryInternalPath)) throw new Error(`Unsupported platform + architecture combination for ${platform}-${architecture}`)

  // Copy the mkcert binary to the external Auto Encrypt Localhost directory so that we can call execSync() on it if
  // the app using this module is wrapped into an executable using Nexe (https://github.com/nexe/nexe) – like
  // Indie Web Server (https://ind.ie/web-server) is, for example. We use readFileSync() and writeFileSync() as
  // Nexe does not support copyFileSync() yet (see https://github.com/nexe/nexe/issues/607).
  const mkcertBinaryExternalPath = path.join(settingsPath, mkcertBinaryName)

  try {
    const mkcertBuffer = fs.readFileSync(mkcertBinaryInternalPath, 'binary')
    fs.writeFileSync(mkcertBinaryExternalPath, mkcertBuffer, {encoding: 'binary', mode: 0o755})
  } catch (error) {
    throw new Error(`   🤯    ❨Auto Encrypt Localhost❩ Panic: Could not copy mkcert to external directory: ${error.message}`)
  }

  return mkcertBinaryExternalPath
}

module.exports = mkcertBinaryForThisMachine
