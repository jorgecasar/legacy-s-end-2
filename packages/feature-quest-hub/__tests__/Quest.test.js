import { Quest } from "../src/domain/Quest.js";

describe("Quest", () => {
  it("should create a Quest instance with correct properties", () => {
    const quest = new Quest("123", "Test Quest", "This is a test quest", "active");

    expect(quest.id).toBe("123");
    expect(quest.title).toBe("Test Quest");
    expect(quest.description).toBe("This is a test quest");
    expect(quest.status).toBe("active");
  });
});
