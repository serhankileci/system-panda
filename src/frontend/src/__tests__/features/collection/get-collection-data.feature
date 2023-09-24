Feature: Collection Data Population on Table
    As a SystemPanda user,
    I click on my target collection (name)
    So that I can view that collection's data on the table.

Scenario: After clicking on the collection link from dashboard's sidebar, populate table with that collection's data
    Given I am on the Overview screen
    When I click on the collection
    Then I should see the collection table populated with its relevant fields and data