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
    this.resolvedIds = new Map();
  }

  /**
   * Resolves a project ID. If it's a number, it fetches the global node ID.
   * @param {string} owner
   * @param {string|number} projectIdOrNumber
   * @returns {Promise<string>}
   */
  async _resolveId(owner, projectIdOrNumber) {
    const key = `${owner}/${projectIdOrNumber}`;
    if (this.resolvedIds.has(key)) return this.resolvedIds.get(key);

    const idStr = projectIdOrNumber.toString();
    if (idStr.startsWith("PVT_") || idStr.length > 10) {
      this.resolvedIds.set(key, idStr);
      return idStr;
    }

    const number = parseInt(idStr, 10);
    // Separate queries to avoid one failing the entire request due to 'Resource not accessible'
    const userQuery = `query($owner: String!, $number: Int!) { user(login: $owner) { projectV2(number: $number) { id } } }`;
    const orgQuery = `query($owner: String!, $number: Int!) { organization(login: $owner) { projectV2(number: $number) { id } } }`;

    let id = null;

    try {
      const userRes = await this.octokit.graphql(userQuery, { owner, number });
      id = userRes.user?.projectV2?.id;
    } catch {
      // Ignore errors here, we will try org next or fail at the end
    }

    if (!id) {
      try {
        const orgRes = await this.octokit.graphql(orgQuery, { owner, number });
        id = orgRes.organization?.projectV2?.id;
      } catch (err) {
        // Handle the 'Resource not accessible' or 'NOT_FOUND' specifically
        if (err.message.includes("Resource not accessible")) {
          throw new Error(
            `Permission Denied: The token provided does not have access to GitHub Projects v2 for ${owner}. If this is a User project, you MUST use a Personal Access Token (PAT) with 'project' scope instead of the default GITHUB_TOKEN.`,
          );
        }
      }
    }

    if (!id) {
      throw new Error(
        `Could not resolve Project Number ${number} for owner ${owner}. Please verify the project number and ensure your token has 'project' scope permissions.`,
      );
    }

    this.resolvedIds.set(key, id);
    return id;
  }

  /**
   * Fetches all items from a GitHub Project.
   */
  async getProjectItems(projectId, owner) {
    const id = owner ? await this._resolveId(owner, projectId) : projectId;
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

    const response = await this.octokit.graphql(query, { projectId: id });
    if (!response.node) return [];

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

  async addItemToProject(projectId, contentId, owner) {
    const id = owner ? await this._resolveId(owner, projectId) : projectId;
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item { id }
        }
      }
    `;
    const response = await this.octokit.graphql(mutation, { projectId: id, contentId });
    return response.addProjectV2ItemById.item.id;
  }

  async findItemByIssueNumber(projectId, issueNumber, owner) {
    const items = await this.getProjectItems(projectId, owner);
    return items.find((i) => i.number === issueNumber) || null;
  }

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

  async updateItemStatus(projectId, itemId, statusName, owner) {
    const id = owner ? await this._resolveId(owner, projectId) : projectId;
    const { fieldId, optionId } = await this._getFieldAndOptionIds(id, "Status", statusName);

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

    await this.octokit.graphql(mutation, { projectId: id, itemId, fieldId, optionId });
  }

  async updateCustomField(projectId, itemId, fieldName, value, owner) {
    const id = owner ? await this._resolveId(owner, projectId) : projectId;
    const { fieldId, optionId } = await this._getFieldAndOptionIds(id, fieldName, value);

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

    await this.octokit.graphql(mutation, { projectId: id, itemId, fieldId, optionId });
  }
}
