# Contributing to commitguard

Thanks for taking the time to contribute! Please read this guide before opening an issue or pull request.

## Getting started

**Prerequisites:** [Bun](https://bun.sh) ≥ 1.0.0.

```sh
git clone https://github.com/moulibheemaneti/commitguard.git
cd commitguard
bun install
npx commitguard install   # activates the local git hooks
```

After `npx commitguard install` the following hooks run automatically on this repo:

| Hook | Commands |
|------|----------|
| `pre-commit` | _(add your lint / format commands here)_ |
| `commit-msg` | Conventional Commits validation (allowed types below) |

## Commit convention

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <subject starting with a lowercase letter>
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `perf`, `revert`, `wip`, `release`.

Examples:

```
feat: add pre-push hook support
fix: handle missing commitguard.yaml gracefully
docs: update staged-only mode example
```

## Running tests

```sh
bun test
```

## Making a change

1. Fork the repo and create a branch from `main`.
2. Make your changes and add or update tests as needed.
3. Run `bun tsc --noEmit` — must pass with zero type errors.
4. Run `bun test` — all tests must pass.
5. Update `CHANGELOG.md` under the `[Unreleased]` section.
6. Open a pull request with a Conventional Commits title.

## Reporting issues

Use the issue templates — they ask for the specific information needed to reproduce or triage your report quickly. For security vulnerabilities, see [SECURITY.md](SECURITY.md).
