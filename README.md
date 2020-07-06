# Auto Encrypt Localhost

Automatically provisions and installs locally-trusted TLS certificates for Node.js® https servers (including Express.js, etc.) using [mkcert](https://github.com/FiloSottile/mkcert/).

## How it works

Before creating your HTTPS server, uses mkcert to create a local certificate authority, adds it to the various trust stores, and uses it to create locally-trusted TLS certificates that are installed in your server.

You can reach your server via the local loopback addresses (localhost, 127.0.0.1) on the device itself and also from other devices on the local area network by using your device’s external IPv4 address.

## Installation

```sh
npm i @small-tech/auto-encrypt-localhost
```

## Usage

### Instructions

1. Import the module:

    ```js
    const AutoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')
    ```

2. Prefix your server creation code with a reference to the Auto Encrypt Localhost class:

    ```js
    // const server = https.createServer(…) becomes
    const server = AutoEncryptLocalhost.https.createServer(…)
    ```

### Example

```js
// Create an https server using locally-trusted certificates.

const AutoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')

const server = AutoEncryptLocalhost.https.createServer((request, response) => {
  response.end('Hello, world!')
})

server.listen(() => {
  console.log('Web server is running at https://localhost')
})
```

You can now reach your server via https://localhost, https://127.0.0.1, and via its external IPv4 address on your local area network. To find out what that is, you can run the following in the Node interpreter:

```js
Object.entries(os.networkInterfaces())
  .map(iface =>
    iface[1].filter(addresses =>
      addresses.family === 'IPv4')
      .map(addresses => addresses.address)).flat()
```

To access your local machine from a different device on your local area network, you must transfer the public key of your generated local root certificate authority to that device and install and trust it. By default, once you’ve created your first server, you can find the key at `~/.small-tech/auto-encrypt-localhost/rootCA.pem`. For more details, please refer to [the relevant section in the mkcert documentation](https://github.com/FiloSottile/mkcert#mobile-devices).

Note that on Linux, ports 80 and 443 require special privileges. Please see [A note on Linux and the security farce that is “privileged ports”](#a-note-on-linux-and-the-security-farce-that-is-priviliged-ports). If you just need a Node web server that handles all that and more for you (or to see how to implement privilege escalation seamlessly in your own servers, see [Site.js](https://sitejs.org)).

You can find this example in the _example/_ folder in the source code. Run it by typing `node example`.

## Configuration

You can specify a custom settings path for your local certificate authority and certificate data to be stored in by adding the Auto Encrypt Localhost-specific `settingsPath` option to the options object you pass to the Node `https` server. If not specified, the default settings path (_~/.small-tech.org/auto-encrypt-localhost/_) is used.

### Example

```js
const AutoEncrypt = require('@small-tech/auto-encrypt-localhost')

const options = {
  // Regular HTTPS server and TLS server options, if any, go here.

  // Optional Auto Encrypt options:
  settingsPath: '/custom/settings/path'
}

// Pass the options object to https.createServer()
const server = AutoEncryptLocalhost.https.createServer(options, listener)

// …
```

## Developer documentation

If you want to help improve Auto Encrypt Localhost or better understand how it is structured and operates, please see the [developer documentation](developer-documentation.md).

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Audience

This is [small technology](https://small-tech.org/about/#small-technology).

If you’re evaluating this for a “startup” or an enterprise, let us save you some time: this is not the right tool for you. This tool is for individual developers to build personal web sites and apps for themselves and for others in a non-colonial manner that respects the human rights of the people who use them.

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

### Auto Encrypt

  - Source: https://source.small-tech.org/site.js/lib/auto-encrypt
  - Package: [@small-tech/auto-encrypt](https://www.npmjs.com/package/@small-tech/auto-encrypt)

Adds automatic provisioning and renewal of [Let’s Encrypt](https://letsencrypt.org) TLS certificates with [OCSP Stapling](https://letsencrypt.org/docs/integration-guide/#implement-ocsp-stapling) to [Node.js](https://nodejs.org) [https](https://nodejs.org/dist/latest-v12.x/docs/api/https.html) servers (including [Express.js](https://expressjs.com/), etc.)

### HTTPS

  - Source: https://source.small-tech.org/site.js/lib/https
  - Package: [@small-tech/https](https://www.npmjs.com/package/@small-tech/https)

A drop-in replacement for the [standard Node.js HTTPS module](https://nodejs.org/dist/latest-v12.x/docs/api/https.html) with automatic development-time (localhost) certificates via Auto Encrypt Localhost and automatic production certificates via Auto Encrypt.

### Site.js

  - Web site: https://sitejs.org
  - Source: https://source.small-tech.org/site.js/app

A complete [small technology](https://small-tech.org/about/#small-technology) tool for developing, testing, and deploying a secure static or dynamic personal web site or app with zero configuration.

## A note on Linux and the security farce that is “privileged ports”

Linux has an outdated feature dating from the mainframe days that requires a process that wants to bind to ports < 1024 to have elevated privileges. While this was a security feature in the days of dumb terminals, today it is a security anti-feature. (macOS has dropped this requirement as of macOS Mojave.)

On modern Linux systems, you can disable privileged ports like this:

```sh
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=0
```

Or, if you want to cling to ancient historic relics like a conservative to a racist statue, ensure your Node process has the right to bind to so-called “privileged” ports by issuing the following command before use:

```sh
sudo setcap cap_net_bind_service=+ep $(which node)
```

If you are wrapping your Node app into an executable binary using a module like [Nexe](https://github.com/nexe/nexe), you will have to ensure that every build of your app has that capability set. For an example of how we do this in [Site.js](https://sitejs.org), [see this listing](https://source.ind.ie/site.js/app/blob/master/bin/lib/ensure.js#L124).

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
