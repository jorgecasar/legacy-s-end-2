import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import { GitHubProjectAdapter } from "../src/infrastructure/adapters/GitHubProjectAdapter.js";

describe("Infrastructure: GitHubProjectAdapter", () => {
  let adapter;

  beforeEach(() => {
    adapter = new GitHubProjectAdapter("fake-token");
    adapter.octokit = {
      graphql: mock.fn(async () => {
        throw new Error("Unhandled graphql query mock");
      }),
    };
  });

  test("getProjectItems should fetch and map items", async () => {
    adapter.octokit.graphql.mock.mockImplementation(async () => ({
      node: {
        items: {
          nodes: [
            {
              id: "item1",
              content: {
                __typename: "Issue",
                title: "Task 1",
                number: 1,
              },
              fieldValues: {
                nodes: [
                  { name: "Todo", field: { name: "Status" } },
                  { text: "High", field: { name: "Priority" } },
                ],
              },
            },
          ],
        },
      },
    }));

    const result = await adapter.getProjectItems("proj1");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, "item1");
    assert.strictEqual(result[0].number, 1);
    assert.strictEqual(result[0].fields.Status, "Todo");
    assert.strictEqual(result[0].fields.Priority, "High");
    assert.strictEqual(adapter.octokit.graphql.mock.callCount(), 1);
  });

  test("addItemToProject should run mutation", async () => {
    adapter.octokit.graphql.mock.mockImplementation(async () => ({
      addProjectV2ItemById: { item: { id: "newItem1" } },
    }));

    const result = await adapter.addItemToProject("proj1", "content1");
    assert.strictEqual(result, "newItem1");
  });

  test("findItemByIssueNumber should return item if found", async () => {
    // Reuses getProjectItems logic
    adapter.octokit.graphql.mock.mockImplementation(async () => ({
      node: {
        items: {
          nodes: [
            {
              id: "item1",
              content: { __typename: "Issue", number: 5 },
              fieldValues: { nodes: [] },
            },
          ],
        },
      },
    }));

    const result = await adapter.findItemByIssueNumber("proj1", 5);
    assert.strictEqual(result.id, "item1");

    const notFound = await adapter.findItemByIssueNumber("proj1", 99);
    assert.strictEqual(notFound, null);
  });

  test("_getFieldAndOptionIds should throw if field not found", async () => {
    adapter.octokit.graphql.mock.mockImplementation(async () => ({
      node: { fields: { nodes: [] } },
    }));

    await assert.rejects(
      async () => adapter._getFieldAndOptionIds("p1", "NonExistent", "Val"),
      /Field "NonExistent" not found/,
    );
  });

  test("_getFieldAndOptionIds should throw if option not found", async () => {
    adapter.octokit.graphql.mock.mockImplementation(async () => ({
      node: {
        fields: {
          nodes: [
            {
              name: "Status",
              id: "f1",
              options: [{ name: "Done", id: "o1" }],
            },
          ],
        },
      },
    }));

    await assert.rejects(
      async () => adapter._getFieldAndOptionIds("p1", "Status", "NonExistent"),
      /Option "NonExistent" not found/,
    );
  });

  test("updateItemStatus should fetch field ids and run mutation", async () => {
    let callCount = 0;
    adapter.octokit.graphql.mock.mockImplementation(async (_query) => {
      callCount++;
      if (callCount === 1) {
        // Mock for _getFieldAndOptionIds
        return {
          node: {
            fields: {
              nodes: [
                {
                  name: "Status",
                  id: "f1",
                  options: [{ name: "In Progress", id: "o2" }],
                },
              ],
            },
          },
        };
      }
      // Mock for mutation
      return {
        updateProjectV2ItemFieldValue: { projectV2Item: { id: "item1" } },
      };
    });

    await adapter.updateItemStatus("proj1", "item1", "In Progress");
    assert.strictEqual(callCount, 2);
  });

  test("updateCustomField should fetch field ids and run mutation", async () => {
    let callCount = 0;
    adapter.octokit.graphql.mock.mockImplementation(async (_query) => {
      callCount++;
      if (callCount === 1) {
        return {
          node: {
            fields: {
              nodes: [
                {
                  name: "Priority",
                  id: "f2",
                  options: [{ name: "Low", id: "o1" }],
                },
              ],
            },
          },
        };
      }
      return {
        updateProjectV2ItemFieldValue: { projectV2Item: { id: "item1" } },
      };
    });

    await adapter.updateCustomField("proj1", "item1", "Priority", "Low");
    assert.strictEqual(callCount, 2);
  });
});
