---
targets: ["antigravity", "claudecode", "geminicli"]
description: "Context and token optimization using RTK and Squeezr"
globs: ["**/*"]
---

# AI Context Optimization (RTK & Squeezr)

To ensure maximum token efficiency and long-term context retention, the following tools MUST be used:

## 1. RTK (Rust Token Killer)

Always prefix shell commands with `rtk` to filter and compress output.
- **Hook Requirement**: Use `rtk <command>` for all terminal operations.
- **Commands**: `rtk git status`, `rtk npm test`, `rtk ls`, etc.
- **Analytics**: Use `rtk gain` to check savings.

## 2. Squeezr

Ensure the Squeezr proxy is running and used for all AI communications.
- **Proxy URL**: `http://localhost:8080`
- **Dashboard**: `http://localhost:8080/squeezr/dashboard`
- **MCP Server**: Use the `squeezr` MCP server for status and stats.

## 3. Automation Hooks

These tools are integrated via:
- **CLI Hooks**: Automatic command rewriting (where supported).
- **HTTP Proxy**: Intercepting and compressing agent-to-LLM traffic.
- **MCP**: Providing real-time observability of context health.
