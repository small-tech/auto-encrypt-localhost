# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

## [1.0.6] - 2019-02-28

## Changed

  - Has been tested with pacman on Arch Linux. No longer displays warning/request for help.
  - Has been tested to work on 64-bit Windows.

## [1.0.5] - 2019-02-28

## Added

  - Adds certificates to Node.js so you can use them with, e.g., https.get(), etc. (Node.js does not use the system store.)

## [1.0.4] - 2019-02-26

## Added

  - Add progress indication

## [1.0.3] - 2019-02-25

### Added

  - Automatically install the _certutil_ (nss) dependency on macOS if you have MacPorts installed (untested).

### Changed

- A failure to install the optional dependency (nss/certutil) no longer kills the process but it reflected as a warning with instructions for installing it manually.
- Updated instructions

## [1.0.2] - 2019-02-25

### Added

  - Automatically install the _certutil_ (nss) dependency on macOS if you have Homebrew installed.

## [1.0.1] - 2019-02-25

### Added

  - Cosmetic: minor formatting of output to match [https-server](https://source.ind.ie/hypha/tools/https-server)

## [1.0.0] - 2019-02-25

Initial release.
