# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.0.0] - in progress

This version is optimised for use on development machines via npm install. It carries out the mkcert binary installation in a postinstall script. In version 6.x and earlier, all binaries for all platforms were bundled as the library also supported use from a binary install (see [Site.js](https://sitejs.org)). The 6.x branch will still be updated with new mkcert versions but the 7.x and later versions will be used in [Place](https://github.com/small-tech/place).

### Changed

  - Uses ECMAScript Modules (ESM; es6 modules)
  - (Breaking) mkcert binary is now downloaded during installation.
  - (Breaking) No longer copies the mkcert binary to the settings path.

## [6.1.0] - 2020-11-04

### Changed

  - Upgrade mkcert to version 1.4.2.
  - Include separate mkcert arm64 build.

## [6.0.0] - 2020-11-03

### Changed

  - __Breaking change:__ Running multiple servers at different HTTPS ports no longer results in an error due to port 80 being unavailable for the HTTP Server. However, know that only the first server will get the HTTP Server at port 80 that redirects HTTP calls to HTTPS and also serves your local root certificate authority public key. (#14)

## [5.4.1] - 2020-07-11

### Changed

  - Make the section on disabling privileged ports on Linux more prominent given that we now start a HTTP server and the tests will fail on Linux otherwise.

## [5.4.0] - 2020-07-11

### Added

  - arm64 support.

## [5.3.1] - 2020-07-07

### Fixed

  - Update readme to add missing content.

## [5.3.0] - 2020-07-07

### Added

  - Serves the local root certificate authority’s public key at route /.ca (you can hit this route from a device like an iPhone on your local area network to install the key and trust it on your device to test your local server with that device over your local area network).
  - Redirects HTTP to HTTPS (#13).

## [5.2.2] - 2020-07-06

### Added

  - Update documentation to mention that the root certificate authority’s public key must be installed and trusted on any devices you want to access your local machine from via the local area network and link to the mkcert documentation for more details.

## [5.2.1] - 2020-07-06

### Added

  - Update documentation to mention the feature introduced in 5.2.0.

## [5.2.0] - 2020-07-06

### Added

  - Local server can how be accessed over external IPv4 address. This means that you can now test with other devices on your local area network without having to expose your server over the wide area network / Internet.

## [5.1.2] - 2020-06-16

### Fixed

  - Minor: Fix extraneous newlines in log statements.

## [5.1.1] - 2020-06-15

### Changed

  - Minor: Log output now matches format of Site.js.

## [5.1.0] - 2020-04-16

### Added

  - Auto-upgrade feature: certificates are now automatically recreated following mkcert binary upgrades.

## [5.0.2] - 2020-04-15

### Added

  - Minor: add funding information; make package information consistent with related projects.

## [5.0.1] - 2020-04-15

### Changed

  - Minor: documentation updates for consistency with related projects.

## [5.0.0] - 2020-04-14

### Changed

  - __Breaking change:__ New API to maintain consistency with [Auto Encrypt](https://source.small-tech.org/site.js/lib/auto-encrypt).

## [4.0.1] - 2020-03-09

### Changed

  - Updated readme.

## [4.0.0] - 2020-03-09

New name. Now isomorphic with [Auto Encrypt](https://source.small-tech.org/site.js/lib/auto-encrypt).

### Changed

Breaking changes.

  - Name change to Auto Encrypt Localhost.
  - Package name change to auto-encrypt-localhost.
  - Package namespace change to @small-tech.
  - Binary name changed to auto-encrypt-localhost.
  - Default certificate location changed to ~/.small-tech.org/auto-encrypt-localhost/.
  - Function signature changed to accept parameter object.

### Added

  - Main function now returns an object containing the generated private key and TLS certificate that can be passed as the options object to the `https.createServer()` method.

## [3.2.0] - 2020-02-15

### Added

  - Support for QUIET=true environment variable to silence console output.

## [3.1.7] - 2020-02-09

### Fixed

  - Minor fixes to console output (cosmetic).

## [3.1.6] - 2020-02-09

### Fixed

  - Update bracket style in console output formatting to match what’s used in Site.js.

## [3.1.5] - 2020-02-09

### Changed

  - Updated console output formatting to match what’s used in Site.js.

## [3.1.4] - 2019-11-26

### Fixed

  - Fix regression: Node.js once again recognises nodecert certificates.

## [3.1.3] - 2019-11-26

### Fixed

  - No longer crashes if multiple directories do not exist in the requested nodecert path.

## [3.1.2] - 2019-11-25

### Changed

  - The configuration folder is now under ~/.small-tech.org namespace.

### Fixed

  - The tests now actually check that local certificates are created at the custom directory instead of running the first set of tests again.

## [3.1.1] - 2019-11-25

### Added

  - Function now takes node certificate directory as its only parameter. Defaults to old default directory.

## [3.1.0] - 2019-09-28

### Changed

  - Update from mkcert 1.3.0 binaries to 1.4.0. Adds macOS Catalina support.

## [3.0.1] - 2019-04-13

### Changed

  - Cosmetic: remove newline after second success message so output looks better in Indie Web Server.

## [3.0.0] - 2019-04-13

### Added

  - Add [nexe](https://github.com/nexe/nexe/) support. The mkcert binary is now copied to an external directory and executed from there as nexe cannot call execSync on bundled resources. You must still add the binaries to your list of resources when building your nexe executable. Bumping major version even though this isn’t a breaking change as it does add a tiny bit of processing overhead so if you were using version 2.x.x, you should make a decision about whether you want to update manually.

### Changed

  - Clean up output.

## [2.1.0] - 2019-04-04

### Added

  - Add [pkg](https://github.com/zeit/pkg/) support.

## [2.0.2] - ?

### Changed

  - Cosmetic: capitalised Nodecert name in console logs and removed newlines.

## [2.0.1] - 2019-03-09

### Fixed
  - Capitalise app name in readme.
  - Bump version to republish due to npm error: `"Unable to find a readme for @ind.ie/nodecert@2.0.0"`

## [2.0.0] - 2019-03-09

### Changed

  - API: (Breaking change) You now have to execute the exported function to run Nodecert. This allows for conditional usage.

## [1.0.6] - 2019-02-28

### Changed

  - Tested with pacman on Arch Linux. No longer displays warning/request for help.
  - Tested to work on 64-bit Windows.

## [1.0.5] - 2019-02-28

### Added

  - Add certificates to Node.js so you can use them with, e.g., https.get(), etc. (Node.js does not use the system store.)

## [1.0.4] - 2019-02-26

### Added

  - Add progress indication

## [1.0.3] - 2019-02-25

### Added

  - Automatically install _certutil_ (nss) dependency on macOS if you have MacPorts installed (untested).

### Changed

- A failure to install optional dependency (nss/certutil) no longer kills process but it reflected as a warning with instructions for installing it manually.
- Updated instructions

## [1.0.2] - 2019-02-25

### Added

  - Automatically install _certutil_ (nss) dependency on macOS if you have Homebrew installed.

## [1.0.1] - 2019-02-25

### Added

  - Cosmetic: minor formatting of output to match [https-server](https://source.ind.ie/hypha/tools/https-server)

## [1.0.0] - 2019-02-25

Initial release.
