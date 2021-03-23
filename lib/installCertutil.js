import os from 'os'
import childProcess from 'child_process'
import { log, print } from './util/log.js'

// Mozilla’s nss is used on Linux to install the certificate in Chrome and Firefox
// and on macOS for Firefox. Ensure it exists.
// Source: https://github.com/FiloSottile/mkcert/blob/master/README.md#installation
export default function installCertutil () {
  process.stdout.write(`   📜    ❨auto-encrypt-localhost❩ Installing certutil if necessary… `)
  const platform = os.platform()
  if (platform === 'linux') {
    installCertutilOnLinux()
  } else if (platform === 'darwin') {
    installCertutilOnDarwin()
  } else if (platform === 'win32') {
    // Do nothing. According to the mkcert documentation, certutil is not
    // required on Windows.
    console.log('done.')
  } else {
    // Unknown platform. This should have been caught earlier. Panic.
    throw new Error('   ╰─ 🤯 Panic: Unknown platform detected.', platform)
  }
}

//
// Private.
//

// On Linux, we must install nss for mkcert to work with both Chrome and Firefox.
// Depending on the platform we try to do so using apt, yum, or pacman. If none of
// those exist, we fail.
function installCertutilOnLinux () {
  if (commandExists('certutil')) {
    // Already installed
    process.stdout.write('done.\n')
    return 
  }

  print('\n   ╰─ Installing certutil dependency (Linux) ')
  let options = { env: process.env }
  try {
    if (commandExists('apt')) {
      print('using apt… \n')
      options.env.DEBIAN_FRONTEND = 'noninteractive'
      childProcess.execSync('sudo apt-get install -y -q libnss3-tools', options)
    } else if (commandExists('yum')) {
      // Untested: if you test this, please let me know https://github.com/indie-mirror/https-server/issues
      log('   ╰─ 🤪 Attempting to install required dependency using yum. This is currently untested. If it works (or blows up) for you, I’d appreciate it if you could open an issue at https://github.com/indie-mirror/https-server/issues and let me know. Thanks! – Aral\n')
      childProcess.execSync('sudo yum install nss-tools', options)
      log('   ╰─ Certutil installed using yum.')
    } else if (commandExists('pacman')) {
      childProcess.execSync('sudo pacman -S nss', options)
      log('   ╰─ Certutil installed using pacman.')
    } else {
    // Neither Homebrew nor MacPorts is installed. Warn the person.
    log('   ╰─ ⚠️ Linux: No supported package manager found for installing certutil on Linux (tried apt, yum, and pacman. Please install certutil manually and run Auto Encrypt Localhost again. For more instructions on installing mkcert dependencies, please see https://github.com/FiloSottile/mkcert/\n')
    }
  } catch (error) {
    // There was an error and we couldn’t install the dependency. Warn the person.
    log('   ╰─ ⚠️ Linux: Failed to install nss. Please install it manually and run Auto Encrypt Localhost again if you want your certificate to work in Chrome and Firefox', error)
  }
}


// On macOS, we install nss for mkcert to work with Firefox. To
// install nss, we can use either Homebrew or Macports.
// If neither Homebrew or MacPorts is installed, we warn the person that
// they need to install it manually if they want their certificates to work
// in Firefox.
function installCertutilOnDarwin() {
  const options = { env: process.env }

  if (commandExists('brew')) {
    // Check if nss installed using brew (we can’t just check using commandExists as
    // nss is installed as keg-only and not symlinked to /usr/local due to issues
    // with Firefox crashing).
    try {
      // Homebrew can take a long time start, show current status.
      childProcess.execSync('brew list nss >/dev/null 2>&1', options)
      log(' done.')
    } catch (error) {
      // NSS is not installed. Install it.
      try {
        print('   ╰─ Installing certutil dependency (Darwin) using Homebrew… ')
        childProcess.execSync('brew install nss >/dev/null 2>&1', options)
        log('done.')
      } catch (error) {
        log('   ╰─ ⚠️ macOS: Failed to install nss via Homebrew. Please install it manually and run Auto Encrypt Localhost again if you want your certificate to work in Firefox', error)
        return
      }
    }
  } else if (commandExists('port')) {
    // Untested. This is based on the documentation at https://guide.macports.org/#using.port.installed. I don’t have MacPorts installed
    // and it doesn’t play well with Homebrew so I won’t be testing this anytime soon. If you do, please let me know how it works
    // by opening an issue on https://github.com/indie-mirror/https-server/issues
    log('   ╰─ 🤪 Attempting to install required dependency using MacPorts. This is currently untested. If it works (or blows up) for you, I’d appreciate it if you could open an issue at https://github.com/indie-mirror/https-server/issues and let me know. Thanks! – Aral\n')

    try {
      childProcess.execSync('port installed nss', options)
    } catch (error) {
      // nss is not installed, attempt to install it using MacPorts.
      try {
        childProcess.execSync('sudo port install nss', options)
      } catch (error) {
        log('   ╰─ ⚠️ macOS: Failed to install nss via MacPorts. Please install it manually and run Auto Encrypt Localhost again if you want your certificate to work in Firefox', error)
        return
      }
    }
  } else {
    // Neither Homebrew nor MacPorts is installed. Warn the person.
    log('   ╰─ ⚠️ macOS: Cannot install certutil (nss) as you don’t have Homebrew or MacPorts installed.\n\n If you want your certificate to work in Firefox, please install one of those package managers and then install nss manually:\n   ╰─ * Homebrew (https://brew.sh): brew install nss   ╰─ * MacPorts(https://macports.org): sudo port install nss\n')
    return
  }
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
