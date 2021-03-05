//////////////////////////////////////////////////////////////////////
//
// Exports three constants:
//
//   - version: the mkcert binary version
//   - binaryName: the mkcert binary name
//   - binaryPath: the path to the binary for this machine.
//
//////////////////////////////////////////////////////////////////////

import os from 'os'
import path from 'path'

export const version = '1.4.3'

const __dirname = new URL('.', import.meta.url).pathname

const platformMap = {
  linux: 'linux',
  darwin: 'darwin',
  win32: 'windows'
}

const architectureMap = {
  arm: 'arm',
  arm64: 'arm64',
  x64: 'amd64'
}

const platform = platformMap[os.platform()]
const architecture = architectureMap[os.arch()]

if (platform === undefined) throw new Error('Unsupported platform', os.platform())
if (architecture === undefined) throw new Error('Unsupported architecture', os.arch())

export const binaryName = `mkcert-v${version}-${platform}-${architecture}${platform === 'windows' ? '.exe' : ''}`

export const binaryPath = path.resolve(path.join(__dirname, '..', 'mkcert-bin', binaryName))
