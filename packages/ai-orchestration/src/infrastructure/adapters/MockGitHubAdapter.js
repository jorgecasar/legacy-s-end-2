/**
 * @typedef {import('../../domain/ports/IGitProvider.js').IGitProvider} IGitProvider
 */

/**
 * Simulated GitHub Adapter for testing and dry-runs.
 *
 * @implements {IGitProvider}
 */
export class MockGitHubAdapter {
  constructor() {
    this.memory = {
      comments: [],
      reviewComments: [],
      labels: [],
      milestones: [],
      reviews: [],
    };
  }

  async getIssue(_owner, _repo, issueNumber) {
    // Return a mocked issue that matches what tests or the selector might expect.
    return {
      number: issueNumber,
      title: "Mock Issue",
      body: "Mock Body",
      state: "open",
    };
  }

  async getPullRequestMetadata(_owner, _repo, pullNumber) {
    return {
      number: pullNumber,
      title: "Mock PR",
      body: "Mock Body closes #123",
      head: { ref: `feat/issue-123` },
      base: { ref: "main" },
    };
  }

  async getPullRequest(_owner, _repo, _pullNumber) {
    // Returns a mock diff string
    return "Mock Diff";
  }

  async createComment(_owner, _repo, issueNumber, body) {
    this.memory.comments.push({ issueNumber, body, user: { login: "mock-bot" } });
    // Simulate successful creation
  }

  async addLabels(owner, repo, issueNumber, labels) {
    this.memory.labels.push({ issueNumber, labels });
    // Simulate successful addition
  }

  async updateMilestone(owner, repo, issueNumber, milestone) {
    this.memory.milestones.push({ issueNumber, milestone });
    // Simulate successful update
  }

  async listComments(owner, repo, issueNumber) {
    return this.memory.comments.filter((c) => c.issueNumber === issueNumber);
  }

  async listReviewComments(owner, repo, pullNumber) {
    return this.memory.reviewComments.filter((c) => c.pullNumber === pullNumber);
  }

  async listReviews(_owner, _repo, pullNumber) {
    return this.memory.reviews.filter((r) => r.pullNumber === pullNumber);
  }

  async updateComment(owner, repo, commentId, body) {
    const comment = this.memory.comments.find((c) => c.id === commentId);
    if (comment) comment.body = body;
  }

  async createPullRequest(_owner, _repo, title, head, base, body) {
    return {
      title,
      head: { ref: head },
      base: { ref: base },
      body,
      number: 999,
      html_url: `https://github.com/mock/mock/pull/999`,
    };
  }

  async createIssue(owner, repo, params) {
    return {
      number: 999,
      title: params.title,
    };
  }

  async addSubIssue(_owner, _repo, _parentIssueNumber, _subIssueId) {
    // Simulated behavior
  }

  async listPullRequests(_owner, _repo, _params) {
    return [];
  }

  async listIssues(_owner, _repo, _params) {
    return [];
  }

  async listSubIssues(_owner, _repo, _parentIssueNumber) {
    return [];
  }
}
