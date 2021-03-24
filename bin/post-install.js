#!/usr/bin/env node

////////////////////////////////////////////////////////////////////////////////
//
// npm post-install script
//
//  1. Downloads and installs the version of mkcert specified in lib/mkcert.js
//     for the platform this script is running on.
//
//  2. Attempts to install certutil if it isn’t already installed and
//     if it can.
//
//  3. Creates the local root certificate authority using mkcert.
//
//  4. Generates TLS certificates for localhost as well as any IP addresses
//     that the machine is reachable from on the network (if you
//     change networks and you want to be reachable by IP, re-run npm i).
//
////////////////////////////////////////////////////////////////////////////////

import https from 'https'
import os from 'os'
import path from 'path'
import { log, print } from '../lib/util/log.js'

import { version, binaryName } from '../lib/mkcert.js'

import fs from 'fs-extra'

async function secureGet (url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      const statusCode = response.statusCode
      const location = response.headers.location

      // Reject if it’s not one of the status codes we are testing.
      if (statusCode !== 200 && statusCode !== 302) {
        reject({statusCode})
      }

      let body = ''
      response.on('data', _ => body += _)
      response.on('end', () => {
        resolve({statusCode, location, body})
      })
    })
  })
}

async function secureStreamToFile (url, filePath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath)
    https.get(url, response => {
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close()
        resolve()
      })
      fileStream.on('error', error => {
        fs.unlinkSync(filePath)
        reject(error)
      })
    })
  })
}

//
// Install the mkcert binary, create the host, and the certificates.
// This is done after every npm install. (Better to always have the
// latest and greatest mkcert available to all projects on an account
// that make use of it.)
//

const settingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')

log('  🔒️ Auto Encrypt Localhost (postinstall)')
log('  ────────────────────────────────────────────────────────────────────────')
print(`   ╰─ Installing mkcert v${version} binary… `)

// Delete and recreate the mkcert-bin folder.
fs.removeSync(settingsPath)
fs.mkdirpSync(settingsPath)

const mkcertBinaryUrl = `https://github.com/FiloSottile/mkcert/releases/download/v${version}/${binaryName}`

const binaryRedirectUrl = (await secureGet(mkcertBinaryUrl)).location
const binaryPath = path.join(settingsPath, binaryName)
await secureStreamToFile(binaryRedirectUrl, binaryPath)

// Make the binary executable.
fs.chmodSync(binaryPath, 0o755)

print('done.\n')

log('  ────────────────────────────────────────────────────────────────────────')
