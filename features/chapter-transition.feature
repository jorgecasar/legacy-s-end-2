Feature: Chapter Transition
  As a Player
  I want to advance to the next chapter after reaching the exit zone
  So that I can continue the story

  Scenario: Advancing from Chapter 1 to Chapter 2
    Given the game is initialized with quest "Story: Awakening"
    And I am in "Chapter 1"
    When I move the hero to the exit zone at position (90, 90)
    Then the game should advance to "Chapter 2"
    And the hero should be at the new chapter's start position (10, 10)
    And the background should be "forest-cleansed"
