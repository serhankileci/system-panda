Feature: Logging in

Scenario: Entering the correct password
    Given the dashboard tell its Presenter to load data on mount.
    When I enter my admin password correctly
    Then I should be authorized and granted access
    