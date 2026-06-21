#!/usr/bin/env bun
// CLI entry point — this is what `commitguard <command>` resolves to via the bin field in package.json

import { install } from "./cli/commands/install.ts";
import { uninstall } from "./cli/commands/uninstall.ts";
import { run } from "./cli/commands/run.ts";
import { list } from "./cli/commands/list.ts";

const COMMANDS: Record<string, string> = {
  install: "Install git hooks from commitguard.yaml",
  uninstall: "Remove all installed git hooks",
  run: "Run a specific hook manually (used internally by git hook scripts)",
  list: "List all configured hooks and their install status",
};

async function main(): Promise<void> {
  // process.argv: [node, cli.js, command, ...args]
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "install":
      await install();
      break;

    case "uninstall":
      await uninstall();
      break;

    case "run": {
      const hookName = rest[0];
      if (!hookName) {
        console.error("Usage: commitguard run <hook-name>");
        process.exit(1);
      }
      // rest[1] is the commit message file path passed by git for commit-msg hooks
      await run(hookName, rest[1]);
      break;
    }

    case "list":
      await list();
      break;

    default:
      printHelp();
      break;
  }
}

function printHelp(): void {
  console.log("commitguard — Git hook manager for Node.js / JS / TS projects");
  console.log("");
  console.log("Usage: commitguard <command>");
  console.log("");
  console.log("Commands:");
  for (const [cmd, desc] of Object.entries(COMMANDS)) {
    console.log(`  ${cmd.padEnd(12)}${desc}`);
  }
}

main().catch((err) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
