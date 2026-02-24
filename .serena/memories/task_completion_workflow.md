# Task Completion Workflow

Before considering a task finished, ensure the following steps are completed:

1. **Validation**:
   - Run `npm run lint` and `npm run lint:types` to ensure code quality.
   - Run `npm run format` to ensure consistent style.
   - Run relevant tests (e.g., `npm run test` in the affected package).

2. **Documentation**:
   - Update any relevant documents in the `docs/` directory if architectural or significant changes were made.
   - Update `CHANGELOG.md` with a summary of the changes.

3. **Committing**:
   - Follow Conventional Commits for the commit message.
   - Ensure the git state is clean (no extra files staged or modified).

4. **Review**:
   - Inspect the diff of your changes to ensure no unintended modifications were made.
   - Verify that all new features or bug fixes have corresponding tests.
