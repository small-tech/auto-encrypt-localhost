# Auto Encrypt Localhost

Automatically provisions trusted localhost TLS certificates via [mkcert](https://github.com/FiloSottile/mkcert/) for development without browser security warnings in Node.js.

## Installation

```sh
npm i @small-tech/auto-encrypt-localhost
```

## Usage

```js
// Create an https server using locally-trusted certificates.

const https = require('https')
const autoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')

const server = https.createServer(autoEncryptLocalhost(), (request, response) => {
  response.end('Hello, world!')
})

server.listen(() => {
  console.log('Web server is running at https://localhost')
})
```

PS. You can find this example in the _example/_ folder in the source code. Run it by typing `node example`.

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Audience

This is [small technology](https://small-tech.org/about/#small-technology).

If you’re evaluating this for a “startup” or an enterprise, let us save you some time: this is not the right tool for you. This tool is for individual developers to build personal web sites and apps for themselves and for others in a non-colonial manner that respects the human rights of the people who use them.

## How it works

Auto Encrypt Localhost is a Node.js wrapper for [mkcert](https://github.com/FiloSottile/mkcert/) that:

  * Uses the 64-bit release binaries to support Linux, macOS, and Windows.

  * Automatically installs the _certutil_ (nss) dependency on Linux on systems with apt, pacman, yum (untested) and  and on macOS if you have [Homebrew](https://brew.sh) or [MacPorts](https://www.macports.org/) (untested).

  * Creates a root Certificate Authority.

  * Creates locally-trusted TLS certificates for localhost, 127.0.0.1, and ::1.

You can use these certificates for local development without triggering self-signed certificate errors.

For more details on how Auto Encrypt Localhost works behind the scenes, please [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Detailed usage

Auto Encrypt Localhost is exported as a function that accepts an optional parameter object with optional `options` and `settingsPath` properties. The defaults for both are shown below.

```js
autoEncryptLocalhost({ options: {}, settingsPath: '~/.small-tech.org/auto-encrypt-localhost' })
```

### Use custom https server options

Auto Encrypt Localhost generates a locally-trusted private key and certificate using mkcert and then loads them in and returns an options object that you can pass directly to the `https.createServer()` method. If you want to pass other options to the server while creating it, just pass your regular options object to Auto Encrypt Localhost wrapped in a parameter object as shown below.

```js
const options = { /* your other https server options go here */ }

const server = https.createServer(autoEncryptLocalhost({ options }), (request, response) => {
  response.end('Hello, world!')
})
```

### Use a custom settings path

By default, Auto Encrypt Localhost creates and uses the _~/.small-tech.org/auto-encrypt-localhost_ directory as its settings path, to store your certificate and its private key. You can tell it to use a different path instead by specifying the path to use in the `settingsPath` property of its parameter object.

```js
const os = require('os')
const path = require('path')
const https = require('https')
const autoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')

const settingsPath = path.join(os.homedir(), '.my-namespace', 'magic-localhost-certificates')

const server = https.createServer(autoEncryptLocalhost({ settingsPath }), (request, response) => {
  response.end('Hello, world!')
})
```

In the above example, your certificate and its private key will be stored in the _~/.my-namespace/magic-localhost-certificates_ directory (with the names _localhost.pem_ and _localhost-key.pem_, respectively).

## Command-line interface

### Install

```sh
npm i -g @small-tech/auto-encrypt-localhost
```

### Use

```sh
auto-encrypt-localhost
```
Your certificates will be created in the _~/.small-tech.org/auto-encrypt-localhost_ directory.

## Caveats

### Windows

Locally-trusted certificates do not work under Firefox. Please use Edge or Chrome on this platform. This is [a mkcert limitation](https://github.com/FiloSottile/mkcert#supported-root-stores).

## Related projects

From lower-level to higher-level:

### [@small-tech/auto-encrypt](https://source.small-tech.org/site.js/lib/auto-encrypt)

Automatically provisions and renews [Let’s Encrypt](https://letsencrypt.org)™ TLS certificates for [Node.js](https://nodejs.org)® [https](https://nodejs.org/dist/latest-v12.x/docs/api/https.html) servers (including [Express.js](https://expressjs.com/), etc.)

### [@small-tech/https](https://source.small-tech.org/site.js/lib/https)

A drop-in standard Node.js `https` module replacement with both automatic development-time (localhost) certificates via Auto Encrypt Localhost and automatic production certificates via Auto Encrypt, see [@small-tech/https](https://source.small-tech.org/site.js/lib/https).

### [Site.js](https://sitejs.org)

A complete [small technology](https://small-tech.org/about/#small-technology) tool to develop, test, and deploy a secure static or dynamic personal web site or app with zero configuration.

## Help wanted

* Linux: _certutil_ (nss) auto-installation has not been tested with yum.
* macOS: _certutil_ (nss) auto-installation has not been tested with MacPorts.

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Copyright

Copyright &copy; [Aral Balkan](https://ar.al), [Small Technology Foundation](https://small-tech.org).

## License

Auto Encrypt Localhost is released under [AGPL 3.0 or later](./LICENSE).
