/**
 * Automatically provisions and installs locally-trusted TLS certificates for Node.js® https servers
 * (including Express.js, etc.) using mkcert.
 *
 * @module @small-tech/auto-encrypt-localhost
 * @copyright © 2020-2021 Aral Balkan, Small Technology Foundation.
 * @license AGPLv3 or later.
 */

import os from 'os'
import fs from 'fs-extra'
import path from 'path'
import https from 'https'
import syswidecas from 'syswide-cas'
import HttpServer from './lib/HttpServer.js'

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
   * people to add AutoEncryptLocalhost to their existing apps by importing the module
   * and prefixing their https.createServer(…) line with AutoEncryptLocalhost:
   *
   * @example import AutoEncryptLocalhost from '@small-tech/auto-encrypt-localhost'
   * const server = AutoEncryptLocalhost.https.createServer()
   *
   * @static
   */
  static get https () { return AutoEncryptLocalhost }

  static settingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')

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

    const settingsPath = AutoEncryptLocalhost.settingsPath
    this.settingsPath = settingsPath

    const options = _options || {}
    const listener = _listener || null

    const keyFilePath  = path.join(settingsPath, 'localhost-key.pem')
    const certFilePath = path.join(settingsPath, 'localhost.pem')
    const rootCAKeyFilePath = path.join(settingsPath, 'rootCA-key.pem')
    const rootCACertFilePath = path.join(settingsPath, 'rootCA.pem')

    const allOK = fs.existsSync(rootCACertFilePath) && fs.existsSync(rootCAKeyFilePath) && fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)

    if (!allOK) {
      console.log('Could not find all necessary certificate information. Panic!')
      process.exit(1)
    }

    // Add root store to Node to ensure Node recognises the certificates (e.g., when using https.get(), etc.)
    syswidecas.addCAs(rootCACertFilePath)

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
