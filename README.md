# Auto Encrypt Localhost

Automatically provisions and installs locally-trusted TLS certificates for Node.js® https servers (including Express.js, etc.) using [mkcert](https://github.com/FiloSottile/mkcert/).

## How it works

At installation time, Auto Encrypt Localhost uses mkcert to create a local certificate authority, adds it to the various trust stores, and uses it to create locally-trusted TLS certificates that are installed in your server.

At runtime, you can reach your server via the local loopback addresses (localhost, 127.0.0.1) on the device itself and also from other devices on the local area network by using your device’s external IPv4 address(es).

## System requirements

Tested and supported on:

  - Linux (tested with elementary OS Hera)
  - macOS (tested on Big Sur)
  - Windows 10 (tested in Windows Terminal with PowerShell)

(WSL is not supported for certificates at localhost unless you’re running your browser under WSL also).

## Installation

```sh
npm i @small-tech/auto-encrypt-localhost
```

Note that during installation, Auto Encrypt Localhost will create your local certificate authority and install it in the system root store and generate locally-trusted certificates. These actions require elevated privileges. Since [npm does not handle sudo prompts correctly in lifecycle scripts](https://github.com/npm/cli/issues/2887), you will see a graphical sudo prompt pop up to ask you for your adminstrator password. Once you’ve provided it, installation will proceed as normal.

![Screenshot of graphical sudo prompt “Authentication required: Authentication is needed to run /bin/bash as the super user”](https://small-tech.org/images/graphical-sudo-prompt.png)

On Windows, you will also be prompted separately to allow the installation of the certificates.

## Usage

### Instructions

1. Import the module:

    ```js
    import AutoEncryptLocalhost from '@small-tech/auto-encrypt-localhost'
    ```

2. Prefix your server creation code with a reference to the Auto Encrypt Localhost class:

    ```js
    // const server = https.createServer(…) becomes
    const server = AutoEncryptLocalhost.https.createServer(…)
    ```

### Example

(You can find this example in the _example/_ folder in the source code. Run it by typing `node example`.)

```js
// Create an https server using locally-trusted certificates.

import AutoEncryptLocalhost from '@small-tech/auto-encrypt-localhost'

const server = AutoEncryptLocalhost.https.createServer((request, response) => {
  response.end('Hello, world!')
})

server.listen(443, () => {
  console.log('Web server is running at https://localhost')
})
```

You can now reach your server via https://localhost, https://127.0.0.1, and via its external IPv4 address(es) on your local area network. To find the list of IP addresses that your local server is reachable from, you can run the following code in the Node interpreter:

```js
Object.entries(os.networkInterfaces())
  .map(iface =>
    iface[1].filter(addresses =>
      addresses.family === 'IPv4')
      .map(addresses => addresses.address)).flat()
```

### Plain Node.js example

If you just want to use the TLS certificates generated at installation time without using the Auto Encrypt Localhost library itself at runtime, you should install Auto Encrypt Localhost into your `dev-dependencies`. Post install, you can find your certificates in the _~/.small-tech.org/auto-encrypt-localhost_ folder.

Here’s a somewhat equivalent example to the one above but using Node’s regular `https` module instead of Auto Encrypt Localhost at runtime:

```js
import os from 'os'
import fs from 'fs'
import path from 'path'
import https from 'https'

const certificatesPath = path.join(os.homedir(), '.small-tech.org', 'auto-encrypt-localhost')
const keyFilePath = path.join(certificatesPath, 'localhost-key.pem')
const certFilePath = path.join(certificatesPath, 'localhost.pem')

const options = {
  key: fs.readFileSync(keyFilePath, 'utf-8'),
  cert: fs.readFileSync(certFilePath, 'utf-8')
}

const server = https.createServer(options, (request, response) => {
  response.end('Hello, world!')
})

server.listen(443, () => {
  console.log('Web server is running at https://localhost')
})
```

_Note that if you don’t use Auto Encrypt Localhost at runtime, you won’t get some of the benefits that it provides, like automatically adding the certificate authority to Node’s trust store (for hitting your server using Node.js without certificate errors), the `/.ca` convenience route, and HTTP to HTTPS forwarding, etc._

### On Linux

To access your server on port 443, make sure you’ve disabled privileged ports:

```
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=0
```

(On Linux, ports 80 and 443 require special privileges. Please see [A note on Linux and the security farce that is “privileged ports”](#a-note-on-linux-and-the-security-farce-that-is-priviliged-ports). If you just need a Node web server that handles all that and more for you – or to see how to implement privilege escalation seamlessly in your own servers – see [Site.js](https://sitejs.org)).

### Multiple servers

You are not limited to running your server on port 443. You can listen on any port you like and you can have multiple servers with the following caveat: the HTTP server that redirects HTTP calls to HTTPS and serves your local root certificate authority public key (see below) will only be created for the first server and then only if port 80 is free.

### Accessing your local machine from other devices on your local area network

You can access local servers via their IPv4 address over a local area network.

This is useful when you want to test your site with different devices without having to expose your server over the Internet using a service like ngrok. For example, if your machine’s IPv4 address on the local area network is 192.168.2.42, you can just enter that IP to access it from, say, your iPhone.

To access your local machine from a different device on your local area network, you must transfer the public key of your generated local root certificate authority to that device and install and trust it.

For example, if you’re on an iPhone, hit the `/.ca` route in your browser:

```
http://192.168.2.42/.ca
```

The browser will download the local root certificate authority’s public key and prompt you to install profile on your iPhone. You then have to go to Settings → Profile Downloaded → Tap Install when the Install Profile pop-up appears showing you the mkcert certificate you downloaded. Then, go to Settings → General → About → Certificate Trust Settings → Turn on the switch next to the mkcert certificate you downloaded. You should now be able to hit `https://192.168.2.42` and see your site from your iPhone.

You can also transfer your key manually. You can find the key at `~/.small-tech/auto-encrypt-localhost/rootCA.pem` after you’ve created at least one server. For more details on transferring your key to other devices, please refer to [the relevant section in the mkcert documentation](https://github.com/FiloSottile/mkcert#mobile-devices).

## Developer documentation

If you want to help improve Auto Encrypt Localhost or better understand how it is structured and operates, please see the [developer documentation](developer-documentation.md).

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Audience

This is [small technology](https://small-tech.org/about/#small-technology).

If you’re evaluating this for a “startup” or an enterprise, let us save you some time: this is not the right tool for you. This tool is for individual developers to build personal web sites and apps for themselves and for others in a non-colonial manner that respects the human rights of the people who use them.

## Caveats

### Windows

Locally-trusted certificates do not work under Firefox. Please use Edge or Chrome on this platform. This is [a mkcert limitation](https://github.com/FiloSottile/mkcert#supported-root-stores).

__Version 7.x is currently not tested under Windows.__ It may not be able to set the executable bit on the binary download if that’s necessary. __This notice will be removed once it’s been tested and confirmed to be working.__

## Related projects

From lower-level to higher-level:

### Auto Encrypt

  - Source: https://github.com/small-tech/auto-encrypt
  - Package: [@small-tech/auto-encrypt](https://www.npmjs.com/package/@small-tech/auto-encrypt)

Adds automatic provisioning and renewal of [Let’s Encrypt](https://letsencrypt.org) TLS certificates with [OCSP Stapling](https://letsencrypt.org/docs/integration-guide/#implement-ocsp-stapling) to [Node.js](https://nodejs.org) [https](https://nodejs.org/dist/latest-v12.x/docs/api/https.html) servers (including [Express.js](https://expressjs.com/), etc.)

### HTTPS

  - Source: https://github.com/small-tech/https
  - Package: [@small-tech/https](https://www.npmjs.com/package/@small-tech/https)

A drop-in replacement for the [standard Node.js HTTPS module](https://nodejs.org/dist/latest-v12.x/docs/api/https.html) with automatic development-time (localhost) certificates via Auto Encrypt Localhost and automatic production certificates via Auto Encrypt.

### Site.js

  - Web site: https://sitejs.org
  - Source: https://github.com/small-tech/site.js

A tool for developing, testing, and deploying a secure static or dynamic personal web site or app with zero configuration.

### Place (work-in-progress)

Small Web Protocol Reference Server.

  - Source: https://github.com/small-tech/place

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

Copyright &copy; 2019-2021 [Aral Balkan](https://ar.al), [Small Technology Foundation](https://small-tech.org).

## License

Auto Encrypt Localhost is released under [AGPL 3.0 or later](./LICENSE).
