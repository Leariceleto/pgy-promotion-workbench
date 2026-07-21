import { cp, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(appRoot, "..");
const distDir = resolve(appRoot, "dist");
const deployDir = await mkdtemp(resolve(tmpdir(), "pgy-promotion-pages-"));

const capture = (command, args) =>
  execFileSync(command, args, { encoding: "utf8" }).trim();
const run = (command, args, cwd = repositoryRoot) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });
const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

async function runWithRetry(command, args, cwd = repositoryRoot, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      run(command, args, cwd);
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      process.stdout.write(`Network push failed, retrying (${attempt}/${attempts})...\n`);
      await wait(2000);
    }
  }
}

const remote = capture("git", ["-C", repositoryRoot, "remote", "get-url", "origin"]);
const authorName = capture("git", ["-C", repositoryRoot, "config", "user.name"]);
const authorEmail = capture("git", ["-C", repositoryRoot, "config", "user.email"]);
const remoteLine = capture("git", ["ls-remote", remote, "refs/heads/gh-pages"]);
const remoteCommit = remoteLine.split(/\s+/)[0] || "";

await cp(distDir, deployDir, { recursive: true });
run("git", ["init", "-b", "gh-pages"], deployDir);
run("git", ["config", "user.name", authorName], deployDir);
run("git", ["config", "user.email", authorEmail], deployDir);
run("git", ["add", "."], deployDir);
run("git", ["commit", "-m", "Deploy promotion workbench"], deployDir);

const lease = remoteCommit
  ? `--force-with-lease=refs/heads/gh-pages:${remoteCommit}`
  : "--force-with-lease";
await runWithRetry("git", ["push", lease, remote, "gh-pages:gh-pages"], deployDir);

process.stdout.write("GitHub Pages deployment branch updated.\n");
