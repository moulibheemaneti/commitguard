// Public API — use this when importing commitguard as a library rather than a CLI tool
export { validateCommitMsg } from "./hooks/commit-msg-validator.ts";
export type {
  ValidationResult,
} from "./hooks/commit-msg-validator.ts";
export type {
  GitHooksConfig,
  CommitGuardConfig,
  HookType,
  HookConfig,
  CommandConfig,
  CommitMsgCommandConfig,
} from "./config/config-model.ts";
