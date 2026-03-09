# AI Orchestration GitHub Action

Autonomously plans, implements, or reviews GitHub issues/PRs using AI.

## Usage

Add this to your `.github/workflows/ai-orchestration.yml`:

````yaml
steps:
### Role: Planner
```yaml
- name: Run AI Planner
  uses: ./packages/ai-orchestration
  with:
    agent_role: "planner"
    github_token: ${{ secrets.GITHUB_TOKEN }}
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
````

### Role: Orchestrate

Unifies triage and task selection.

```yaml
- name: Run Master Orchestrator
  uses: ./packages/ai-orchestration
  with:
    agent_role: "orchestrate"
    github_token: ${{ secrets.GITHUB_TOKEN }}
    project_id: "PVT_kwDOA12345" # Your GitHub Project ID
    wip_limit: 3 # Optional, defaults to 5
```

## Inputs

| Input               | Description                                          | Required               | Default |
| ------------------- | ---------------------------------------------------- | ---------------------- | ------- |
| `agent_role`        | `planner`, `developer`, `reviewer`, or `orchestrate` | Yes                    | -       |
| `gh_token`          | GitHub personal access token or `GITHUB_TOKEN`       | Yes                    | -       |
| `project_id`        | GitHub Project ID (Global Node ID)                   | Only for `orchestrate` | -       |
| `wip_limit`         | WIP limit for tasks                                  | No                     | `5`     |
| `gemini_api_key`    | Google Gemini API Key                                | Optional               | -       |
| `anthropic_api_key` | Anthropic API Key                                    | Optional               | -       |
| `openai_api_key`    | OpenAI API Key                                       | Optional               | -       |

```

## Customizable Prompts

You can override the default prompts by providing optional inputs:

- `planner_system_prompt`
- `planner_user_prompt`
- `planner_response_template`
- `developer_system_prompt`
- `developer_user_prompt`
- `reviewer_system_prompt`
- `reviewer_user_prompt`

## Development

This action is written in JavaScript and bundled using `@vercel/ncc`.

### Scripts

- `npm run build`: Bundles the action into `dist/index.js`.
- `npm run test`: Runs the unit and integration tests simulating a GitHub Action environment.
- `npm run all`: Runs build and all tests.

## Standards

This action follows the [official GitHub JavaScript Action standards](https://github.com/actions/javascript-action), including metadata, branding, and pre-compiled distribution.
```
