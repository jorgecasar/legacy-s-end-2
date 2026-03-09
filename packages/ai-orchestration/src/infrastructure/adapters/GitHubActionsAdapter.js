import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * @typedef {import('../../domain/ports/ICIProvider.js').ICIProvider} ICIProvider
 */

/**
 * Adapter for GitHub Actions.
 * Encapsulates `@actions/core` and `@actions/github`.
 * @implements {ICIProvider}
 */
export class GitHubActionsAdapter {
  getInput(name, options = {}) {
    // First try to get without required: true to check for existence or fallback
    const value = core.getInput(name, { ...options, required: false });

    if (!value) {
      const fallback = process.env[name.toUpperCase()];
      if (fallback) return fallback;
    }

    // If still no value and it was required, call with original options to trigger core's error handling
    if (!value && options.required) {
      return core.getInput(name, options);
    }

    return value;
  }

  getEventContext() {
    try {
      return {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        eventName: github.context.eventName || process.env.GITHUB_EVENT_NAME || "manual",
        payload: github.context.payload || {},
      };
    } catch {
      // Fallback for local execution if github.context is not fully initialized
      const [owner, repo] = (process.env.GITHUB_REPOSITORY || "owner/repo").split("/");
      return {
        owner,
        repo,
        eventName: process.env.GITHUB_EVENT_NAME || "manual",
        payload: {},
      };
    }
  }

  info(message) {
    core.info(message);
  }

  warning(message) {
    core.warning(message);
  }

  error(message) {
    core.error(message);
  }

  setFailed(message) {
    core.setFailed(message);
  }

  setOutput(name, value) {
    core.setOutput(name, value);
  }
}
