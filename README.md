# nodecert

A Node.js wrapper that uses the 64-bit [mkcert](https://github.com/FiloSottile/mkcert/) release binaries (Linux, macOS, Windows) to:

  * Create a root Certificate Authority
  * Create TLS certificates for localhost, 127.0.0.1, and ::1

You can use these certificates for local development without triggering self-signed certificate errors.

For more details, [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Usage

Make sure you have the prerequisite ([nss](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/NSS/tools/NSS_Tools_certutil)) installed.

```sh
npm start
```

Your certificates will be created in the _~/.nodecert_ directory.


## Prerequisite

### Linux

For your certificate to work in Chrome and Firefox:

* apt: `sudo apt install libnss3-tools`
* yum: `sudo yum install nss-tools`
* pacman: `sudo pacman -S nss`

## macOS

For your certificate to work in Firefox:

  * [Homebrew](https://brew.sh/): `brew install nss`
  * [MacPorts](https://www.macports.org/): `sudo port install install nss`

