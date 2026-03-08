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

  async getPullRequestMetadata(owner, repo, pullNumber) {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
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

  async listReviewComments(owner, repo, pullNumber) {
    const { data } = await this.octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return data;
  }

  async listReviews(owner, repo, pullNumber) {
    const { data } = await this.octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: pullNumber,
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

  async createIssue(owner, repo, params) {
    const { data } = await this.octokit.rest.issues.create({
      owner,
      repo,
      ...params,
    });
    return data;
  }

  async addSubIssue(owner, repo, parentIssueNumber, subIssueId) {
    // The sub-issues API might require a direct request if not in the standard Octokit rest yet
    // API: POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues
    await this.octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues", {
      owner,
      repo,
      issue_number: parentIssueNumber,
      sub_issue_id: subIssueId,
    });
  }

  async listPullRequests(owner, repo, params) {
    const { data } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      ...params,
    });
    return data;
  }

  async listIssues(owner, repo, params) {
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      ...params,
    });
    return data;
  }

  async listSubIssues(owner, repo, parentIssueNumber) {
    const { data } = await this.octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      {
        owner,
        repo,
        issue_number: parentIssueNumber,
      },
    );
    return data;
  }
}
