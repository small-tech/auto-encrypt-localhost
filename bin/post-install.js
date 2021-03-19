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
import childProcess from 'child_process'

import { binaryPath as mkcertBinary } from '../lib/mkcert.js'
import installCertutil from '../lib/installCertutil.js'
import { version, binaryName } from '../lib/mkcert.js'

import fs from 'fs-extra'

import sudoPrompt from 'sudo-prompt'

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

console.log('  🔒️ Auto Encrypt Localhost (postinstall)')
console.log('  ────────────────────────────────────────────────────────────────────────')
process.stdout.write(`   ╰─ Installing mkcert v${version} binary… `)

// Delete and recreate the mkcert-bin folder.
fs.removeSync(settingsPath)
fs.mkdirpSync(settingsPath)

const mkcertBinaryUrl = `https://github.com/FiloSottile/mkcert/releases/download/v${version}/${binaryName}`

const binaryRedirectUrl = (await secureGet(mkcertBinaryUrl)).location
const binaryPath = path.join(settingsPath, binaryName)
await secureStreamToFile(binaryRedirectUrl, binaryPath)

// Make the binary executable.
fs.chmodSync(binaryPath, 0o755)

process.stdout.write('done.\n')

//
// Create the root certificate authority and certificates.
//
const caCertFilePath = path.join(settingsPath, 'rootCA.pem')
const caKeyFilePath = path.join(settingsPath, 'rootCA-key.pem')
const keyFilePath  = path.join(settingsPath, 'localhost-key.pem')
const certFilePath = path.join(settingsPath, 'localhost.pem')

const allOK = () => {
  return fs.existsSync(caCertFilePath)
    && fs.existsSync(caKeyFilePath)
    && fs.existsSync(certFilePath)
    && fs.existsSync(keyFilePath)
}

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
].concat(localIPv4Addresses).join(' ')

const account = os.userInfo().username

// Create the local certificate authority.
process.stdout.write(`   ╰─ Initialising mkcert… `)

// We are using the sudo-prompt package here, instead of childProcess.execFileSync() because
// this script is meant to run as an npm script and it appears that npm scripts fail to show
// the system sudo prompt (and instead hang).
//
// See: https://github.com/npm/cli/issues/2887
//
// To workaround this issue, we use sudo-prompt here to display a graphical sudo prompt
// that works well with npm scripts.
//
// Since on macOS the certificate files are created with root permissions, we need to set
// files back to regular account permissions afterwards (this is not an issue on Linux
// where the files are created with regular account permissions even when the mkcert command
// is launched using sudo). In any case, because of this, and because we want the person
// to only enter their password once instead of multiple times, once for each command
// (due to how sudo-prompt works), we first create a shell script and then we execute that.
//
// TODO: Figure out what to do for Windows.


const shellScriptTemplate = `#!/bin/bash
set -e
# Install mkcert and create the certificate authority
${mkcertBinary} -install

# Create the certificates
${mkcertBinary} ${certificateDetails}

# Reset file permissions to regular account
chown -R ${account} ${settingsPath}
`

fs.writeFileSync('/tmp/install-mkcert.sh', shellScriptTemplate, {mode: 0o755})

await (() => {
  return new Promise((resolve, reject) => {
    sudoPrompt.exec(`/tmp/install-mkcert.sh`, {name: 'Auto Encrypt Localhost'}, function(error, stdout, stderr) {
      if (error) reject(error)
      resolve()
    })
  })
})()

process.stdout.write('done.\n')

// This should never happen as an error in the above, if there is one,
// should exit the process, but just in case.
if (!allOK()) {
  console.log('   ╰─ ❌️ Certificate creation failed. Panic!')
  process.exit(1)
} else {
  console.log('  ────────────────────────────────────────────────────────────────────────')
}
