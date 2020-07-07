const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const bent = require('bent')
const test = require('tape')
const AutoEncryptLocalhost = require('..')

const downloadString = bent('GET', 'string')
const downloadBuffer = bent('GET', 'buffer')

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

test('certificate creation', async t => {
  // t.plan(12)

  const defaultSettingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')

  const keyFilePath = path.join(defaultSettingsPath, 'localhost-key.pem')
  const certFilePath = path.join(defaultSettingsPath, 'localhost.pem')

  // Remove the settings path in case it already exists.
  fs.removeSync(defaultSettingsPath)

  // Run Auto Encrypt Localhost.
  const server = AutoEncryptLocalhost.https.createServer((request, response) => {
    response.end('ok')
  })

  t.ok(fs.existsSync(path.join(defaultSettingsPath)), 'Main settings path exists.')
  t.ok(fs.existsSync(path.join(defaultSettingsPath, 'rootCA.pem')), 'Local certificate authority exists.')
  t.ok(fs.existsSync(path.join(defaultSettingsPath, 'rootCA-key.pem')), 'Local certificate authority private key exists.')
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

  server.close()

  //
  // Custom settings path.
  //

  const customSettingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost-custom-directory-test', 'second-level-directory')

  // Remove the custom settings path in case it already exists.
  fs.removeSync(customSettingsPath)

  const server2 = AutoEncryptLocalhost.https.createServer({ settingsPath: customSettingsPath })

  t.ok(fs.existsSync(path.join(customSettingsPath)), '(Custom settings path) Main directory exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'rootCA.pem')), '(Custom settings path) Local certificate authority exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'rootCA-key.pem')), '(Custom settings path) Local certificate authority private key exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'localhost.pem')), '(Custom settings path) Local certificate exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'localhost-key.pem')), '(Custom settings path) Local certificate private key exists.')

  t.end()
})
