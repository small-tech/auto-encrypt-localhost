# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

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
