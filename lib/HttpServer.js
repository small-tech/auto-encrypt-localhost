
////////////////////////////////////////////////////////////////////////////////
//
// HttpServer
//
// (Singleton; please use HttpServer.getSharedInstance() to access.)
//
// A simple HTTP server that:
//
//   1. Forwards http requests to https requests using a 307 redirect.
//   2. Serves the local root certificate authority public key at /.ca
//
// Copyright © 2020 Aral Balkan, Small Technology Foundation.
// License: AGPLv3 or later.
//
////////////////////////////////////////////////////////////////////////////////

const fs            = require('fs')
const path          = require('path')
const http          = require('http')
const encodeUrl     = require('encodeurl')
const enableDestroy = require('server-destroy')
const { log }       = require('./util/log')

class HttpServer {
  //
  // Singleton access (async).
  //
  static instance = null
  static isBeingInstantiatedViaSingletonFactoryMethod = false

  static async getSharedInstance (settingsPath) {
    if (HttpServer.instance === null) {
      HttpServer.isBeingInstantiatedViaSingletonFactoryMethod = true
      HttpServer.instance = new HttpServer(settingsPath)
      await HttpServer.instance.init()
    }
    return HttpServer.instance
  }

  static async destroySharedInstance () {
    if (HttpServer.instance === null) {
      log('   🚮    ❨auto-encrypt-localhost❩ HTTP Server was never setup. Nothing to destroy.')
      return
    }
    log('   🚮    ❨auto-encrypt-localhost❩ Destroying HTTP Server…')
    await HttpServer.instance.destroy()
    HttpServer.instance = null
    log('   🚮    ❨auto-encrypt-localhost❩ HTTP Server is destroyed.')
  }

  //
  // Private.
  //

  constructor (settingsPath) {
    // Ensure singleton access.
    if (HttpServer.isBeingInstantiatedViaSingletonFactoryMethod === false) {
      throw new Error('HttpServer is a singleton. Please instantiate using the HttpServer.getSharedInstance() method.')
    }
    HttpServer.isBeingInstantiatedViaSingletonFactoryMethod = false

    const localRootCertificateAuthorityPublicKeyPath = path.join(settingsPath, 'rootCA.pem')


    this.server = http.createServer((request, response) => {
      if (request.url === '/.ca') {
        log('   📜    ❨auto-encrypt-localhost❩ Serving local root certificate authority public key at /.ca')

        if (!fs.existsSync(localRootCertificateAuthorityPublicKeyPath)) {
          log('   ❌    ❨auto-encrypt-localhost❩ Error: could not fing rootCA.pem file at ${localRootCertificateAuthorityPublicKeyPath}.')
          response.writeHead(404, {'Content-Type': 'text/plain'})
          response.end('Not found.')
          return
        }

        response.writeHead(
          200,
          {
            'Content-Type': 'application/x-pem-file',
            'Content-Disposition': 'attachment; filename="rootCA.pem"'
          }
        )

        const stream = fs.createReadStream(localRootCertificateAuthorityPublicKeyPath)
        stream.pipe(response)

        response.on('error', error => {
          log(`   ❌    ❨auto-encrypt-localhost❩ Error while writing rootCA.pem to response: ${error}`)
        })

        stream.on('error', error => {
          log(`   ❌    ❨auto-encrypt-localhost❩ Error while reading rootCA.pem: ${error}`)
        })

      } else {
        // Act as an HTTP to HTTPS forwarder.
        // (This means that servers using Auto Encrypt will get automatic HTTP to HTTPS forwarding
        // and will not fail if they are accessed over HTTP.)
        let httpsUrl = null
        try {
          httpsUrl = new URL(`https://${request.headers.host}${request.url}`)
        } catch (error) {
          log(`   ⚠    ❨auto-encrypt-localhost❩ Failed to redirect HTTP request: ${error}`)
          response.statusCode = 403
          response.end('403: forbidden')
          return
        }

        // Redirect HTTP to HTTPS.
        log(`   👉    ❨auto-encrypt-localhost❩ Redirecting HTTP request to HTTPS.`)
        response.statusCode = 307
        response.setHeader('Location', encodeUrl(httpsUrl))
        response.end()
      }
    })

    // Enable server to be destroyed without waiting for any existing connections to close.
    // (While there shouldn’t be any existing connections and while the likelihood of someone
    // trying to denial-of-service this very low, it’s still the right thing to do.)
    enableDestroy(this.server)
  }

  async init () {
    // Note: the server is created on Port 80. On Linux, you must ensure that the Node.js process has
    // ===== the correct privileges for this to work. Looking forward to removing this notice once Linux
    // leaves the world of 1960s mainframe computers and catches up to other prominent operating systems
    // that don’t have this archaic restriction which is security theatre at best and a security
    // vulnerability at worst in the global digital network age.
    await new Promise((resolve, reject) => {

      this.server.on('error', error => {
        if (error.code === 'EADDRINUSE') {
          console.log('   ❕    ❨auto-encrypt-localhost❩ Port 80 is busy; skipping http redirection server for this instance.')
          resolve()
          return
        }
        reject(error)
      })

      this.server.listen(80, (error) => {
        log(`   ✨    ❨auto-encrypt-localhost❩ HTTP server is listening on port 80.`)
        resolve()
      })
    })
  }

  async destroy () {
    // Starts killing all connections and closes the server.
    this.server.destroy()

    // Wait until the server is closed before returning.
    await new Promise((resolve, reject) => {
      this.server.on('close', () => {
        resolve()
      })
      this.server.on('error', (error) => {
        reject(error)
      })
    })
  }
}

module.exports = HttpServer
