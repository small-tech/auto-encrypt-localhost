#!/usr/bin/env node

////////////////////////////////////////////////////////////////////////////////
//
// Downloads and installs the version of mkcert specified in lib/mkcert.js
// for the platform this script is running on.
//
////////////////////////////////////////////////////////////////////////////////

import https from 'https'
import fs from 'fs-extra'
import path from 'path'

import { version, binaryName } from '../lib/mkcert.js'

const __dirname = new URL('.', import.meta.url).pathname

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
// Install the latest mkcert binary.
//

process.stdout.write(`> Installing mkcert v${version} binary… `)

// This is the directory we will save the binary into.
// (Placing it here for backwards compatibility with < v7.0.0 releases).
const mkcertBinariesDirectory = path.resolve(path.join(__dirname, '..', 'mkcert-bin'))

// Delete and recreate the mkcert-bin folder.
fs.removeSync(mkcertBinariesDirectory)
fs.mkdirpSync(mkcertBinariesDirectory)

const mkcertBinaryUrl = `https://github.com/FiloSottile/mkcert/releases/download/v${version}/${binaryName}`

const binaryRedirectUrl = (await secureGet(mkcertBinaryUrl)).location
const binaryPath = path.join(mkcertBinariesDirectory, binaryName)
await secureStreamToFile(binaryRedirectUrl, binaryPath)

// Make the binary executable.
fs.chmodSync(binaryPath, 0o755)

process.stdout.write('done.\n')
