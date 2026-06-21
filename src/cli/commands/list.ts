import { join } from "node:path";
import { existsSync } from "node:fs";
import { parseConfig } from "../../config/config-parser.ts";
import type { HookType } from "../../config/config-model.ts";

// Prints all hooks defined in commitguard.yaml along with their install status
export async function list(): Promise<void> {
  const config = await parseConfig();

  if (config.hooks.size === 0) {
    console.log("No hooks configured in commitguard.yaml");
    return;
  }

  console.log("🪝 Configured hooks:\n");

  for (const [hookType, hookConfig] of config.hooks) {
    const installed = isInstalled(hookType);
    const status = installed ? "✅ installed" : "❌ not installed";
    const count = hookConfig.commands.size + hookConfig.msgCommands.size;

    console.log(`  ${hookType.padEnd(20)} ${status} — ${count} command(s)`);

    // Show shell commands
    for (const [name, cmd] of hookConfig.commands) {
      console.log(`    • ${name}: ${cmd.run}`);
    }

    // Show commit-msg preset commands
    for (const [name, cmd] of hookConfig.msgCommands) {
      console.log(`    • ${name}: preset=${cmd.preset}`);
    }

    console.log("");
  }
}

function isInstalled(hookType: HookType): boolean {
  return existsSync(join(process.cwd(), ".git", "hooks", hookType));
}
