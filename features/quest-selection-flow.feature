Feature: Quest Selection Flow
  As a Player
  I want to select a mission from the Quest Hub
  So that I can see it as my active mission

  Scenario: Selecting an available quest sets it as active
    Given I am in the Quest Hub
    And there is no active mission
    When I select the mission "Story: Awakening"
    Then the "Story: Awakening" mission should be displayed in the Active Mission section
