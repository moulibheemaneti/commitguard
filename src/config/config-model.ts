// Represents the entire commitguard.yaml config file
export interface GitHooksConfig {
  globalConfig: CommitGuardConfig;
  hooks: Map<HookType, HookConfig>;
}

// Global settings defined under the `commitguard:` key
export interface CommitGuardConfig {
  verbose: boolean;
  stagedOnly: boolean;
}

export const defaultCommitGuardConfig: CommitGuardConfig = {
  verbose: true,
  stagedOnly: false,
};

// All supported git hook names — these become filenames in .git/hooks/
export type HookType =
  | "pre-commit"
  | "commit-msg"
  | "pre-push"
  | "post-checkout"
  | "pre-merge-commit";

export const ALL_HOOK_TYPES: HookType[] = [
  "pre-commit",
  "commit-msg",
  "pre-push",
  "post-checkout",
  "pre-merge-commit",
];

// One hook block in the config (e.g. `pre-commit:`)
export interface HookConfig {
  parallel: boolean;
  // Shell commands for non-commit-msg hooks
  commands: Map<string, CommandConfig>;
  // Commit message validation commands — only used for `commit-msg`
  msgCommands: Map<string, CommitMsgCommandConfig>;
}

// One named shell command inside a hook
export interface CommandConfig {
  run: string;
  // Only run this command if staged files match this glob pattern
  glob?: string;
  // Overrides the global staged_only setting for this command
  stagedOnly?: boolean;
}

// Commit-msg hook uses a preset instead of a raw shell command
export interface CommitMsgCommandConfig {
  preset: string;
  // Extra types added on top of the built-in preset types
  appendTypes: string[];
  // Replaces the built-in preset types entirely
  overrideTypes: string[];
  // Reject commit messages that are not fully lowercase (default: true)
  onlySmallCase: boolean;
}
