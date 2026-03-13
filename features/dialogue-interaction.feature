Feature: Dialogue Interaction
  As a player
  I want to interact with NPCs through a dialogue overlay
  So that I can progress in the story

  Background:
    Given the game is initialized with the "Alarion Awakening" level
    And the "Alarion Intro" dialogue is active

  Scenario: Progressing through dialogue
    Then the dialogue overlay should show "Elder Alarion" as the speaker
    And the text should be "Wake up, hero. The world is ending."
    When I click the "Next" button in the dialogue overlay
    Then the text should change to "The void is consuming everything. You are our last hope."
    When I click the "Next" button in the dialogue overlay
    Then the dialogue overlay should disappear

  Scenario: Hero is rendered at the correct position
    Then the hero should be visible in the viewport
    And the hero should be at position (2, 2)
