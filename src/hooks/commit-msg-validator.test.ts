import { describe, test, expect } from "bun:test";
import { validateCommitMsg } from "./commit-msg-validator.ts";

describe("validateCommitMsg", () => {
  describe("valid messages — built-in types", () => {
    test("simple type and subject", () => {
      expect(validateCommitMsg("feat: add login screen").passed).toBe(true);
    });

    test("type with scope", () => {
      expect(validateCommitMsg("fix(auth): resolve null pointer").passed).toBe(true);
    });

    test("breaking change", () => {
      expect(validateCommitMsg("feat!: breaking api change").passed).toBe(true);
    });

    test("breaking change with scope", () => {
      expect(validateCommitMsg("feat(api)!: breaking api change").passed).toBe(true);
    });

    test("only first line is validated — multiline message passes on valid first line", () => {
      const msg = "feat: add login screen\n\nThis is the body of the commit.";
      expect(validateCommitMsg(msg).passed).toBe(true);
    });

    test("all built-in types are accepted", () => {
      const types = [
        "feat", "fix", "chore", "docs", "style",
        "refactor", "test", "build", "ci", "perf", "revert",
      ];
      for (const type of types) {
        const result = validateCommitMsg(`${type}: some subject`);
        expect(result.passed).toBe(true);
      }
    });
  });

  describe("invalid messages", () => {
    test("empty message fails", () => {
      const result = validateCommitMsg("");
      expect(result.passed).toBe(false);
      expect(result.message).toContain("empty");
    });

    test("whitespace-only message fails", () => {
      expect(validateCommitMsg("   ").passed).toBe(false);
    });

    test("missing colon fails", () => {
      expect(validateCommitMsg("feat add login screen").passed).toBe(false);
    });

    test("no space after colon fails", () => {
      expect(validateCommitMsg("feat:add login screen").passed).toBe(false);
    });

    test("unknown type fails", () => {
      expect(validateCommitMsg("update: something").passed).toBe(false);
    });

    test("missing subject after colon fails", () => {
      expect(validateCommitMsg("feat: ").passed).toBe(false);
    });

    test("error message contains the invalid line", () => {
      const result = validateCommitMsg("update: something");
      expect(result.message).toContain("update: something");
    });

    test("error message lists valid types", () => {
      const result = validateCommitMsg("update: something");
      expect(result.message).toContain("feat");
    });
  });

  describe("appendTypes", () => {
    test("appended type is accepted", () => {
      expect(
        validateCommitMsg("wip: work in progress", { appendTypes: ["wip", "release"] }).passed
      ).toBe(true);
    });

    test("second appended type is accepted", () => {
      expect(
        validateCommitMsg("release: v1.0.0", { appendTypes: ["wip", "release"] }).passed
      ).toBe(true);
    });

    test("built-in types remain valid when appending", () => {
      expect(
        validateCommitMsg("feat: still works", { appendTypes: ["wip"] }).passed
      ).toBe(true);
    });

    test("non-appended custom type is rejected", () => {
      expect(
        validateCommitMsg("hotfix: critical bug", { appendTypes: ["wip", "release"] }).passed
      ).toBe(false);
    });
  });

  describe("overrideTypes", () => {
    test("override type is accepted", () => {
      expect(
        validateCommitMsg("release: v1.0.0", { overrideTypes: ["release", "hotfix"] }).passed
      ).toBe(true);
    });

    test("built-in types are rejected when overridden", () => {
      expect(
        validateCommitMsg("feat: something", { overrideTypes: ["release", "hotfix"] }).passed
      ).toBe(false);
    });

    test("all override types are accepted", () => {
      expect(
        validateCommitMsg("hotfix: critical bug", { overrideTypes: ["release", "hotfix"] }).passed
      ).toBe(true);
    });
  });

  describe("onlySmallCase", () => {
    test("lowercase message passes (default)", () => {
      expect(validateCommitMsg("feat: add login screen").passed).toBe(true);
    });

    test("uppercase subject fails when onlySmallCase is true", () => {
      const result = validateCommitMsg("feat: Add Login Screen", { onlySmallCase: true });
      expect(result.passed).toBe(false);
      expect(result.message).toContain("lowercase");
    });

    test("uppercase subject passes when onlySmallCase is false", () => {
      expect(
        validateCommitMsg("feat: Add Login Screen", { onlySmallCase: false }).passed
      ).toBe(true);
    });

    test("onlySmallCase defaults to true", () => {
      expect(validateCommitMsg("feat: Add Something").passed).toBe(false);
    });
  });
});
