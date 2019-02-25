# nodecert

A Node.js wrapper that uses the 64-bit [mkcert](https://github.com/FiloSottile/mkcert/) release binaries (Linux, macOS, Windows) to:

  * Automatically install the _certutil_ (nss) dependency on Linux on systems with apt, yum (untested), and pacman (untested)
  * Automatically install the _certutil_ (nss) dependency on macOS if you have Homebrew installed. 
  * Create a root Certificate Authority
  * Create TLS certificates for localhost, 127.0.0.1, and ::1

You can use these certificates for local development without triggering self-signed certificate errors.

For more details, [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Installation

```sh
npm i -g @ind.ie/nodecert
```

(On macOS, you must [manually install the dependency](#macos-dependency) for now.)

## Usage

```sh
nodecert
```

Your certificates will be created in the _~/.nodecert_ directory.

## macOS Dependency

If you have [Homebrew](https://brew.sh) installed, the dependency will be automatically installed for you.

If you use [MacPorts](https://www.macports.org/), you currently have to install the dependency manually:

```sh
sudo port install install nss
```

## Help wanted

* Has not been tested on Windows (64-bit only).
* _certutil_ auto-installation has not been tested with yum.
* _certutil_ auto-installation has not been tested with pacman.
* _nss_ auto-installation implemented on macOS if you have Homebrew installed. Currently does not install Homebrew if you don’t. Installation via MacPorts is not implemented yet.

If you want to give nodecert a shot on these platforms and [let me know how/if it works](https://github.com/indie-mirror/nodecert/issues), I’d appreciate it.
