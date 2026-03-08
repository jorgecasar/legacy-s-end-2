Feature: Application Sanity Check
  As a developer
  I want to know the testing framework is working
  So that I can write more complex BDD scenarios

  Scenario: Cucumber setup is functional
    Given the application is configured
    When I run the test suite
    Then the setup should pass validation
