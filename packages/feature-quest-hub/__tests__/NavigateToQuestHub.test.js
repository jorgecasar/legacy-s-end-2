import NavigateToQuestHub from "../src/use-cases/NavigateToQuestHub";

describe("NavigateToQuestHub", () => {
  it("should execute the use case and log a message", () => {
    const navigateToQuestHub = new NavigateToQuestHub();
    const consoleSpy = jest.spyOn(console, "log");

    navigateToQuestHub.execute();

    expect(consoleSpy).toHaveBeenCalledWith("Navigating to Quest Hub");

    consoleSpy.mockRestore();
  });
});
