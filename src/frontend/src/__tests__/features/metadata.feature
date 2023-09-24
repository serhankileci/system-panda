Feature: Loading MetaData

Scenario: Arriving on Dashboard screen
    Given the dashboard tell its Presenter to load data on mount.
    Then I should have a list of plugins and collections.