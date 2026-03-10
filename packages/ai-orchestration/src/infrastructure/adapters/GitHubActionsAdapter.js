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
    // 1. Try to get from CLI arguments (--name or --agent_role if name is role)
    const args = process.argv.slice(2);
    const argName = `--${name}`;
    const aliasName = name === "agent_role" ? "--role" : null;

    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith(argName + "=") || (aliasName && args[i].startsWith(aliasName + "="))) {
        return args[i].split("=")[1];
      }

      if (args[i] === argName || (aliasName && args[i] === aliasName)) {
        if (args[i + 1] && !args[i + 1].startsWith("--")) {
          return args[i + 1];
        }
      }
    }

    // 2. Try to get from core.getInput
    const value = core.getInput(name, { ...options, required: false });

    // 3. Try to get from environment variables
    if (!value) {
      const fallback = process.env[name.toUpperCase()];
      if (fallback) return fallback;
    }

    // 4. If still no value and it was required, call with original options to trigger core's error handling
    if (!value && options.required) {
      return core.getInput(name, options);
    }

    return value;
  }

  getEventContext() {
    const args = process.argv.slice(2);
    let cliOwner = null;
    let cliRepo = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--owner") cliOwner = args[i + 1];
      if (args[i] === "--repo") cliRepo = args[i + 1];
    }

    // Priority 1: CLI Arguments
    if (cliOwner && cliRepo) {
      return {
        owner: cliOwner,
        repo: cliRepo,
        eventName: process.env.GITHUB_EVENT_NAME || "manual",
        payload: {},
      };
    }

    // Priority 2: Explicit Environment Variables (local dev)
    if (process.env.GH_OWNER && process.env.GH_REPO) {
      return {
        owner: process.env.GH_OWNER,
        repo: process.env.GH_REPO,
        eventName: process.env.GITHUB_EVENT_NAME || "manual",
        payload: {},
      };
    }

    try {
      // Priority 3: GitHub Actions Context
      if (github.context.repo.owner && github.context.repo.repo) {
        return {
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          eventName: github.context.eventName || process.env.GITHUB_EVENT_NAME || "manual",
          payload: github.context.payload || {},
        };
      }
    } catch {
      // Ignore context errors
    }

    // Priority 4: Standard GH Env Vars or hardcoded fallback
    const [envOwner, envRepo] = (process.env.GITHUB_REPOSITORY || "owner/repo").split("/");
    return {
      owner: process.env.GH_OWNER || envOwner,
      repo: process.env.GH_REPO || envRepo,
      eventName: process.env.GITHUB_EVENT_NAME || "manual",
      payload: {},
    };
  }

  info(message) {
    if (process.env.NODE_ENV === "test" && process.env.SILENCE_LOGS !== "false") return;
    core.info(message);
  }

  warning(message) {
    if (process.env.NODE_ENV === "test" && process.env.SILENCE_LOGS !== "false") return;
    core.warning(message);
  }

  error(message) {
    if (process.env.NODE_ENV === "test" && process.env.SILENCE_LOGS !== "false") return;
    core.error(message);
  }

  setFailed(message) {
    if (process.env.NODE_ENV === "test" && process.env.SILENCE_LOGS !== "false") return;
    core.setFailed(message);
  }
  setOutput(name, value) {
    core.setOutput(name, value);
  }
}
