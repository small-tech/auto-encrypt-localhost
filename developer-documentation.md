# Developer Documentation

This documentation includes the implementation details of Auto Encrypt Localhost and is intended to aid you if you’re trying to improve, debug, or get a deeper understanding of Auto Encrypt.

If you just want to use Auto Encrypt Localhost, please see the public API, as documented in the [README](readme.md).

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Requirements

Auto Encrypt Localhost is supported on:

  - __Node:__ LTS (currently 12.16.1).
  - __ECMAScript:__ [ES2019](https://node.green/#ES2019)

## Overview of relationships

![Dependency relationship diagram for Auto Correct](artefacts/dependency-graph.svg)

Only a single level of dependencies is shown for clarity.

Generated using [dependency cruiser](https://github.com/sverweij/dependency-cruiser).

## How it works in more detail

Auto Encrypt Localhost is a Node.js wrapper for [mkcert](https://github.com/FiloSottile/mkcert/) that:

  * Uses the 64-bit release binaries to support Linux, macOS, and Windows.

  * Automatically installs the _certutil_ (nss) dependency on Linux on systems with apt, pacman, yum (untested) and  and on macOS if you have [Homebrew](https://brew.sh) or [MacPorts](https://www.macports.org/) (untested).

  * Creates a root Certificate Authority.

  * Creates locally-trusted TLS certificates for localhost, 127.0.0.1, and ::1.

You can use these certificates for local development without triggering self-signed certificate errors.

For more details on how Auto Encrypt Localhost works behind the scenes, please [see the mkcert README](https://github.com/FiloSottile/mkcert/blob/master/README.md).

## Tests

```sh
npm test
```

To see debug output, run `npm run test-debug` instead.

## Coverage

```sh
npm run coverage
```

To see debug output, run `npm run coverage-debug` instead.

## Documentation

To regenerate the dependency diagram and this documentation:

```sh
npm run generate-developer-documentation
```

<a name="autoEncryptLocalhost"></a>

## autoEncryptLocalhost(parameterObject) ⇒ <code>Object</code>
Automatically provisions trusted development-time (localhost) certificates in Node.js via mkcert.

**Kind**: global function  
**Returns**: <code>Object</code> - An options object to be passed to the https.createServer() method.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parameterObject | <code>Object</code> |  |  |
| [parameterObject.settingsPath] | <code>String</code> | <code>~/.small-tech.org/auto-encrypt-localhost/</code> | Custom path to save the certificate and private key to. |


## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Copyright

&copy; 2020 [Aral Balkan](https://ar.al), [Small Technology Foundation](https://small-tech.org).

Let’s Encrypt is a trademark of the Internet Security Research Group (ISRG). All rights reserved. Node.js is a trademark of Joyent, Inc. and is used with its permission. We are not endorsed by or affiliated with Joyent or ISRG.

## License

[AGPL version 3.0 or later.](https://www.gnu.org/licenses/agpl-3.0.en.html)
