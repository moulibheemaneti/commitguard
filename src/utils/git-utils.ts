// Returns the list of file paths currently staged for commit
// Used by hook-runner to support staged_only and glob filtering
export async function getStagedFiles(): Promise<string[]> {
  const proc = Bun.spawn(["git", "diff", "--cached", "--name-only"], {
    stdout: "pipe",
    stderr: "ignore",
  });

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) return [];

  return output
    .trim()
    .split("\n")
    .filter((f) => f.length > 0);
}
