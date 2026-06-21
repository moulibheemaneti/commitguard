import { parseConfig } from "../../config/config-parser.ts";
import { installHooks } from "../../hooks/hook-installer.ts";

// Reads commitguard.yaml and writes hook scripts into .git/hooks/
export async function install(): Promise<void> {
  console.log("📦 Installing commitguard hooks...");
  const config = await parseConfig();
  installHooks(config);
  console.log("✅ All hooks installed successfully!");
}
