# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

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
