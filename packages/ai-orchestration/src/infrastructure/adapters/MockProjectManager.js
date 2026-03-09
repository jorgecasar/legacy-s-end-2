import { IProjectManager } from "../../domain/ports/IProjectManager.js";

/**
 * Mock implementation of Project Manager for simulation and testing.
 * @implements {IProjectManager}
 */
export class MockProjectManager extends IProjectManager {
  constructor() {
    super();
    this.memory = {
      items: [],
    };
  }

  async getProjectItems(projectId) {
    return this.memory.items;
  }

  async addItemToProject(projectId, contentId) {
    const newItem = {
      id: `mock-item-${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      fields: { Status: "Backlog" },
    };
    this.memory.items.push(newItem);
    return newItem.id;
  }

  async findItemByIssueNumber(projectId, issueNumber) {
    return this.memory.items.find((i) => i.number === issueNumber) || null;
  }

  async updateItemStatus(projectId, itemId, statusName) {
    const item = this.memory.items.find((i) => i.id === itemId);
    if (item) {
      item.fields.Status = statusName;
    }
  }

  async updateCustomField(projectId, itemId, fieldName, value) {
    const item = this.memory.items.find((i) => i.id === itemId);
    if (item) {
      item.fields[fieldName] = value;
    }
  }
}
