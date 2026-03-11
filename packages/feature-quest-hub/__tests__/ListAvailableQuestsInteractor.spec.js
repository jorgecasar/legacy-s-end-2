import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { ListAvailableQuestsInteractor } from "../src/use-cases/ListAvailableQuestsInteractor.js";
import { Quest } from "../src/domain/entities/Quest.js";

describe("Use Case: ListAvailableQuestsInteractor", () => {
  it("should return all quests from repository", async () => {
    // Arrange
    const mockQuests = [
      Quest.create({ id: "q1", title: "Quest 1" }).value,
      Quest.create({ id: "q2", title: "Quest 2" }).value,
    ];

    const mockRepository = {
      getAll: mock.fn(async () => ({ success: true, value: mockQuests })),
    };

    const useCase = new ListAvailableQuestsInteractor(mockRepository);

    // Act
    const result = await useCase.execute();

    // Assert
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.value, mockQuests);
    assert.strictEqual(mockRepository.getAll.mock.callCount(), 1);
  });

  it("should return error if repository fails", async () => {
    // Arrange
    const errorMessage = "Repository error";
    const mockRepository = {
      getAll: mock.fn(async () => ({ success: false, error: errorMessage })),
    };

    const useCase = new ListAvailableQuestsInteractor(mockRepository);

    // Act
    const result = await useCase.execute();

    // Assert
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, errorMessage);
  });

  it("should handle unexpected repository exceptions", async () => {
    // Arrange
    const mockRepository = {
      getAll: mock.fn(async () => {
        throw new Error("Unexpected crash");
      }),
    };

    const useCase = new ListAvailableQuestsInteractor(mockRepository);

    // Act
    const result = await useCase.execute();

    // Assert
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Error listing available quests: Unexpected crash/);
  });
});
