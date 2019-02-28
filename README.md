# nodecert

A Node.js wrapper for [mkcert](https://github.com/FiloSottile/mkcert/) that:

  * Uses the 64-bit release binaries to support Linux, macOS, and Windows.

  * Automatically installs the _certutil_ (nss) dependency on Linux on systems with apt, pacman, yum (untested) and  and on macOS if you have [Homebrew](https://brew.sh) or [MacPorts](https://www.macports.org/) (untested).

  * Creates a root Certificate Authority

  * Creates locally-trusted TLS certificates for localhost, 127.0.0.1, and ::1

You can use these certificates for local development without triggering self-signed certificate errors.

It should __just work™__ 🤞

I’d appreciate it if you can [help me test it](#help-wanted) on untested platforms and package managers 🤗

Want a local development server that uses nodecert? See [https-server](https://source.ind.ie/hypha/tools/https-server).

For more details on how it all works, please [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Installation

```sh
npm i -g @ind.ie/nodecert
```

## Usage

```sh
nodecert
```

Your certificates will be created in the _~/.nodecert_ directory.

## Help wanted

* Has not been tested on Windows (64-bit only).
* Linux: _certutil_ (nss) auto-installation has not been tested with yum.
* macOS: _certutil_ (nss) auto-installation has not been tested with MacPorts.

I can use your help in testing these out. Let me know if it works or blows up by [opening an issue on the GitHub mirror](https://github.com/indie-mirror/nodecert/issues). [Pull requests](https://github.com/indie-mirror/nodecert/pulls) are also [welcome](./CHANGELOG.md).

Thanks in advance! 🤓👍 – [Aral](https://ar.al)
