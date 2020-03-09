const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const childProcess = require('child_process')

const _platform = os.platform()
const _architecture = os.arch()

const homeDir = os.homedir()

const syswidecas = require('syswide-cas')

let tlsOptions
let settingsPath

function log(...args) {
  if (process.env.QUIET) {
    return
  }
  console.log(...args)
}

/**
 * Automatically provisions trusted development-time (localhost) certificates in Node.js via mkcert.
 * @function autoEncryptLocalhost
 *
 * @param {Object}   parameterObject
 * @param {Object}   [parameterObject.options]      Standard https server options.
 * @param {String}   [parameterObject.settingsPath=~/.small-tech.org/auto-encrypt-localhost/] Custom path to save the certificate and private key to.
 * @returns {Object} An options object to be passed to the https.createServer() method.
 */
function autoEncryptLocalhost (parameterObject) {

  if (parameterObject == undefined) { parameterObject = {} }
  tlsOptions = parameterObject.options || {}
  settingsPath = parameterObject.settingsPath || path.join(homeDir, '.small-tech.org', 'auto-encrypt-localhost')

  const keyFilePath = path.join(settingsPath, 'localhost-key.pem')
  const certFilePath = path.join(settingsPath, 'localhost.pem')

  // Create certificates.
  if (!allOK()) {

    log('   📜    ❨Auto Encrypt Localhost❩ Setting up…')

    // Ensure the Auto Encrypt Localhost directory exists.
    fs.ensureDirSync(settingsPath)

    // Get a path to the mkcert binary for this machine.
    const mkcertBinary = mkcertBinaryForThisMachine()

    // On Linux and on macOS, mkcert uses the Mozilla nss library.
    // Try to install this automatically and warn the person if we can’t so
    // that they can do it manually themselves.
    tryToInstallTheDependency()

    // mkcert uses the CAROOT environment variable to know where to create/find the certificate authority.
    // We also pass the rest of the system environment to the spawned processes.
    const options = {
      env: process.env,
      stdio: 'pipe'     // suppress output
    }
    options.env.CAROOT = settingsPath

    try {
      // Create the local certificate authority.
      log('   📜    ❨Auto Encrypt Localhost❩ Creating local certificate authority (local CA) using mkcert…')
      childProcess.execFileSync(mkcertBinary, ['-install'], options)
      log('   📜    ❨Auto Encrypt Localhost❩ Local certificate authority created.')
      // Create the local certificate.
      log('   📜    ❨Auto Encrypt Localhost❩ Creating local TLS certificates using mkcert…')
      const createCertificateArguments = [
        `-key-file=${keyFilePath}`,
        `-cert-file=${certFilePath}`,
        'localhost', '127.0.0.1', '::1'
      ]
      childProcess.execFileSync(mkcertBinary, createCertificateArguments, options)
      log('   📜    ❨Auto Encrypt Localhost❩ Local TLS certificates created.')
    } catch (error) {
      log('\n', error)
    }

    if (!allOK()) {
      process.exit(1)
    }
  } else {
    log('   📜    ❨Auto Encrypt Localhost❩ Local development TLS certificate exists.')
  }

  addRootStoreToNode()

  // Load in and return the certificates in an object that can be passed
  // directly to https.createServer() if required.
  tlsOptions.key = fs.readFileSync(keyFilePath, 'utf-8')
  tlsOptions.cert = fs.readFileSync(certFilePath, 'utf-8')

  return tlsOptions
}

module.exports = autoEncryptLocalhost

// Write to stdout without a newline
function print(str) {
  process.stdout.write(str)
}


// Check if the local certificate authority and local keys exist.
function allOK() {
  return fs.existsSync(path.join(settingsPath, 'rootCA.pem')) && fs.existsSync(path.join(settingsPath, 'rootCA-key.pem')) && fs.existsSync(path.join(settingsPath, 'localhost.pem')) && fs.existsSync(path.join(settingsPath, 'localhost-key.pem'))
}


// Ensure that node recognises the certificates (e.g., when using https.get(), etc.)
function addRootStoreToNode () {
  const rootCA = path.join(settingsPath, 'rootCA.pem')
  syswidecas.addCAs(rootCA)
}


// Returns the mkcert binary for this machine (platform + architecture) and
// throws an error if there isn’t one for it.
function mkcertBinaryForThisMachine() {
  const platformMap = {
    linux: 'linux',
    darwin: 'darwin',
    win32: 'windows'
  }

  const architectureMap = {
    arm: 'arm',
    x64: 'amd64'
  }

  const platform = platformMap[_platform]
  const architecture = architectureMap[_architecture]

  if (platform === undefined) throw new Error('Unsupported platform', _platform)
  if (architecture === undefined) throw new Error('Unsupported architecture', _architecture)

  const mkcertVersion = '1.4.0'

  const mkcertBinaryName = `mkcert-v${mkcertVersion}-${platform}-${architecture}`
  const mkcertBinaryRelativePath = path.join('mkcert-bin', mkcertBinaryName)
  let mkcertBinaryInternalPath = path.join(__dirname, mkcertBinaryRelativePath)

  if (platform === 'windows') mkcertBinaryInternalPath += '.exe'

  // Check if the platform + architecture combination is supported.
  if (!fs.existsSync(mkcertBinaryInternalPath)) throw new Error(`Unsupported platform + architecture combination for ${platform}-${architecture}`)

  // Copy the mkcert binary to the external Auto Encrypt Localhost directory so that we can call execSync() on it if
  // the app using this module is wrapped into an executable using Nexe (https://github.com/nexe/nexe) – like
  // Indie Web Server (https://ind.ie/web-server) is, for example. We use readFileSync() and writeFileSync() as
  // Nexe does not support copyFileSync() yet (see https://github.com/nexe/nexe/issues/607).
  const mkcertBinaryExternalPath = path.join(settingsPath, mkcertBinaryName)

  try {
    const mkcertBuffer = fs.readFileSync(mkcertBinaryInternalPath, 'binary')
    fs.writeFileSync(mkcertBinaryExternalPath, mkcertBuffer, {encoding: 'binary', mode: 0o755})
  } catch (error) {
    throw new Error(`   🤯    ❨Auto Encrypt Localhost❩ Panic: Could not copy mkcert to external directory: ${error.message}`)
  }

  return mkcertBinaryExternalPath
}


// Does the passed command exist? Returns: bool.
function commandExists (command) {
  try {
    childProcess.execFileSync('which', [command], {env: process.env})
    return true
  } catch (error) {
    return false
  }
}


// Mozilla’s nss is used on Linux to install the certificate in Chrome and Firefox
// and on macOS for Firefox. Ensure it exists.
// Source: https://github.com/FiloSottile/mkcert/blob/master/README.md#installation
function tryToInstallTheDependency() {
  if (_platform === 'linux') {
    tryToInstallCertutilOnLinux()
  } else if (_platform === 'darwin') {
    tryToInstallCertutilOnDarwin()
  } else if (_platform === 'win32') {
    // Do nothing. According to the mkcert documentation, certutil is not
    // required on Windows.
  } else {
    // Unknown platform. This should have been caught earlier. Panic.
    throw new Error('   🤯    ❨Auto Encrypt Localhost❩ Panic: Unknown platform detected.', _platform)
  }
}


// On Linux, we must install nss for mkcert to work with both Chrome and Firefox.
// Depending on the platform we try to do so using apt, yum, or pacman. If none of
// those exist, we fail.
function tryToInstallCertutilOnLinux() {
  if (commandExists('certutil')) return // Already installed

  print('   📜    ❨Auto Encrypt Localhost❩ Installing certutil dependency (Linux) ')
  let options = {env: process.env}
  try {
    if (commandExists('apt')) {
      print('using apt… \n')
      options.env.DEBIAN_FRONTEND = 'noninteractive'
      childProcess.execSync('sudo apt-get install -y -q libnss3-tools', options)
    } else if (commandExists('yum')) {
      // Untested: if you test this, please let me know https://github.com/indie-mirror/https-server/issues
      log('\n   🤪    ❨Auto Encrypt Localhost❩ Attempting to install required dependency using yum. This is currently untested. If it works (or blows up) for you, I’d appreciate it if you could open an issue at https://github.com/indie-mirror/https-server/issues and let me know. Thanks! – Aral\n')
      childProcess.execSync('sudo yum install nss-tools', options)
      log('   📜    ❨Auto Encrypt Localhost❩ Certutil installed using yum.')
    } else if (commandExists('pacman')) {
      childProcess.execSync('sudo pacman -S nss', options)
      log('   📜    ❨Auto Encrypt Localhost❩ Certutil installed using pacman.')
    } else {
    // Neither Homebrew nor MacPorts is installed. Warn the person.
    log('\n   ⚠️    ❨Auto Encrypt Localhost❩ Linux: No supported package manager found for installing certutil on Linux (tried apt, yum, and pacman. Please install certutil manually and run Auto Encrypt Localhost again. For more instructions on installing mkcert dependencies, please see https://github.com/FiloSottile/mkcert/\n')
    }
  } catch (error) {
    // There was an error and we couldn’t install the dependency. Warn the person.
    log('\n   ⚠️    ❨Auto Encrypt Localhost❩ Linux: Failed to install nss. Please install it manually and run Auto Encrypt Localhost again if you want your certificate to work in Chrome and Firefox', error)
  }
}


// On macOS, we install nss for mkcert to work with Firefox. To
// install nss, we can use either Homebrew or Macports.
// If neither Homebrew or MacPorts is installed, we warn the person that
// they need to install it manually if they want their certificates to work
// in Firefox.
function tryToInstallCertutilOnDarwin() {
  const options = {env: process.env}

  if (commandExists('brew')) {
    // Check if nss installed using brew (we can’t just check using commandExists as
    // nss is installed as keg-only and not symlinked to /usr/local due to issues
    // with Firefox crashing).
    try {
      // Homebrew can take a long time start, show current status.
      print('   📜    ❨Auto Encrypt Localhost❩ Checking if certutil dependency is installed (Darwin) using Homebrew… ')
      childProcess.execSync('brew list nss >/dev/null 2>&1', options)
      log(' ok.')
    } catch (error) {
      // NSS is not installed. Install it.
      try {
        print('   📜    ❨Auto Encrypt Localhost❩ Installing certutil dependency (Darwin) using Homebrew… ')
        childProcess.execSync('brew install nss >/dev/null 2>&1', options)
        log('done.')
      } catch (error) {
        log('\n   ⚠️    ❨Auto Encrypt Localhost❩ macOS: Failed to install nss via Homebrew. Please install it manually and run Auto Encrypt Localhost again if you want your certificate to work in Firefox', error)
        return
      }
    }
  } else if (commandExists('port')) {
    // Untested. This is based on the documentation at https://guide.macports.org/#using.port.installed. I don’t have MacPorts installed
    // and it doesn’t play well with Homebrew so I won’t be testing this anytime soon. If you do, please let me know how it works
    // by opening an issue on https://github.com/indie-mirror/https-server/issues
    log('\n   🤪    ❨Auto Encrypt Localhost❩ Attempting to install required dependency using MacPorts. This is currently untested. If it works (or blows up) for you, I’d appreciate it if you could open an issue at https://github.com/indie-mirror/https-server/issues and let me know. Thanks! – Aral\n')

    try {
      childProcess.execSync('port installed nss', options)
    } catch (error) {
      // nss is not installed, attempt to install it using MacPorts.
      try {
        childProcess.execSync('sudo port install nss', options)
      } catch (error) {
        log('\n   ⚠️    ❨Auto Encrypt Localhost❩ macOS: Failed to install nss via MacPorts. Please install it manually and run Auto Encrypt Localhost again if you want your certificate to work in Firefox', error)
        return
      }
    }
  } else {
    // Neither Homebrew nor MacPorts is installed. Warn the person.
    log('\n   ⚠️    ❨Auto Encrypt Localhost❩ macOS: Cannot install certutil (nss) as you don’t have Homebrew or MacPorts installed.\n\n If you want your certificate to work in Firefox, please install one of those package managers and then install nss manually:\n\n   * Homebrew (https://brew.sh): brew install nss\n   * MacPorts(https://macports.org): sudo port install nss\n')
    return
  }
}
