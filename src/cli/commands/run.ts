import { runHook } from "../../hooks/hook-runner.ts";

// Delegates to hook-runner — this is what the installed .git/hooks/* scripts call
export async function run(hookName: string, arg?: string): Promise<void> {
  await runHook(hookName, arg);
}
