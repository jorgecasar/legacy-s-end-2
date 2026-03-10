/**
 * Mock implementation of Project Manager for testing.
 */
export class MockProjectManager {
  constructor() {
    this.items = [];
  }

  async getProjectItems(_projectId, _owner) {
    return this.items;
  }

  async addItemToProject(_projectId, contentId, _owner) {
    const newItem = { id: `mock-item-${contentId}`, contentId, fields: {} };
    this.items.push(newItem);
    return newItem.id;
  }

  async findItemByIssueNumber(_projectId, issueNumber, _owner) {
    return this.items.find((i) => i.number === issueNumber) || null;
  }

  async updateItemStatus(_projectId, itemId, statusName, _owner) {
    const item = this.items.find((i) => i.id === itemId);
    if (item) item.fields.Status = statusName;
  }

  async updateCustomField(_projectId, itemId, fieldName, value, _owner) {
    const item = this.items.find((i) => i.id === itemId);
    if (item) item.fields[fieldName] = value;
  }
}
