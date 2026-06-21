// Built-in commit types from the Conventional Commits spec
const BUILT_IN_TYPES = [
  "feat",
  "fix",
  "chore",
  "docs",
  "style",
  "refactor",
  "test",
  "build",
  "ci",
  "perf",
  "revert",
];

export interface ValidationResult {
  passed: boolean;
  // Present only when passed is false
  message?: string;
}

// Validates a commit message against the Conventional Commits format.
// Only the first line of the message is checked.
// Pass appendTypes to add custom types on top of built-ins.
// Pass overrideTypes to replace built-ins entirely.
export function validateCommitMsg(
  message: string,
  options: {
    appendTypes?: string[];
    overrideTypes?: string[];
    onlySmallCase?: boolean;
  } = {}
): ValidationResult {
  const { appendTypes = [], overrideTypes = [], onlySmallCase = true } = options;
  const validTypes = resolveTypes(appendTypes, overrideTypes);
  const firstLine = message.trim().split("\n")[0] ?? "";

  if (firstLine.length === 0) {
    return fail("Commit message cannot be empty.");
  }

  if (onlySmallCase && firstLine !== firstLine.toLowerCase()) {
    return fail(
      `Commit message must be lowercase.\n\n  Got: ${firstLine}\n\n  Example:\n    feat(auth): add login screen\n`
    );
  }

  if (!buildPattern(validTypes).test(firstLine)) {
    return fail(
      `Commit message does not follow conventional commits format.\n\n` +
        `  Expected: <type>(<scope>): <subject>\n` +
        `  Got:      ${firstLine}\n\n` +
        `  Valid types: ${validTypes.join(", ")}\n\n` +
        `  Examples:\n` +
        `    feat(auth): add login screen\n` +
        `    fix: resolve null pointer exception\n` +
        `    chore(deps): update dependencies\n`
    );
  }

  return { passed: true };
}

function resolveTypes(appendTypes: string[], overrideTypes: string[]): string[] {
  if (overrideTypes.length > 0) return overrideTypes;
  if (appendTypes.length > 0) return [...BUILT_IN_TYPES, ...appendTypes];
  return BUILT_IN_TYPES;
}

// Matches: <type>[(<scope>)][!]: <subject>
function buildPattern(validTypes: string[]): RegExp {
  return new RegExp(`^(${validTypes.join("|")})(?=\\(|!|:)(\\(.+\\))?(!)?: .+`);
}

function fail(message: string): ValidationResult {
  return { passed: false, message };
}
