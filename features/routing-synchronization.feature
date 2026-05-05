Feature: Routing Synchronization
  As a Player
  I want the URL to reflect my current mission and chapter
  So that I can bookmark my progress and use the browser history

  Scenario: URL updates when entering a quest
    Given I am on the home page
    When I select the quest "Story: Awakening"
    Then the URL should match "/quest/q1/chapter/0"
    And the Game Level should be visible

  Scenario: URL updates when advancing chapters
    Given I am in the quest "q1" at chapter 0
    When I advance to chapter 1
    Then the URL should match "/quest/q1/chapter/1"

  Scenario: Direct access via URL
    When I navigate directly to "/quest/q1/chapter/1"
    Then the Game Level should be visible
    And the Game Store should be initialized at chapter 1
