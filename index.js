const os = require('os')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

const _platform = os.platform()
const _architecture = os.arch()

const homeDir = os.homedir()

const syswidecas = require('syswide-cas')

let nodecertDir

module.exports = function (_nodecertDir = path.join(homeDir, '.nodecert')) {

  nodecertDir = _nodecertDir

  // Create certificates.
  if (!allOK()) {

    console.log('\n 🆕 [Nodecert] Setting up…')

    // Create the directory if it doesn’t already exist.
    if (!fs.existsSync(nodecertDir)) {
      fs.mkdirSync(nodecertDir)
    }

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
    options.env.CAROOT = nodecertDir

    try {
      // Create the local certificate authority.
      console.log(' 🖊  [Nodecert] Creating local certificate authority (local CA) using mkcert…')
      childProcess.execFileSync(mkcertBinary, ['-install'], options)
      console.log(' 🎉 [Nodecert] Local certificate authority created.\n')
      // Create the local certificate.
      console.log(' 📜 [Nodecert] Creating local TLS certificates using mkcert…')
      const createCertificateArguments = [
        `-key-file=${path.join(nodecertDir, 'localhost-key.pem')}`,
        `-cert-file=${path.join(nodecertDir, 'localhost.pem')}`,
        'localhost', '127.0.0.1', '::1'
      ]
      childProcess.execFileSync(mkcertBinary, createCertificateArguments, options)
      console.log(' 🎉 [Nodecert] Local TLS certificates created.')
    } catch (error) {
      console.log('\n', error)
    }

    if (!allOK()) {
      process.exit(1)
    }
  } else {
    console.log(' 📜 [Nodecert] Local development TLS certificate exists.')
  }

  addRootStoreToNode()
}


// Write to stdout without a newline
function print(str) {
  process.stdout.write(str)
}


// Check if the local certificate authority and local keys exist.
function allOK() {
  return fs.existsSync(path.join(nodecertDir, 'rootCA.pem')) && fs.existsSync(path.join(nodecertDir, 'rootCA-key.pem')) && fs.existsSync(path.join(nodecertDir, 'localhost.pem')) && fs.existsSync(path.join(nodecertDir, 'localhost-key.pem'))
}


// Ensure that node recognises the certificates (e.g., when using https.get(), etc.)
function addRootStoreToNode () {
  const nodeCertRootCA = path.join(homeDir, '.nodecert', 'rootCA.pem')
  syswidecas.addCAs(nodeCertRootCA)
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

  // Copy the mkcert binary to the external Nodecert directory so that we can call execSync() on it if
  // the app using this module is wrapped into an executable using Nexe (https://github.com/nexe/nexe) – like
  // Indie Web Server (https://ind.ie/web-server) is, for example. We use readFileSync() and writeFileSync() as
  // Nexe does not support copyFileSync() yet (see https://github.com/nexe/nexe/issues/607).
  const mkcertBinaryExternalPath = path.join(nodecertDir, mkcertBinaryName)

  try {
    const mkcertBuffer = fs.readFileSync(mkcertBinaryInternalPath, 'binary')
    fs.writeFileSync(mkcertBinaryExternalPath, mkcertBuffer, {encoding: 'binary', mode: 0o755})
  } catch (error) {
    throw new Error(` 🤯 [Nodecert] Panic: Could not copy mkcert to external directory: ${error.message}`)
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
    throw new Error(' 🤯 [Nodecert] Panic: Unknown platform detected.', _platform)
  }
}


// On Linux, we must install nss for mkcert to work with both Chrome and Firefox.
// Depending on the platform we try to do so using apt, yum, or pacman. If none of
// those exist, we fail.
function tryToInstallCertutilOnLinux() {
  if (commandExists('certutil')) return // Already installed

  print(' 🌠 [Nodecert] Installing certutil dependency (Linux) ')
  let options = {env: process.env}
  try {
    if (commandExists('apt')) {
      print('using apt… \n')
      options.env.DEBIAN_FRONTEND = 'noninteractive'
      childProcess.execSync('sudo apt-get install -y -q libnss3-tools', options)
    } else if (commandExists('yum')) {
      // Untested: if you test this, please let me know https://github.com/indie-mirror/https-server/issues
      console.log('\n 🤪  [Nodecert] Attempting to install required dependency using yum. This is currently untested. If it works (or blows up) for you, I’d appreciate it if you could open an issue at https://github.com/indie-mirror/https-server/issues and let me know. Thanks! – Aral\n')
      childProcess.execSync('sudo yum install nss-tools', options)
      console.log(' 🎉 [Nodecert] Certutil installed using yum.')
    } else if (commandExists('pacman')) {
      childProcess.execSync('sudo pacman -S nss', options)
      console.log(' 🎉 [Nodecert] Certutil installed using pacman.')
    } else {
    // Neither Homebrew nor MacPorts is installed. Warn the person.
    console.log('\n ⚠️  [Nodecert] Linux: No supported package manager found for installing certutil on Linux (tried apt, yum, and pacman. Please install certutil manually and run nodecert again. For more instructions on installing mkcert dependencies, please see https://github.com/FiloSottile/mkcert/\n')
    }
  } catch (error) {
    // There was an error and we couldn’t install the dependency. Warn the person.
    console.log('\n ⚠️  [Nodecert] Linux: Failed to install nss. Please install it manually and run nodecert again if you want your certificate to work in Chrome and Firefox', error)
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
      print(' 🔍 [Nodecert] Checking if certutil dependency is installed (Darwin) using Homebrew… ')
      childProcess.execSync('brew list nss >/dev/null 2>&1', options)
      console.log(' ok.')
    } catch (error) {
      // NSS is not installed. Install it.
      try {
        print('\n 🌠 [Nodecert] Installing certutil dependency (Darwin) using Homebrew… ')
        childProcess.execSync('brew install nss >/dev/null 2>&1', options)
        console.log('done.')
      } catch (error) {
        console.log('\n ⚠️  [Nodecert] macOS: Failed to install nss via Homebrew. Please install it manually and run nodecert again if you want your certificate to work in Firefox', error)
        return
      }
    }
  } else if (commandExists('port')) {
    // Untested. This is based on the documentation at https://guide.macports.org/#using.port.installed. I don’t have MacPorts installed
    // and it doesn’t play well with Homebrew so I won’t be testing this anytime soon. If you do, please let me know how it works
    // by opening an issue on https://github.com/indie-mirror/https-server/issues
    console.log('\n 🤪  [Nodecert] Attempting to install required dependency using MacPorts. This is currently untested. If it works (or blows up) for you, I’d appreciate it if you could open an issue at https://github.com/indie-mirror/https-server/issues and let me know. Thanks! – Aral\n')

    try {
      childProcess.execSync('port installed nss', options)
    } catch (error) {
      // nss is not installed, attempt to install it using MacPorts.
      try {
        childProcess.execSync('sudo port install nss', options)
      } catch (error) {
        console.log('\n ⚠️  [Nodecert] macOS: Failed to install nss via MacPorts. Please install it manually and run nodecert again if you want your certificate to work in Firefox', error)
        return
      }
    }
  } else {
    // Neither Homebrew nor MacPorts is installed. Warn the person.
    console.log('\n ⚠️  [Nodecert] macOS: Cannot install certutil (nss) as you don’t have Homebrew or MacPorts installed.\n\n If you want your certificate to work in Firefox, please install one of those package managers and then install nss manually:\n\n   * Homebrew (https://brew.sh): brew install nss\n   * MacPorts(https://macports.org): sudo port install nss\n')
    return
  }
}
