import { YAML } from "bun";
import { join } from "node:path";
import type {
  GitHooksConfig,
  CommitGuardConfig,
  HookConfig,
  CommandConfig,
  CommitMsgCommandConfig,
  HookType,
} from "./config-model.ts";
import {
  ALL_HOOK_TYPES,
  defaultCommitGuardConfig,
} from "./config-model.ts";

const CONFIG_FILE_NAME = "commitguard.yaml";
const GLOBAL_CONFIG_KEY = "commitguard";

// Reads and parses commitguard.yaml from the current working directory
export async function parseConfig(): Promise<GitHooksConfig> {
  const configPath = join(process.cwd(), CONFIG_FILE_NAME);
  const file = Bun.file(configPath);

  if (!(await file.exists())) {
    throw new Error(
      `${CONFIG_FILE_NAME} not found. Create one in your project root.`
    );
  }

  const content = await file.text();
  const yaml = YAML.parse(content) as Record<string, unknown>;
  return buildConfig(yaml);
}

// Exported for testing — parses a plain JS object (already-decoded YAML) into GitHooksConfig
export function buildConfig(yaml: Record<string, unknown>): GitHooksConfig {
  let globalConfig: CommitGuardConfig = { ...defaultCommitGuardConfig };
  const hooks = new Map<HookType, HookConfig>();

  for (const [key, value] of Object.entries(yaml)) {
    if (key === GLOBAL_CONFIG_KEY) {
      globalConfig = parseGlobalConfig(value as Record<string, unknown>);
      continue;
    }

    if (!ALL_HOOK_TYPES.includes(key as HookType)) {
      console.warn(`⚠️  Unknown hook "${key}" — skipping.`);
      continue;
    }

    hooks.set(
      key as HookType,
      parseHookConfig(value as Record<string, unknown>, key as HookType)
    );
  }

  return { globalConfig, hooks };
}

function parseGlobalConfig(raw: Record<string, unknown>): CommitGuardConfig {
  return {
    verbose: (raw["verbose"] as boolean) ?? true,
    stagedOnly: (raw["staged_only"] as boolean) ?? false,
  };
}

function parseHookConfig(
  raw: Record<string, unknown>,
  hookType: HookType
): HookConfig {
  const parallel = (raw["parallel"] as boolean) ?? false;
  const commandsRaw = (raw["commands"] as Record<string, unknown>) ?? {};
  const commands = new Map<string, CommandConfig>();
  const msgCommands = new Map<string, CommitMsgCommandConfig>();

  for (const [name, value] of Object.entries(commandsRaw)) {
    const cmdRaw = value as Record<string, unknown>;

    if (hookType === "commit-msg") {
      msgCommands.set(name, parseCommitMsgCommand(cmdRaw));
    } else {
      commands.set(name, parseCommandConfig(cmdRaw));
    }
  }

  return { parallel, commands, msgCommands };
}

function parseCommandConfig(raw: Record<string, unknown>): CommandConfig {
  const run = raw["run"] as string | undefined;
  if (!run) throw new Error('Command is missing required "run" field.');

  return {
    run,
    glob: raw["glob"] as string | undefined,
    stagedOnly: raw["staged_only"] as boolean | undefined,
  };
}

function parseCommitMsgCommand(
  raw: Record<string, unknown>
): CommitMsgCommandConfig {
  const preset = raw["preset"] as string | undefined;
  if (!preset)
    throw new Error('commit-msg command must have a "preset" field.');

  const typesRaw = raw["types"] as Record<string, unknown> | undefined;
  const appendTypes = parseTypesList(typesRaw, "append");
  const overrideTypes = parseTypesList(typesRaw, "override");

  if (appendTypes.length > 0 && overrideTypes.length > 0) {
    throw new Error(
      'commit-msg types cannot have both "append" and "override" at the same time.'
    );
  }

  return {
    preset,
    appendTypes,
    overrideTypes,
    onlySmallCase: (raw["only_small_case"] as boolean) ?? true,
  };
}

function parseTypesList(
  typesRaw: Record<string, unknown> | undefined,
  key: string
): string[] {
  if (!typesRaw) return [];
  const list = typesRaw[key];
  return Array.isArray(list) ? (list as string[]) : [];
}
