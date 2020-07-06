/**
 * Automatically provisions and installs locally-trusted TLS certificates for Node.js® https servers
 * (including Express.js, etc.) using mkcert.
 *
 * @module @small-tech/auto-encrypt-localhost
 * @copyright © 2020 Aral Balkan, Small Technology Foundation.
 * @license AGPLv3 or later.
 */

const os                         = require('os')
const fs                         = require('fs-extra')
const path                       = require('path')
const https                      = require('https')
const childProcess               = require('child_process')
const syswidecas                 = require('syswide-cas')
const mkcertBinaryForThisMachine = require('./lib/mkcertBinaryForThisMachine')
const installCertutil            = require('./lib/installCertutil')
const { log }                    = require('./lib/util/log')

/**
 * Auto Encrypt Localhost is a static class. Please do not instantiate.
 *
 * Use: AutoEncryptLocalhost.https.createServer(…)
 *
 * @alias module:@small-tech/auto-encrypt-localhost
 */
class AutoEncryptLocalhost {
  /**
   * By aliasing the https property to the AutoEncryptLocalhost static class itself, we enable
   * people to add AutoEncryptLocalhost to their existing apps by requiring the module
   * and prefixing their https.createServer(…) line with AutoEncryptLocalhost:
   *
   * @example const AutoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')
   * const server = AutoEncryptLocalhost.https.createServer()
   *
   * @static
   */
  static get https () { return AutoEncryptLocalhost }

  /**
   * Automatically provisions trusted development-time (localhost) certificates in Node.js via mkcert.
   *
   * @static
   * @param {Object}   [options]               Optional HTTPS options object with optional additional
   *                                           Auto Encrypt-specific configuration settings.
   * @param {String}   [options.settingsPath=~/.small-tech.org/auto-encrypt-localhost/]
   *                                           Custom path to save the certificate and private key to.
   * @returns {https.Server} The server instance returned by Node’s https.createServer() method.
   */
  static createServer(_options, _listener) {
    // The first parameter is optional. If omitted, the first argument, if any, is treated as the request listener.
    if (typeof _options === 'function') {
      _listener = _options
      _options = {}
    }

    const defaultSettingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')
    const options             = _options             || {}
    const listener            = _listener            || null
    const settingsPath        = options.settingsPath || defaultSettingsPath

    const keyFilePath  = path.join(settingsPath, 'localhost-key.pem')
    const certFilePath = path.join(settingsPath, 'localhost.pem')

    const allOK = () => {
      return fs.existsSync(path.join(settingsPath, 'rootCA.pem')) && fs.existsSync(path.join(settingsPath, 'rootCA-key.pem')) && fs.existsSync(path.join(settingsPath, 'localhost.pem')) && fs.existsSync(path.join(settingsPath, 'localhost-key.pem'))
    }

    // Ensure the Auto Encrypt Localhost directory exists.
    fs.ensureDirSync(settingsPath)

    // Get a path to the mkcert binary for this machine.
    const mkcertBinary = mkcertBinaryForThisMachine(settingsPath)

    // Create certificates.
    if (!allOK()) {
      log('   📜    ❨auto-encrypt-localhost❩ Setting up…')

      // On Linux and on macOS, mkcert uses the Mozilla nss library.
      // Try to install this automatically and warn the person if we can’t so
      // that they can do it manually themselves.
      installCertutil()

      // mkcert uses the CAROOT environment variable to know where to create/find the certificate authority.
      // We also pass the rest of the system environment to the spawned processes.
      const mkcertProcessOptions = {
        env: process.env,
        stdio: 'pipe'     // suppress output
      }
      mkcertProcessOptions.env.CAROOT = settingsPath

      try {
        // Create the local certificate authority.
        log('   📜    ❨auto-encrypt-localhost❩ Creating local certificate authority (local CA) using mkcert…')
        childProcess.execFileSync(mkcertBinary, ['-install'], mkcertProcessOptions)
        log('   📜    ❨auto-encrypt-localhost❩ Local certificate authority created.')
        // Create the local certificate.
        log('   📜    ❨auto-encrypt-localhost❩ Creating local TLS certificates using mkcert…')

        // Support all local interfaces so that the machine can be reached over the local network via IPv4.
        // This is very useful for testing with multiple devices over the local area network without needing to expose
        // the machine over the wide area network/Internet using a service like ngrok.
        const localIPv4Addresses =
        Object.entries(os.networkInterfaces())
        .map(iface =>
          iface[1].filter(addresses =>
            addresses.family === 'IPv4')
            .map(addresses => addresses.address)).flat()

        const certificateDetails = [
          `-key-file=${keyFilePath}`,
          `-cert-file=${certFilePath}`,
          'localhost'
        ].concat(localIPv4Addresses)

        childProcess.execFileSync(mkcertBinary, certificateDetails, mkcertProcessOptions)
        log('   📜    ❨auto-encrypt-localhost❩ Local TLS certificates created.')
      } catch (error) {
        log('\n', error)
      }

      if (!allOK()) {
        process.exit(1)
      }
    } else {
      log('   📜    ❨auto-encrypt-localhost❩ Local development TLS certificate exists.')
    }

    // Add root store to Node to ensure Node recognises the certificates (e.g., when using https.get(), etc.)
    const rootCA = path.join(settingsPath, 'rootCA.pem')
    syswidecas.addCAs(rootCA)

    // Load in and return the certificates in an object that can be passed
    // directly to https.createServer() if required.
    options.key  = fs.readFileSync(keyFilePath, 'utf-8')
    options.cert = fs.readFileSync(certFilePath, 'utf-8')

    const server = https.createServer(options, listener)
    return server
  }
}

module.exports = AutoEncryptLocalhost
