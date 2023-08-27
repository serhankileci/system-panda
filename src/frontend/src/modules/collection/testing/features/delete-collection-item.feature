Feature: Delete a Collection Item on Table 
    As a SystemPanda user,
    I click the delete button on a collection item
    Because I need to remove the item permanently

Scenario: After collection table is populated
    Given I see my target collection item
    When I click on delete button on same row as the target collection item
    Then I should see that collection item removed from the table