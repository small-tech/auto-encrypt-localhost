#!/usr/bin/env node

const https = require('https')
const fs = require('fs-extra')
const childProcess = require('child_process')
const path = require('path')
const assert = require('assert')

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

// Compare two semver strings (nn.nn.nn) and return 0 if they’re equal,
// 1 if a > b and -1 if a < b.
function semverCompare (a, b) {
  const [aMajor, aMinor, aPatch] = a.split('.').map(string => parseInt(string))
  const [bMajor, bMinor, bPatch] = b.split('.').map(string => parseInt(string))

  const aIsGreaterThanB =
    (aMajor > bMajor)
    || (aMajor === bMajor && aMinor > bMinor)
    || (aMajor === bMajor && aMinor === bMinor && aPatch > bPatch)

  return (a === b) ? 0 : aIsGreaterThanB ? 1 : -1
}

;(async ()=> {
  console.log('')
  console.log(' Update mkcert-bin script')
  console.log(' ════════════════════════')
  console.log('')

  // Get the version of the current release.
  const mkcertBinariesDirectory = path.resolve(path.join(__dirname, '..', 'mkcert-bin'))

  if (!fs.existsSync(mkcertBinariesDirectory)) {
    console.log(' Error: No mkcert-bin folder found. Exiting.\n')
    process.exit(1)
  }

  const currentMkcertBinaries = fs.readdirSync(mkcertBinariesDirectory)

  const currentMkcertVersionMatch = currentMkcertBinaries[0].match(/^mkcert-v(\d+\.\d+\.\d+)-/)
  if (currentMkcertVersionMatch === null) {
    console.log(' Error: Unable to ascertain current mkcert version. Exiting.\n')
    process.exit(1)
  }

  const currentMkcertVersion = currentMkcertVersionMatch[1]

  console.log(` Current mkcert version: ${currentMkcertVersion}`)

  // Get the location of the latest release page.
  const latestMkcertReleasesPage = await secureGet('https://github.com/FiloSottile/mkcert/releases/latest')

  assert (latestMkcertReleasesPage.location !== undefined, 'Location must exist (302 redirect).')

  // Get the latest release page.
  const actualLatestReleasePage = await secureGet(latestMkcertReleasesPage.location)

  assert(actualLatestReleasePage.location === undefined, 'Actual page should not be a redirect.')

  const page = actualLatestReleasePage.body

  const versionMatch = page.match(/href=\"\/FiloSottile\/mkcert\/releases\/tag\/v(\d+\.\d+\.\d+)\"/)

  assert(versionMatch !== null, 'Version should be found on page.')

  const latestMkcertVersion = versionMatch[1]

  assert(latestMkcertVersion !== undefined, 'Version capturing group should exist.')

  console.log(` Latest mkcert version : ${latestMkcertVersion}\n`)

  switch(semverCompare(currentMkcertVersion, latestMkcertVersion)) {
    case 0:
      console.log('You already have the latest release version of mkcert included in auto-encrypt-localhost. Exiting.')
      process.exit()

    case 1:
      console.log('Warning: It appears you have a later version than the release version included. Exiting.')
      process.exit()
  }

  console.log(' Upgrading the binaries to the latest version…\n')

  // Delete and recreate the mkcert-bin folder.
  fs.removeSync(mkcertBinariesDirectory)
  fs.mkdirpSync(mkcertBinariesDirectory)

  const mkcertReleaseUrlPrefix = `https://github.com/FiloSottile/mkcert/releases/download/v${latestMkcertVersion}`

  const latestMkcertBinaries = [
    {
      platform: 'Linux AMD 64-bit',
      binaryName: `mkcert-v${latestMkcertVersion}-linux-amd64`
    },
    {
      platform: 'Linux ARM',
      binaryName: `mkcert-v${latestMkcertVersion}-linux-arm`
    },
    {
      platform: 'Linux ARM64',
      binaryName: `mkcert-v${latestMkcertVersion}-linux-arm64`
    },
    {
      platform: 'Darwin (masOS) AMD 64-bit',
      binaryName: `mkcert-v${latestMkcertVersion}-darwin-amd64`
    },
    {
      platform: 'Windows AMD 64-bit',
      binaryName: `mkcert-v${latestMkcertVersion}-windows-amd64.exe`
    }
  ]

  for (mkcertBinary of latestMkcertBinaries) {
    const mkcertBinaryUrl = `${mkcertReleaseUrlPrefix}/${mkcertBinary.binaryName}`

    console.log(` ${mkcertBinary.platform}`)
    console.log(` ${'─'.repeat(mkcertBinary.platform.length)}`)

    console.log('   ├ Downloading binary…')

    const binaryRedirectUrl = (await secureGet(mkcertBinaryUrl)).location
    const binaryPath = path.join(mkcertBinariesDirectory, mkcertBinary.binaryName)
    await secureStreamToFile(binaryRedirectUrl, binaryPath)

    console.log(`   ╰ Upgraded to ${mkcertBinary.binaryName}\n`)
  }

  console.log(' Done.\n')
})()
