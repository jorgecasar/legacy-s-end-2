# AI Orchestration GitHub Action

Autonomously plans, implements, or reviews GitHub issues/PRs using AI.

## Usage

Add this to your `.github/workflows/ai-orchestration.yml`:

```yaml
steps:
  - name: Run AI Planner
    uses: ./packages/ai-orchestration
    with:
      agent_role: "planner"
      github_token: ${{ secrets.GITHUB_TOKEN }}
      ai_api_key: ${{ secrets.AI_API_KEY }}
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
