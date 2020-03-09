const autoEncryptLocalhost = require('.')
const test = require('tape')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')

test('certificate creation', t => {
  t.plan(12)

  const defaultSettingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')

  const keyFilePath = path.join(defaultSettingsPath, 'localhost-key.pem')
  const certFilePath = path.join(defaultSettingsPath, 'localhost.pem')

  // Clear the settings path if it already exists.
  if (fs.existsSync(defaultSettingsPath)) {
    fs.removeSync(defaultSettingsPath)
  }

  // Run Auto Encrypt Localhost.
  const tlsOptions = autoEncryptLocalhost()

  t.ok(fs.existsSync(path.join(defaultSettingsPath)), 'Main settings path exists.')
  t.ok(fs.existsSync(path.join(defaultSettingsPath, 'rootCA.pem')), 'Local certificate authority exists.')
  t.ok(fs.existsSync(path.join(defaultSettingsPath, 'rootCA-key.pem')), 'Local certificate authority private key exists.')
  t.ok(fs.existsSync(certFilePath), 'Local certificate exists.')
  t.ok(fs.existsSync(keyFilePath), 'Local certificate private key exists.')

  // Ensure that the certificate and private key in the returned tls options object matches
  // what exists on the file system.
  const key = fs.readFileSync(keyFilePath, 'utf-8')
  const cert = fs.readFileSync(certFilePath, 'utf-8')

  t.strictEquals(tlsOptions.key, key, 'Private key returned in tls options object matches key from disk.')
  t.strictEquals(tlsOptions.cert, cert, 'Certificate returned in tls options object matches key from disk.')

  //
  // Custom settings path.
  //

  const customSettingsPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost-custom-directory-test', 'second-level-directory')

  // Clear the custom settings path if it already exists.
  if (fs.existsSync(customSettingsPath)) {
    fs.removeSync(customSettingsPath)
  }

  autoEncryptLocalhost({ settingsPath: customSettingsPath })

  t.ok(fs.existsSync(path.join(customSettingsPath)), '(Custom settings path) Main directory exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'rootCA.pem')), '(Custom settings path) Local certificate authority exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'rootCA-key.pem')), '(Custom settings path) Local certificate authority private key exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'localhost.pem')), '(Custom settings path) Local certificate exists.')
  t.ok(fs.existsSync(path.join(customSettingsPath, 'localhost-key.pem')), '(Custom settings path) Local certificate private key exists.')

  t.end()
})
