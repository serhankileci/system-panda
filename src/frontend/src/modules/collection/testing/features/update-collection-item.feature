Feature: Updating an Item on Collection Table 
    As a SystemPanda user,
    I click on a cell which shows the value of a collection item's field
    Because I need to update its value

Scenario: After collection table is populated
    Given I see my target collection item
    When I click on an item's value in the table cell, change at the value, and submit the change
    Then I should that the collection item's value has my change