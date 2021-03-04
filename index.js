/**
 * Automatically provisions and installs locally-trusted TLS certificates for Node.js® https servers
 * (including Express.js, etc.) using mkcert.
 *
 * @module @small-tech/auto-encrypt-localhost
 * @copyright © 2020 Aral Balkan, Small Technology Foundation.
 * @license AGPLv3 or later.
 */

import os from 'os'
import fs from 'fs-extra'
import path from 'path'
import https from 'https'
import childProcess from 'child_process'
import syswidecas from 'syswide-cas'
import mkcertBinaryForThisMachine from './lib/mkcertBinaryForThisMachine.js'
import installCertutil from './lib/installCertutil.js'
import HttpServer from './lib/HttpServer.js'
import { log } from './lib/util/log.js'

/**
 * Auto Encrypt Localhost is a static class. Please do not instantiate.
 *
 * Use: AutoEncryptLocalhost.https.createServer(…)
 *
 * @alias module:@small-tech/auto-encrypt-localhost
 */
export default class AutoEncryptLocalhost {
  /**
   * By aliasing the https property to the AutoEncryptLocalhost static class itself, we enable
   * people to add AutoEncryptLocalhost to their existing apps by requiring the module
   * and prefixing their https.createServer(…) line with AutoEncryptLocalhost:
   *
   * @example import AutoEncryptLocalhost from '@small-tech/auto-encrypt-localhost'
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

    this.settingsPath = settingsPath

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

    //
    // Monkey-patch the server.
    //
    server.__autoEncryptLocalhost__self = this

    // Monkey-patch the server’s listen method so that we can start up the HTTP
    // Server at the same time.
    server.__autoEncryptLocalhost__originalListen = server.listen
    server.listen = function(...args) {
      // Start the HTTP server.
      HttpServer.getSharedInstance(settingsPath).then(() => {
        // Start the HTTPS server.
        return this.__autoEncryptLocalhost__originalListen.apply(this, args)
      })
    }


    // Monkey-patch the server’s close method so that we can perform clean-up and
    // shut down the HTTP server transparently when server.close() is called.
    server.__autoEncryptLocalhost__originalClose = server.close
    server.close = function (...args) {
      // Shut down the HTTP server.
      HttpServer.destroySharedInstance().then(() => {
        // Shut down the HTTPS server.
        return this.__autoEncryptLocalhost__originalClose.apply(this, args)
      })
    }

    return server
  }
}
