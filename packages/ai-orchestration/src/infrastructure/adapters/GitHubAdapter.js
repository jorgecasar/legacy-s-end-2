import { Octokit } from "octokit";

/**
 * @typedef {import('../../domain/ports/IGitProvider.js').IGitProvider} IGitProvider
 */

/**
 * Real GitHub Adapter wrapping the Octokit SDK.
 *
 * @implements {IGitProvider}
 */
export class GitHubAdapter {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  async getIssue(owner, repo, issueNumber) {
    const { data } = await this.octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });
    return data;
  }

  async getPullRequest(owner, repo, pullNumber) {
    // We get the diff specifically for PRs
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: "diff",
      },
    });
    return String(data); // This returns the actual string diff because of the mediaType
  }

  async createComment(owner, repo, issueNumber, body) {
    await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  }

  async addLabels(owner, repo, issueNumber, labels) {
    await this.octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  }

  async updateMilestone(owner, repo, issueNumber, milestone) {
    await this.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      milestone,
    });
  }

  async listComments(owner, repo, issueNumber) {
    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });
    return data;
  }

  async updateComment(owner, repo, commentId, body) {
    await this.octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body,
    });
  }

  async createPullRequest(owner, repo, title, head, base, body) {
    const { data } = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    });
    return data;
  }
}
