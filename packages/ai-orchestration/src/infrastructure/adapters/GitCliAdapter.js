import child_process from "node:child_process";

/**
 * @typedef {import('../../domain/ports/IGitClient.js').IGitClient} IGitClient
 */

/**
 * Adapter for local Git operations using `child_process.child_process.execSync`.
 * @implements {IGitClient}
 */
export class GitCliAdapter {
  configAuthor(name, email) {
    child_process.execSync(`git config --global user.name "${name}"`);
    child_process.execSync(`git config --global user.email "${email}"`);
  }

  branchExistsRemotely(branchName) {
    try {
      const remoteHeads = child_process
        .execSync(`git ls-remote --heads origin "${branchName}"`)
        .toString()
        .trim();
      return remoteHeads.length > 0;
    } catch {
      return false;
    }
  }

  fetch(remote = "origin", branch = "") {
    const target = branch ? `${remote} ${branch}` : remote;
    child_process.execSync(`git fetch ${target}`, { stdio: "inherit" });
  }

  resetHard(target) {
    child_process.execSync(`git reset --hard ${target}`, { stdio: "inherit" });
  }

  checkout(branchName, create = false) {
    if (create) {
      child_process.execSync(`git checkout -b "${branchName}"`);
    } else {
      try {
        child_process.execSync(`git checkout "${branchName}"`, { stdio: "inherit" });
      } catch {
        // If checkout fails due to local changes, try to stash, checkout, and pop
        console.warn(`[GitCliAdapter] Checkout failed, attempting to stash local changes...`);
        child_process.execSync("git stash");
        child_process.execSync(`git checkout "${branchName}"`, { stdio: "inherit" });
        try {
          child_process.execSync("git stash pop");
        } catch {
          console.warn(`[GitCliAdapter] Merge conflict after stash pop. Please resolve manually.`);
        }
      }
    }
  }

  rebase(targetBranch) {
    try {
      child_process.execSync(`git rebase ${targetBranch}`, { stdio: "inherit" });
      return { success: true, hasConflicts: false };
    } catch {
      return { success: false, hasConflicts: true };
    }
  }

  abortRebase() {
    try {
      child_process.execSync("git rebase --abort", { stdio: "inherit" });
    } catch {
      /* already aborted */
    }
  }

  getCurrentBranch() {
    return child_process.execSync("git branch --show-current").toString().trim();
  }

  hasChanges() {
    return child_process.execSync("git status --porcelain").toString().trim().length > 0;
  }

  stageAll() {
    child_process.execSync("git add .");
  }

  squashOnto(targetBranch) {
    child_process.execSync(`git reset --soft ${targetBranch}`);
  }

  commit(message, skipVerify = true) {
    const flag = skipVerify ? "--no-verify" : "";
    child_process.execSync(`git commit ${flag} -m "${message}"`);
  }

  pushForce(branchName) {
    child_process.execSync(`git push origin "${branchName}" --force`);
  }

  runVerification() {
    let output = "";
    let success = true;

    const run = (command) => {
      try {
        const result = child_process.execSync(command, { stdio: "pipe", encoding: "utf-8" });
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
