Feature: Quest Hub Navigation
  As a Player
  I want to navigate to the Quest Hub
  So that I can see available missions

  Scenario: Loading the Quest Hub interface
    Given I am on the home page
    When I navigate to the Quest Hub
    Then I should see the Quest Hub interface loaded correctly
