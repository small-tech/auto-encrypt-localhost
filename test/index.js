const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const test = require('tape')
const AutoEncryptLocalhost = require('..')

test('certificate creation', t => {
  t.plan(12)

  const defaultSettingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')

  const keyFilePath = path.join(defaultSettingsPath, 'localhost-key.pem')
  const certFilePath = path.join(defaultSettingsPath, 'localhost.pem')

  // Remove the settings path in case it already exists.
  fs.removeSync(defaultSettingsPath)

  // Run Auto Encrypt Localhost.
  const server = AutoEncryptLocalhost.https.createServer()

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
