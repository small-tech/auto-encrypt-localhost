# nodecert

A Node.js wrapper that uses the 64-bit [mkcert](https://github.com/FiloSottile/mkcert/) release binaries (Linux, macOS, Windows) to:

  * Automatically install the _certutil_ dependecy on Linux on systems with apt, yum (untested), and pacman (untested)
  * Create a root Certificate Authority
  * Create TLS certificates for localhost, 127.0.0.1, and ::1

You can use these certificates for local development without triggering self-signed certificate errors.

For more details, [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Installation

```sh
npm i -g nodecert
```

(On macOS, you must [manually install the dependency](#macos-dependency) for now.)

## Usage

```sh
nodecert
```

Your certificates will be created in the _~/.nodecert_ directory.

## macOS Dependency

For your certificate to work in Firefox:

  * [Homebrew](https://brew.sh/): `brew install nss`
  * [MacPorts](https://www.macports.org/): `sudo port install install nss`

## Help wanted

* Has not been tested on Windows (64-bit only).
* _certutil_ auto-installation has not been tested with yum.
* _certutil_ auto-installation has not been tested with pacman.
* _nss_ auto-installation not implemented yet on macOS.

If you want to give nodecert a shot on these platforms and [let me know how/if it works](https://github.com/indie-mirror/nodecert/issues), I’d appreciate it.
