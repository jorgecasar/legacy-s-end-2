/**
 * @typedef {import('../../domain/ports/IGitClient.js').IGitClient} IGitClient
 */

/**
 * Mock adapter for Git CLI operations.
 * @implements {IGitClient}
 */
export class MockGitCliAdapter {
  constructor() {
    this.commandsExecuted = [];
    this.currentBranch = "main";
    this.hasChangesMock = false;
    this.rebaseSuccessMock = true;
    this.branchExistsMock = false;
  }

  configAuthor(name, email) {
    this.commandsExecuted.push(`git config --global user.name "${name}"`);
    this.commandsExecuted.push(`git config --global user.email "${email}"`);
  }

  branchExistsRemotely(branchName) {
    this.commandsExecuted.push(`git ls-remote --heads origin "${branchName}"`);
    return this.branchExistsMock;
  }

  checkout(branchName, create = false, force = false) {
    const forceFlag = force ? "--force " : "";
    const flag = create ? "-b " : "";
    this.commandsExecuted.push(`git checkout ${forceFlag}${flag}"${branchName}"`);
    this.currentBranch = branchName;
  }

  rebase(targetBranch) {
    this.commandsExecuted.push(`git rebase ${targetBranch}`);
    if (!this.rebaseSuccessMock) {
      return { success: false, hasConflicts: true };
    }
    return { success: true, hasConflicts: false };
  }

  abortRebase() {
    this.commandsExecuted.push("git rebase --abort");
  }

  getCurrentBranch() {
    return this.currentBranch;
  }

  hasChanges() {
    this.commandsExecuted.push("git status --porcelain");
    return this.hasChangesMock;
  }

  stageAll() {
    this.commandsExecuted.push("git add .");
  }

  squashOnto(targetBranch) {
    this.commandsExecuted.push(`git reset --soft ${targetBranch}`);
  }

  commit(message, skipVerify = true) {
    const flag = skipVerify ? "--no-verify" : "";
    this.commandsExecuted.push(`git commit ${flag} -m "${message}"`);
  }

  pushForce(branchName) {
    this.commandsExecuted.push(`git push origin "${branchName}" --force`);
  }

  runVerification() {
    this.commandsExecuted.push("npm run format || true");
    this.commandsExecuted.push("npm run lint:types");
    this.commandsExecuted.push("npm run lint");
    this.commandsExecuted.push("npm run test");
    return { success: true, output: "Mock verification successful" };
  }
}
