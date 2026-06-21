# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
