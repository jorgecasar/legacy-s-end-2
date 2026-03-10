import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * Executes file system modifications based on parsed XML blocks from LLM responses.
 *
 * It looks for blocks structured like:
 * <file_changes>
 *   <file path="path/to/file.js" operation="create|update|delete">
 *     <content>
 *     ... file content ...
 *     </content>
 *   </file>
 * </file_changes>
 */
export class FileExecutor {
  constructor(workspaceDir) {
    this.workspaceDir = workspaceDir;
  }

  /**
   * Parses the raw LLM response and extracts all file change commands.
   * @param {string} llmResponse The full text response from the AI
   * @returns {Array<{ path: string, operation: string, content: string }>}
   */
  parseChanges(llmResponse) {
    const changes = [];
    const changeBlockRegex = /<file_changes>([\s\S]*?)<\/file_changes>/gi;
    const fileRegex =
      /<file\s+path="([^"]+)"\s+operation="([^"]+)">\s*<content>\s*([\s\S]*?)\s*<\/content>\s*<\/file>/gi;

    const matches = [...llmResponse.matchAll(changeBlockRegex)];
    for (const blockMatch of matches) {
      const blockContent = blockMatch[1];
      const fileMatches = [...blockContent.matchAll(fileRegex)];

      for (const fileMatch of fileMatches) {
        changes.push({
          path: fileMatch[1].trim(),
          operation: fileMatch[2].toLowerCase().trim(),
          content: fileMatch[3].trim(), // NOTE: May trim leading/trailing empty lines, which is usually fine
        });
      }
    }

    return changes;
  }

  /**
   * Applies the parsed changes to the file system.
   * @param {Array<{ path: string, operation: string, content: string }>} changes
   * @param {import('../../domain/ports/ICIProvider.js').ICIProvider} logger Optional logger
   */
  async applyChanges(
    changes,
    logger = {
      info: console.log,
      warning: console.warn,
      error: console.error,
      getInput: () => "",
      getEventContext: () => ({ owner: "", repo: "", eventName: "", payload: {} }),
      setFailed: console.error,
      setOutput: (_name, _value) => {},
    },
  ) {
    for (const change of changes) {
      if (!change.path || change.path.includes("..")) {
        logger.warning(`Skipping invalid or unsafe path: ${change.path}`);
        continue;
      }

      const absolutePath = path.resolve(this.workspaceDir, change.path);

      // Secondary safety check: ensure the resolved path stays within the workspace
      if (!absolutePath.startsWith(path.resolve(this.workspaceDir))) {
        logger.warning(`Path escaping workspace detected: ${change.path}`);
        continue;
      }

      try {
        if (change.operation === "create" || change.operation === "update") {
          const dir = path.dirname(absolutePath);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(absolutePath, change.content, "utf-8");
          logger.info(`[FileExecutor] ${change.operation.toUpperCase()}: ${change.path}`);
        } else if (change.operation === "delete") {
          await fs.rm(absolutePath, { force: true });
          logger.info(`[FileExecutor] DELETE: ${change.path}`);
        } else {
          logger.warning(
            `[FileExecutor] Unknown operation "${change.operation}" for ${change.path}`,
          );
        }
      } catch (err) {
        logger.warning(
          `[FileExecutor] Failed to ${change.operation} file ${change.path}: ${err.message}`,
        );
      }
    }

    // Run post-edit hooks (format/lint) on the modified files to ensure AI output matches standards
    const hookPath = path.resolve(this.workspaceDir, ".rulesync/hooks/format.sh");
    try {
      await fs.access(hookPath);
      for (const change of changes) {
        if (change.operation !== "delete") {
          try {
            // Force execution via bash to ensure script compatibility
            execSync(`bash "${hookPath}" "${change.path}"`, {
              cwd: this.workspaceDir,
              stdio: "inherit",
            });
          } catch (hookErr) {
            logger.warning(
              `[FileExecutor] Post-edit hook failed for ${change.path}: ${hookErr.message}`,
            );
          }
        }
      }
    } catch {
      // Hook doesn't exist or is not accessible, skip silently
    }
  }

  /**
   * Convenience method to parse and apply changes in one shot.
   * @param {string} llmResponse
   * @param {import('../../domain/ports/ICIProvider.js').ICIProvider} logger
   */
  async execute(
    llmResponse,
    logger = {
      info: console.log,
      warning: console.warn,
      error: console.error,
      getInput: () => "",
      getEventContext: () => ({ owner: "", repo: "", eventName: "", payload: {} }),
      setFailed: console.error,
      setOutput: (_name, _value) => {},
    },
  ) {
    const changes = this.parseChanges(llmResponse);
    if (changes.length === 0) {
      logger.info("[FileExecutor] No file changes found in the AI response.");
      return 0;
    }
    await this.applyChanges(changes, logger);
    return changes.length;
  }
}
