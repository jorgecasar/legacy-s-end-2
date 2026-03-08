import { Octokit } from "octokit";

/**
 * @typedef {import('../../domain/ports/IProjectManager.js').IProjectManager} IProjectManager
 */

/**
 * Implementation of Project Manager for GitHub Projects (v2) using GraphQL.
 * @implements {IProjectManager}
 */
export class GitHubProjectAdapter {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Fetches all items from a GitHub Project.
   */
  async getProjectItems(projectId) {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    number
                    title
                    state
                  }
                  ... on PullRequest {
                    number
                    title
                    state
                  }
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.octokit.graphql(query, { projectId });
    return response.node.items.nodes.map((node) => ({
      id: node.id,
      title: node.content?.title,
      number: node.content?.number,
      type: node.content?.__typename,
      fields: node.fieldValues.nodes.reduce((acc, f) => {
        const fieldName = f.field?.name;
        if (fieldName) {
          acc[fieldName] = f.name || f.text;
        }
        return acc;
      }, {}),
    }));
  }

  async addItemToProject(projectId, contentId) {
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item { id }
        }
      }
    `;
    const response = await this.octokit.graphql(mutation, { projectId, contentId });
    return response.addProjectV2ItemById.item.id;
  }

  async findItemByIssueNumber(projectId, issueNumber) {
    // We reuse the list but filter for the number
    const items = await this.getProjectItems(projectId);
    return items.find((i) => i.number === issueNumber) || null;
  }

  /**
   * Internal helper to find field and option IDs.
   */
  async _getFieldAndOptionIds(projectId, fieldName, optionName) {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            fields(first: 50) {
              nodes {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.octokit.graphql(query, { projectId });
    const field = response.node.fields.nodes.find((f) => f.name === fieldName);
    if (!field) throw new Error(`Field "${fieldName}" not found in project.`);

    const option = field.options.find((o) => o.name === optionName);
    if (!option) throw new Error(`Option "${optionName}" not found for field "${fieldName}".`);

    return { fieldId: field.id, optionId: option.id };
  }

  async updateItemStatus(projectId, itemId, statusName) {
    const { fieldId, optionId } = await this._getFieldAndOptionIds(projectId, "Status", statusName);

    const mutation = `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId,
          itemId: $itemId,
          fieldId: $fieldId,
          value: { singleSelectOptionId: $optionId }
        }) {
          projectV2Item { id }
        }
      }
    `;

    await this.octokit.graphql(mutation, { projectId, itemId, fieldId, optionId });
  }

  async updateCustomField(projectId, itemId, fieldName, value) {
    const { fieldId, optionId } = await this._getFieldAndOptionIds(projectId, fieldName, value);

    const mutation = `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId,
          itemId: $itemId,
          fieldId: $fieldId,
          value: { singleSelectOptionId: $optionId }
        }) {
          projectV2Item { id }
        }
      }
    `;

    await this.octokit.graphql(mutation, { projectId, itemId, fieldId, optionId });
  }
}
