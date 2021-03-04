//////////////////////////////////////////////////////////////////////
//
// Exports:
//
//   - binaryName: the mkcert binary name (constant)
//   - binaryPath: the path to the binary for this machine.
//
//////////////////////////////////////////////////////////////////////

import os from 'os'

const mkcertVersion = '1.4.3'

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

export const binaryName = `mkcert-v${mkcertVersion}-${platform}-${architecture}${platform === 'windows' ? '.exe' : ''}`
