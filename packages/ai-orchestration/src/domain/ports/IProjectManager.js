/**
 * Interface for Project Manager operations.
 * @interface IProjectManager
 */
export class IProjectManager {
  /**
   * Fetches all items from a project.
   * @param {string} projectId
   * @returns {Promise<Array<{ id: string, title?: string, number?: number, type?: string, fields: object }>>}
   */
  async getProjectItems(projectId) {
    throw new Error(`Method not implemented. ${projectId}`);
  }

  /**
   * Adds an item to a project.
   * @param {string} projectId
   * @param {string} contentId
   * @returns {Promise<string>}
   */
  async addItemToProject(projectId, contentId) {
    throw new Error(`Method not implemented. ${projectId} ${contentId}`);
  }

  /**
   * Finds an item by its issue number.
   * @param {string} projectId
   * @param {number} issueNumber
   * @returns {Promise<any|null>}
   */
  async findItemByIssueNumber(projectId, issueNumber) {
    throw new Error(`Method not implemented. ${projectId} ${issueNumber}`);
  }

  /**
   * Updates the status of an item.
   * @param {string} projectId
   * @param {string} itemId
   * @param {string} statusName
   * @returns {Promise<void>}
   */
  async updateItemStatus(projectId, itemId, statusName) {
    throw new Error(`Method not implemented. ${projectId} ${itemId} ${statusName}`);
  }

  /**
   * Updates a custom field of an item.
   * @param {string} projectId
   * @param {string} itemId
   * @param {string} fieldName
   * @param {string} value
   * @returns {Promise<void>}
   */
  async updateCustomField(projectId, itemId, fieldName, value) {
    throw new Error(`Method not implemented. ${projectId} ${itemId} ${fieldName} ${value}`);
  }
}
