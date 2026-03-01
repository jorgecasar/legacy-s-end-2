import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { FileExecutor } from "../src/infrastructure/services/FileExecutor.js";

describe("FileExecutor", () => {
  const testDir = path.resolve(process.cwd(), ".test-workspace");
  const executor = new FileExecutor(testDir);
  const mockLogger = {
    info: () => {},
    warning: () => {},
  };

  before(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  after(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test("should parse create, update, and delete operations", () => {
    const llmResponse = `
Here is the implementation:
<file_changes>
  <file path="src/newFile.js" operation="create">
    <content>
    console.log("hello");
    </content>
  </file>
  <file path="src/updateFile.txt" operation="update">
    <content>
    updated content
    </content>
  </file>
  <file path="src/oldFile.js" operation="delete">
    <content>
    </content>
  </file>
</file_changes>
    `;

    const changes = executor.parseChanges(llmResponse);
    assert.strictEqual(changes.length, 3);

    assert.strictEqual(changes[0].path, "src/newFile.js");
    assert.strictEqual(changes[0].operation, "create");
    assert.strictEqual(changes[0].content, `console.log("hello");`);

    assert.strictEqual(changes[1].path, "src/updateFile.txt");
    assert.strictEqual(changes[1].operation, "update");
    assert.strictEqual(changes[1].content, "updated content");

    assert.strictEqual(changes[2].path, "src/oldFile.js");
    assert.strictEqual(changes[2].operation, "delete");
  });

  test("should correctly apply changes to the filesystem", async () => {
    const changes = [
      { path: "test.txt", operation: "create", content: "Hello World" },
      { path: "nested/dir/test2.txt", operation: "create", content: "Nested" },
    ];

    await executor.applyChanges(changes, mockLogger);

    const file1 = await fs.readFile(path.join(testDir, "test.txt"), "utf-8");
    assert.strictEqual(file1, "Hello World");

    const file2 = await fs.readFile(path.join(testDir, "nested/dir/test2.txt"), "utf-8");
    assert.strictEqual(file2, "Nested");

    // Test update
    await executor.applyChanges(
      [{ path: "test.txt", operation: "update", content: "Updated World" }],
      mockLogger,
    );
    const file1Updated = await fs.readFile(path.join(testDir, "test.txt"), "utf-8");
    assert.strictEqual(file1Updated, "Updated World");

    // Test delete
    await executor.applyChanges(
      [{ path: "test.txt", operation: "delete", content: "" }],
      mockLogger,
    );

    await assert.rejects(async () => await fs.access(path.join(testDir, "test.txt")), /ENOENT/);
  });

  test("should prevent directory traversal attacks", async () => {
    const changes = [{ path: "../outside.txt", operation: "create", content: "bad" }];

    let warningLogged = false;
    const trackingLogger = {
      info: () => {},
      warning: (msg) => {
        if (msg.includes("outside.txt")) warningLogged = true;
      },
    };

    await executor.applyChanges(changes, trackingLogger);
    assert.strictEqual(warningLogged, true);
  });
});
