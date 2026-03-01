import { execSync } from "node:child_process";

/**
 * @typedef {import('../../domain/ports/IGitClient.js').IGitClient} IGitClient
 */

/**
 * Adapter for local Git operations using `child_process.execSync`.
 * @implements {IGitClient}
 */
export class GitCliAdapter {
  configAuthor(name, email) {
    execSync(`git config --global user.name "${name}"`);
    execSync(`git config --global user.email "${email}"`);
  }

  branchExistsRemotely(branchName) {
    try {
      const remoteHeads = execSync(`git ls-remote --heads origin "${branchName}"`)
        .toString()
        .trim();
      return remoteHeads.length > 0;
    } catch {
      return false;
    }
  }

  checkout(branchName, create = false) {
    if (create) {
      execSync(`git checkout -b "${branchName}"`);
    } else {
      try {
        execSync(`git checkout "${branchName}"`, { stdio: "inherit" });
      } catch {
        // If checkout fails due to local changes, try to stash, checkout, and pop
        console.warn(`[GitCliAdapter] Checkout failed, attempting to stash local changes...`);
        execSync("git stash");
        execSync(`git checkout "${branchName}"`, { stdio: "inherit" });
        try {
          execSync("git stash pop");
        } catch {
          console.warn(`[GitCliAdapter] Merge conflict after stash pop. Please resolve manually.`);
        }
      }
    }
  }

  rebase(targetBranch) {
    try {
      execSync(`git rebase ${targetBranch}`, { stdio: "inherit" });
      return { success: true, hasConflicts: false };
    } catch {
      return { success: false, hasConflicts: true };
    }
  }

  abortRebase() {
    try {
      execSync("git rebase --abort", { stdio: "inherit" });
    } catch {
      /* already aborted */
    }
  }

  getCurrentBranch() {
    return execSync("git branch --show-current").toString().trim();
  }

  hasChanges() {
    return execSync("git status --porcelain").toString().trim().length > 0;
  }

  stageAll() {
    execSync("git add .");
  }

  squashOnto(targetBranch) {
    execSync(`git reset --soft ${targetBranch}`);
  }

  commit(message, skipVerify = true) {
    const flag = skipVerify ? "--no-verify" : "";
    execSync(`git commit ${flag} -m "${message}"`);
  }

  pushForce(branchName) {
    execSync(`git push origin "${branchName}" --force`);
  }

  runVerification() {
    let output = "";
    let success = true;

    const run = (command) => {
      try {
        const result = execSync(command, { stdio: "pipe", encoding: "utf-8" });
        output += `\n--- [SUCCESS] ${command} ---\n${result}`;
      } catch (err) {
        success = false;
        output += `\n--- [FAILURE] ${command} ---\n${err.stdout}\n${err.stderr}`;
      }
    };

    run("npm run check");

    return { success, output: output.trim() };
  }
}
