/**
 * Interface for Project Manager operations.
 * @interface IProjectManager
 */
export class IProjectManager {
  /**
   * Fetches all items from a project.
   * @param {string} projectId
   * @param {string} [owner]
   * @returns {Promise<Array<{ id: string, title?: string, number?: number, type?: string, fields: object }>>}
   */
  async getProjectItems(projectId, owner) {
    throw new Error(`Method not implemented. ${projectId} ${owner}`);
  }

  /**
   * Adds an item to a project.
   * @param {string} projectId
   * @param {string} contentId
   * @param {string} [owner]
   * @returns {Promise<string>}
   */
  async addItemToProject(projectId, contentId, owner) {
    throw new Error(`Method not implemented. ${projectId} ${contentId} ${owner}`);
  }

  /**
   * Finds an item by its issue number.
   * @param {string} projectId
   * @param {number} issueNumber
   * @param {string} [owner]
   * @returns {Promise<any|null>}
   */
  async findItemByIssueNumber(projectId, issueNumber, owner) {
    throw new Error(`Method not implemented. ${projectId} ${issueNumber} ${owner}`);
  }

  /**
   * Updates the status of an item.
   * @param {string} projectId
   * @param {string} itemId
   * @param {string} statusName
   * @param {string} [owner]
   * @returns {Promise<void>}
   */
  async updateItemStatus(projectId, itemId, statusName, owner) {
    throw new Error(`Method not implemented. ${projectId} ${itemId} ${statusName} ${owner}`);
  }

  /**
   * Updates a custom field of an item.
   * @param {string} projectId
   * @param {string} itemId
   * @param {string} fieldName
   * @param {string} value
   * @param {string} [owner]
   * @returns {Promise<void>}
   */
  async updateCustomField(projectId, itemId, fieldName, value, owner) {
    throw new Error(
      `Method not implemented. ${projectId} ${itemId} ${fieldName} ${value} ${owner}`,
    );
  }
}
