Feature: Quest Selection Flow
  As a Player
  I want to select a mission from the Quest Hub
  So that I can see it as my active mission

  Scenario: Selecting an available quest starts the mission
    Given I am in the Quest Hub
    And there is no active mission
    When I select the mission "Story: Awakening"
    Then the game should transition to the game level view
