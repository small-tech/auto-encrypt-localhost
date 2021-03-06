import os from 'os'
import fs from 'fs-extra'
import path from 'path'
import bent from 'bent'
import test from 'tape'
import AutoEncryptLocalhost from '../index.js'

import '../bin/post-install.js'

const downloadString = bent('GET', 'string')
const downloadBuffer = bent('GET', 'buffer')

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

test('certificate creation', async t => {
  const settingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')

  const keyFilePath = path.join(settingsPath, 'localhost-key.pem')
  const certFilePath = path.join(settingsPath, 'localhost.pem')

  // Run Auto Encrypt Localhost.
  const server = AutoEncryptLocalhost.https.createServer((request, response) => {
    response.end('ok')
  })

  t.ok(fs.existsSync(path.join(settingsPath)), 'Main settings path exists.')
  t.ok(fs.existsSync(path.join(settingsPath, 'rootCA.pem')), 'Local certificate authority exists.')
  t.ok(fs.existsSync(path.join(settingsPath, 'rootCA-key.pem')), 'Local certificate authority private key exists.')
  t.ok(fs.existsSync(certFilePath), 'Local certificate exists.')
  t.ok(fs.existsSync(keyFilePath), 'Local certificate private key exists.')

  // Ensure that the certificate and private key in the returned server instance matches
  // what exists on the file system.
  const key = fs.readFileSync(keyFilePath, 'utf-8')
  const cert = fs.readFileSync(certFilePath, 'utf-8')

  t.strictEquals(server.key, key, 'Private key used in the https server instance matches key from disk.')
  t.strictEquals(server.cert, cert, 'Certificate used in https server instance matches key from disk.')

  await new Promise((resolve, reject) => {
    server.listen(443, () => {
      resolve()
    })
  })

  const response = await downloadString('https://localhost')

  t.strictEquals(response, 'ok', 'Response from server is as expected for access via localhost.')

  // Test access from all local interfaces with IPv4 addresses.
  const localIPv4Addresses =
    Object.entries(os.networkInterfaces())
    .map(iface =>
      iface[1].filter(addresses =>
        addresses.family === 'IPv4')
        .map(addresses => addresses.address)).flat()

  await asyncForEach(localIPv4Addresses, async localIPv4Address => {
    const response = await downloadString(`https://${localIPv4Address}`)
    t.strictEquals(response, 'ok', `Response from server is as expected for access via ${localIPv4Address}`)
  })

  // Test downloading the local root certificate authority public key via /.ca route.
  const downloadedRootCABuffer = await downloadBuffer('http://localhost/.ca')
  const localRootCABuffer = fs.readFileSync(path.join(AutoEncryptLocalhost.settingsPath, 'rootCA.pem'))

  t.strictEquals(Buffer.compare(localRootCABuffer, downloadedRootCABuffer), 0, 'The local root certificate authority public key is served correctly.')

  // Wait the for the first server to close.
  await new Promise((resolve, reject) => { server.close(() => { resolve() }) })

  t.end()
})


test ('multiple servers', t => {
  const server1Response = 'Server 1'
  const server2Response = 'Server 2'
  const server1 = AutoEncryptLocalhost.https.createServer((request, response) => { response.end(server1Response) })
  server1.listen(443, () => {
    const server2 = AutoEncryptLocalhost.https.createServer((request, response) => { response.end(server2Response) })
    server2.listen(444, async () => {
      const result1 = await downloadString('https://localhost')
      const result2 = await downloadString('https://localhost:444')

      t.strictEquals(result1, server1Response, 'Server 1 response is as expected.')
      t.strictEquals(result2, server2Response, 'Server 2 response is as expected.')

      server1.close(() => {
        server2.close(() => {
          t.end()
        })
      })
    })
  })
})
