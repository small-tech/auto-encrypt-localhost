# Auto Encrypt Localhost

Automatically provision trusted development-time (localhost) certificates in Node.js without browser errors via mkcert.

## Install

```sh
npm i @small-tech/auto-encrypt-localhost
```

## Use

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

## Details

Auto Encrypt Localhost is a Node.js wrapper for [mkcert](https://github.com/FiloSottile/mkcert/) that:

  * Uses the 64-bit release binaries to support Linux, macOS, and Windows.

  * Automatically installs the _certutil_ (nss) dependency on Linux on systems with apt, pacman, yum (untested) and  and on macOS if you have [Homebrew](https://brew.sh) or [MacPorts](https://www.macports.org/) (untested).

  * Creates a root Certificate Authority

  * Creates locally-trusted TLS certificates for localhost, 127.0.0.1, and ::1

You can use these certificates for local development without triggering self-signed certificate errors.

It should __Just Work™__ 🤞

Auto Encrypt Localhost is used in [Site.js](https://sitejs.org), a personal web tool for human beings (not startups or enterprises) that lets you develop, test, and deploy your secure static or dynamic personal web site with zero configuration.

For more details on how Auto Encrypt Localhost works behind the scenes, please [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Advanced usage

Auto Encrypt Localhost is exposed as a function and it accepts an optional parameter object with optional `options` and `settingsPath` properties. The defaults for both are shown below.

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

Locally-trusted certificates do not work under Firefox. Please use Edge or Chrome on this platform. This is [a mkcert limitation](https://github.com/FiloSottile/mkcert#supported-root-stores)

### API

```js
require('@small-tech/auto-encrypt-localhost')()
```

Note that Auto Encrypt Localhost is _synchronous_. It will block your main thread. It is designed to be run before you initialise your app’s web server.

__As of version 3.1.1,__ you can now pass a custom directory for Auto Encrypt Localhost to use instead of the default (`~/.small-tech.org/auto-encrypt-localhost`) directory and the created certificates will be stored there.

For example:

```js
const os = require('os)
const path = require('path')
const autoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')

const customDirectory = path.join(os.homedir(), '.my-app', 'tls', 'local')

nodecert(customDirectory)
```

## Help wanted

* Linux: _certutil_ (nss) auto-installation has not been tested with yum.
* macOS: _certutil_ (nss) auto-installation has not been tested with MacPorts.

# TODO: update the Github Mirror URL!

I can use your help in testing these out. Let me know if it works or blows up by [opening an issue on the GitHub mirror](). [Pull requests]() are also [welcome](./CONTRIBUTING.md).

Thanks in advance! 🤓👍 – [Aral](https://ar.al)

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Copyright

Copyright &copy; Aral Balkan, Small Technology Foundation.

## License

Auto Encrypt Localhost is released under [AGPL 3.0 or later](./LICENSE).
