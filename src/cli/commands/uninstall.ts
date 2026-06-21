import { parseConfig } from "../../config/config-parser.ts";
import { uninstallHooks } from "../../hooks/hook-installer.ts";

// Removes all commitguard-managed hook scripts from .git/hooks/
export async function uninstall(): Promise<void> {
  console.log("🗑️  Uninstalling commitguard hooks...");
  const config = await parseConfig();
  uninstallHooks(config);
  console.log("✅ All hooks removed successfully!");
}
