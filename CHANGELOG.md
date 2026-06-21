# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3](https://github.com/moulibheemaneti/commitguard/compare/commitguard-v0.1.2...commitguard-v0.1.3) (2026-06-21)


### Bug Fixes

* correct repository url to commitguard ([5e57d3a](https://github.com/moulibheemaneti/commitguard/commit/5e57d3a41b0aec318409d3b9a172f0b2849a3675))


### Miscellaneous

* **main:** release commitguard 0.1.2 ([c74fa6a](https://github.com/moulibheemaneti/commitguard/commit/c74fa6a49e78c86c10de521ba841f7c06f96fb1e))
* **main:** release commitguard 0.1.2 ([366400e](https://github.com/moulibheemaneti/commitguard/commit/366400e5d7a64b95aae7f8c0bd257dc3c5d55575))

## [0.1.2](https://github.com/moulibheemaneti/commitguard/compare/commitguard-v0.1.1...commitguard-v0.1.2) (2026-06-21)


### Bug Fixes

* correct repository url to commitguard ([5e57d3a](https://github.com/moulibheemaneti/commitguard/commit/5e57d3a41b0aec318409d3b9a172f0b2849a3675))


### Miscellaneous

* bump version to 0.1.2 ([4f28c7a](https://github.com/moulibheemaneti/commitguard/commit/4f28c7a865415b19f45dc185e908a24ed181400f))
* rename package to @moulibheemaneti/commitguard ([9075ff5](https://github.com/moulibheemaneti/commitguard/commit/9075ff50206c6715282dd4cab3c2639a7a5bba64))

## [0.1.1](https://github.com/moulibheemaneti/commitguard/compare/commitguard-v0.1.0...commitguard-v0.1.1) (2026-06-21)


### Miscellaneous

* initial commit ([ad9471f](https://github.com/moulibheemaneti/commitguard/commit/ad9471f8a7406bbf0f486be9c1cd34163dc9ea76))

## [Unreleased]

## [0.1.0] - 2026-06-21

### Added
- **CLI Tooling**: Git hooks manager for Node.js / JS / TS projects, configured via `commitguard.yaml`.
- **Hook Installer**: Installs shell scripts into `.git/hooks/` that delegate to `npx commitguard run <hook>`.
- **Declarative YAML Configuration**: Define all hook commands in a single `commitguard.yaml` file.
- **Sequential & Parallel Execution**: Run hook commands sequentially (default) or in parallel (`parallel: true`).
- **Built-in Conventional Commits Preset**: Validates commit messages against the Conventional Commits spec with support for appending or overriding types.
- **Lowercase Commit Check**: Enforces fully lowercase commit messages by default (`only_small_case: true`).
- **Staged-Only Mode**: Run commands only on staged files, configurable globally or per command.
- **Glob Pattern Filtering**: Skip commands when no staged files match a given glob pattern.
- **CLI Commands**: `install`, `uninstall`, `run`, `list`.
- **Supported Hooks**: `pre-commit`, `commit-msg`, `pre-push`, `post-checkout`, `pre-merge-commit`.
- **Zero External Dependencies**: Uses Bun built-ins (`Bun.YAML`, `Bun.Glob`, `Bun.spawn`, `Bun.file`).
