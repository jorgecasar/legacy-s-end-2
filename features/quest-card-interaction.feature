Feature: Quest Card Interaction
  As a Player
  I want to interact with quest cards
  So that I can select available missions or see which ones are locked

  Scenario: Attempting to select a locked quest
    Given a quest card is displayed with status "Locked"
    When I click on the quest card
    Then the selection should be blocked
    And a warning should be displayed

  Scenario: Selecting an available quest
    Given a quest card is displayed with status "Available"
    When I click on the quest card
    Then the quest should be selected
    And the quest details should be emitted in the event
