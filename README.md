# commitguard

A CLI tool to manage Git hooks (`pre-commit`, `commit-msg`, `pre-push`, and more) in any Node.js / JS / TS project — configured via a simple YAML file. Inspired by [dart_husky](https://pub.dev/packages/dart_husky).

---

## Project Plan

### What it does

`commitguard` reads a `commitguard.yaml` file in your project root and installs shell scripts into `.git/hooks/`. When Git triggers a hook, the shell script calls `commitguard run <hook-name>`, which reads the config and executes the commands you defined.

### Source structure

```
src/
  config/
    config-model.ts         — TypeScript types: GitHooksConfig, HookType, CommandConfig, etc.
    config-parser.ts        — Reads and parses commitguard.yaml using Bun.YAML (no external deps)
  hooks/
    commit-msg-validator.ts — Validates commit messages against Conventional Commits spec
    hook-installer.ts       — Writes / deletes shell scripts in .git/hooks/
    hook-runner.ts          — Executes commands for a given hook (sequential / parallel, staged-only, glob filtering)
  utils/
    git-utils.ts            — getStagedFiles() via `git diff --cached --name-only`
  cli/
    commands/
      install.ts            — `commitguard install`   — reads config, installs hook scripts
      uninstall.ts          — `commitguard uninstall` — removes hook scripts
      run.ts                — `commitguard run <hook>` — called by the installed git hook scripts
      list.ts               — `commitguard list`      — shows configured hooks and install status
  cli.ts                    — Main CLI entry point (bin), parses process.argv
  index.ts                  — Public library export (CommitMsgValidator, types)
```

### Config file: `commitguard.yaml`

Same shape as `dart_husky.yaml`. Example:

```yaml
commitguard:
  verbose: true
  staged_only: false

pre-commit:
  parallel: false
  commands:
    lint:
      run: bunx eslint .
      glob: "**/*.ts"
    format:
      run: bunx prettier --check .
      staged_only: false

commit-msg:
  commands:
    conventional:
      preset: conventional
      types:
        append: [wip, release]
```

### Supported hooks

| Hook              | Triggered when                    |
|-------------------|-----------------------------------|
| `pre-commit`      | Before a commit is created        |
| `commit-msg`      | To validate the commit message    |
| `pre-push`        | Before pushing to remote          |
| `post-checkout`   | After switching branches          |
| `pre-merge-commit`| Before a merge commit             |

### CLI commands

| Command                        | Description                              |
|-------------------------------|------------------------------------------|
| `commitguard install`         | Install git hooks from `commitguard.yaml` |
| `commitguard uninstall`       | Remove all installed git hooks            |
| `commitguard run <hook-name>` | Run a specific hook manually              |
| `commitguard list`            | List all configured hooks and status      |

### Key design decisions

- **Zero external runtime dependencies** — uses `Bun.YAML.parse` for YAML and `new Bun.Glob().match()` for glob filtering
- **Generated hook scripts** call `npx commitguard run <hook-name>` so they work in any Node.js environment after install
- **`commit-msg` preset `conventional`** validates against the [Conventional Commits](https://www.conventionalcommits.org) spec with optional type appending or overriding
- **`staged_only`** can be set globally or per-command; when enabled, staged file paths are appended to the run command
- **`parallel`** runs all commands in a hook concurrently using `Promise.all`

---

## Usage (once published)

```bash
# Install as a dev dependency
npm install -D commitguard

# Create commitguard.yaml in your project root
# Then install the git hooks
npx commitguard install
```

---

## Development

```bash
# Install dependencies
bun install

# Build for npm
bun run build

# Run tests
bun test
```
