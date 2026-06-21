import { describe, test, expect } from "bun:test";
import { buildConfig } from "./config-parser.ts";

// buildConfig takes an already-decoded YAML object, so no filesystem needed in these tests

describe("buildConfig — global config", () => {
  test("verbose defaults to true when not specified", () => {
    const config = buildConfig({ "pre-commit": { commands: {} } });
    expect(config.globalConfig.verbose).toBe(true);
  });

  test("stagedOnly defaults to false when not specified", () => {
    const config = buildConfig({});
    expect(config.globalConfig.stagedOnly).toBe(false);
  });

  test("verbose can be set to false", () => {
    const config = buildConfig({ commitguard: { verbose: false } });
    expect(config.globalConfig.verbose).toBe(false);
  });

  test("stagedOnly can be set to true", () => {
    const config = buildConfig({ commitguard: { staged_only: true } });
    expect(config.globalConfig.stagedOnly).toBe(true);
  });

  test("global config block does not create a hook", () => {
    const config = buildConfig({ commitguard: { verbose: true } });
    expect(config.hooks.size).toBe(0);
  });
});

describe("buildConfig — hooks", () => {
  test("unknown hook key is ignored", () => {
    const config = buildConfig({ "unknown-hook": { commands: {} } });
    expect(config.hooks.size).toBe(0);
  });

  test("pre-commit hook is parsed", () => {
    const config = buildConfig({
      "pre-commit": { commands: { lint: { run: "bun lint" } } },
    });
    expect(config.hooks.has("pre-commit")).toBe(true);
  });

  test("parallel defaults to false", () => {
    const config = buildConfig({
      "pre-commit": { commands: {} },
    });
    expect(config.hooks.get("pre-commit")!.parallel).toBe(false);
  });

  test("parallel can be set to true", () => {
    const config = buildConfig({
      "pre-commit": { parallel: true, commands: {} },
    });
    expect(config.hooks.get("pre-commit")!.parallel).toBe(true);
  });

  test("multiple hooks are all parsed", () => {
    const config = buildConfig({
      "pre-commit": { commands: { lint: { run: "bun lint" } } },
      "pre-push": { commands: { test: { run: "bun test" } } },
    });
    expect(config.hooks.size).toBe(2);
    expect(config.hooks.has("pre-commit")).toBe(true);
    expect(config.hooks.has("pre-push")).toBe(true);
  });
});

describe("buildConfig — shell commands", () => {
  test("run field is parsed correctly", () => {
    const config = buildConfig({
      "pre-commit": { commands: { lint: { run: "bun lint" } } },
    });
    expect(config.hooks.get("pre-commit")!.commands.get("lint")!.run).toBe("bun lint");
  });

  test("glob is parsed when present", () => {
    const config = buildConfig({
      "pre-commit": {
        commands: { lint: { run: "bun lint", glob: "**/*.ts" } },
      },
    });
    expect(config.hooks.get("pre-commit")!.commands.get("lint")!.glob).toBe("**/*.ts");
  });

  test("glob is undefined when not specified", () => {
    const config = buildConfig({
      "pre-commit": { commands: { lint: { run: "bun lint" } } },
    });
    expect(config.hooks.get("pre-commit")!.commands.get("lint")!.glob).toBeUndefined();
  });

  test("staged_only per command is parsed", () => {
    const config = buildConfig({
      "pre-commit": {
        commands: { lint: { run: "bun lint", staged_only: true } },
      },
    });
    expect(config.hooks.get("pre-commit")!.commands.get("lint")!.stagedOnly).toBe(true);
  });

  test("staged_only defaults to undefined — inherits global", () => {
    const config = buildConfig({
      "pre-commit": { commands: { lint: { run: "bun lint" } } },
    });
    expect(config.hooks.get("pre-commit")!.commands.get("lint")!.stagedOnly).toBeUndefined();
  });

  test("missing run field throws", () => {
    expect(() =>
      buildConfig({ "pre-commit": { commands: { bad: {} } } })
    ).toThrow('"run" field');
  });
});

describe("buildConfig — commit-msg commands", () => {
  test("commit-msg commands go into msgCommands, not commands", () => {
    const config = buildConfig({
      "commit-msg": {
        commands: { conventional: { preset: "conventional" } },
      },
    });
    const hook = config.hooks.get("commit-msg")!;
    expect(hook.msgCommands.has("conventional")).toBe(true);
    expect(hook.commands.size).toBe(0);
  });

  test("preset is parsed correctly", () => {
    const config = buildConfig({
      "commit-msg": {
        commands: { check: { preset: "conventional" } },
      },
    });
    expect(config.hooks.get("commit-msg")!.msgCommands.get("check")!.preset).toBe("conventional");
  });

  test("onlySmallCase defaults to true", () => {
    const config = buildConfig({
      "commit-msg": {
        commands: { check: { preset: "conventional" } },
      },
    });
    expect(config.hooks.get("commit-msg")!.msgCommands.get("check")!.onlySmallCase).toBe(true);
  });

  test("onlySmallCase can be set to false", () => {
    const config = buildConfig({
      "commit-msg": {
        commands: { check: { preset: "conventional", only_small_case: false } },
      },
    });
    expect(config.hooks.get("commit-msg")!.msgCommands.get("check")!.onlySmallCase).toBe(false);
  });

  test("appendTypes are parsed", () => {
    const config = buildConfig({
      "commit-msg": {
        commands: {
          check: { preset: "conventional", types: { append: ["wip", "release"] } },
        },
      },
    });
    expect(
      config.hooks.get("commit-msg")!.msgCommands.get("check")!.appendTypes
    ).toEqual(["wip", "release"]);
  });

  test("overrideTypes are parsed", () => {
    const config = buildConfig({
      "commit-msg": {
        commands: {
          check: { preset: "conventional", types: { override: ["hotfix"] } },
        },
      },
    });
    expect(
      config.hooks.get("commit-msg")!.msgCommands.get("check")!.overrideTypes
    ).toEqual(["hotfix"]);
  });

  test("appendTypes and overrideTypes both empty by default", () => {
    const config = buildConfig({
      "commit-msg": { commands: { check: { preset: "conventional" } } },
    });
    const cmd = config.hooks.get("commit-msg")!.msgCommands.get("check")!;
    expect(cmd.appendTypes).toEqual([]);
    expect(cmd.overrideTypes).toEqual([]);
  });

  test("missing preset field throws", () => {
    expect(() =>
      buildConfig({ "commit-msg": { commands: { bad: {} } } })
    ).toThrow('"preset" field');
  });

  test("having both append and override throws", () => {
    expect(() =>
      buildConfig({
        "commit-msg": {
          commands: {
            check: {
              preset: "conventional",
              types: { append: ["wip"], override: ["hotfix"] },
            },
          },
        },
      })
    ).toThrow("both");
  });
});
