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

  fetch(remote = "origin", branch = "") {
    const target = branch ? `${remote} ${branch}` : remote;
    this.commandsExecuted.push(`git fetch ${target}`);
  }

  resetHard(target) {
    this.commandsExecuted.push(`git reset --hard ${target}`);
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
    this.commandsExecuted.push(`git push origin "${branchName}" --force --no-verify`);
  }

  getRemoteUrl(_remote = "origin") {
    return "https://github.com/owner/repo.git";
  }

  runVerification() {
    this.commandsExecuted.push("npm run check:fast");
    return { success: true, output: "Mock verification successful" };
  }

  fix() {
    this.commandsExecuted.push("npm run check:fix");
  }
}
