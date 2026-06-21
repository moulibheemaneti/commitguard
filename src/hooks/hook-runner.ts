import { readFileSync } from "node:fs";
import type {
  HookConfig,
  CommandConfig,
  CommitGuardConfig,
  HookType,
} from "../config/config-model.ts";
import { parseConfig } from "../config/config-parser.ts";
import { getStagedFiles } from "../utils/git-utils.ts";
import { validateCommitMsg } from "./commit-msg-validator.ts";

// Entry point called by the installed .git/hooks/<hook> shell scripts
export async function runHook(hookName: string, arg?: string): Promise<void> {
  const hookType = hookName as HookType;
  const config = await parseConfig();
  const hookConfig = config.hooks.get(hookType);

  if (!hookConfig) {
    console.warn(`⚠️  No config found for "${hookName}" — skipping.`);
    process.exit(0);
  }

  console.log(`🪝 Running ${hookName} hooks...`);

  if (hookType === "commit-msg") {
    await runCommitMsgHook(hookConfig, arg);
    return;
  }

  // Only fetch staged files when something in the hook actually needs them
  const needsStagedFiles =
    config.globalConfig.stagedOnly ||
    [...hookConfig.commands.values()].some(
      (c) => c.stagedOnly === true || c.glob !== undefined
    );

  const stagedFiles = needsStagedFiles ? await getStagedFiles() : [];

  if (hookConfig.parallel) {
    await runParallel(hookConfig.commands, config.globalConfig, stagedFiles);
  } else {
    await runSequential(hookConfig.commands, config.globalConfig, stagedFiles);
  }
}

async function runCommitMsgHook(
  hookConfig: HookConfig,
  msgFilePath?: string
): Promise<void> {
  if (!msgFilePath) {
    console.error("❌ No commit message file path provided.");
    process.exit(1);
  }

  const message = readFileSync(msgFilePath, "utf8");

  for (const [name, cmdConfig] of hookConfig.msgCommands) {
    // Universal lowercase check — runs regardless of the preset
    if (cmdConfig.onlySmallCase) {
      console.log("  ▶ Running lowercase check...");
      const firstLine = message.trim().split("\n")[0] ?? "";

      if (firstLine !== firstLine.toLowerCase()) {
        console.error("  ❌ lowercase check failed:\n");
        console.error("  Commit message must be lowercase.");
        console.error(`  Got: ${firstLine}\n`);
        process.exit(1);
      }

      console.log("  ✅ lowercase check passed");
    }

    console.log(`  ▶ Running "${name}"...`);

    if (cmdConfig.preset === "conventional") {
      const result = validateCommitMsg(message, {
        appendTypes: cmdConfig.appendTypes,
        overrideTypes: cmdConfig.overrideTypes,
        onlySmallCase: false, // already checked above
      });

      if (!result.passed) {
        console.error(`  ❌ "${name}" failed:\n`);
        console.error(result.message);
        process.exit(1);
      }

      console.log(`  ✅ "${name}" passed`);
    } else {
      console.warn(`  ⚠️  Unknown preset "${cmdConfig.preset}" — skipping.`);
    }
  }
}

async function runSequential(
  commands: Map<string, CommandConfig>,
  globalConfig: CommitGuardConfig,
  stagedFiles: string[]
): Promise<void> {
  for (const [name, cmdConfig] of commands) {
    await runCommand(name, cmdConfig, globalConfig, stagedFiles);
  }
}

async function runParallel(
  commands: Map<string, CommandConfig>,
  globalConfig: CommitGuardConfig,
  stagedFiles: string[]
): Promise<void> {
  await Promise.all(
    [...commands.entries()].map(([name, cmdConfig]) =>
      runCommand(name, cmdConfig, globalConfig, stagedFiles)
    )
  );
}

async function runCommand(
  name: string,
  cmdConfig: CommandConfig,
  globalConfig: CommitGuardConfig,
  stagedFiles: string[]
): Promise<void> {
  // Skip the command if none of the staged files match the glob pattern
  if (cmdConfig.glob !== undefined) {
    const glob = new Bun.Glob(cmdConfig.glob);
    const hasMatch = stagedFiles.some((f) => glob.match(f));

    if (!hasMatch) {
      console.log(
        `  ⏭️  "${name}" skipped — no staged files match "${cmdConfig.glob}"`
      );
      return;
    }
  }

  console.log(`  ▶ Running "${name}"...`);

  // Command-level staged_only takes priority over the global setting
  const useStagedOnly = cmdConfig.stagedOnly ?? globalConfig.stagedOnly;
  let commandToRun = cmdConfig.run;

  if (useStagedOnly && stagedFiles.length > 0) {
    commandToRun = `${cmdConfig.run} ${stagedFiles.join(" ")}`;
  } else if (useStagedOnly && stagedFiles.length === 0) {
    console.log(`  ⏭️  "${name}" skipped — no staged files.`);
    return;
  }

  // Use /bin/sh -c so commands like `bunx eslint .` work without manual splitting
  const proc = Bun.spawn(["/bin/sh", "-c", commandToRun], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error(`  ❌ "${name}" failed with exit code ${exitCode}`);
    process.exit(exitCode);
  }

  console.log(`  ✅ "${name}" passed`);
}
