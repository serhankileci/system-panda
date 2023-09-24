Feature: Logging out

Scenario: Wanting to log out
    Given I am already logged in
    When I click to log out
    Then I should no longer have access and have been unauthorized