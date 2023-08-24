Feature: Collection Data Population on Table
    As a SystemPanda user,
    I click the edit button on a collection item
    Because I need to update its value(s)

Scenario: After collection table is populated
    Given I see my target collection item
    When I click on an item row's edit button, change at least one value, and submit the change
    Then I should that the collection item's value(s) has my changes