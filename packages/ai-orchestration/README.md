# AI Orchestration GitHub Action

Autonomously plans, implements, or reviews GitHub issues/PRs using AI.

## Usage

Add this to your `.github/workflows/ai-orchestration.yml`:

```yaml
steps:
  - name: Run AI Planner
    uses: ./packages/ai-orchestration
    with:
      agent-role: "planner"
      github-token: ${{ secrets.GITHUB_TOKEN }}
      ai-api-key: ${{ secrets.AI_API_KEY }}
```

## Customizable Prompts

You can override the default prompts by providing optional inputs:

- `planner-system-prompt`
- `planner-user-prompt`
- `planner-response-template`
- `developer-system-prompt`
- `developer-user-prompt`
- `reviewer-system-prompt`
- `reviewer-user-prompt`

## Development

This action is written in JavaScript and bundled using `@vercel/ncc`.

### Scripts

- `npm run build`: Bundles the action into `dist/index.js`.
- `npm run test:ci`: Runs the unit tests.
- `npm run test:integration`: Runs the integration tests simulating a GitHub Action environment.
- `npm run all`: Runs build and all tests.

## Standards

This action follows the [official GitHub JavaScript Action standards](https://github.com/actions/javascript-action), including metadata, branding, and pre-compiled distribution.
