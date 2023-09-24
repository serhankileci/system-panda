Feature: Create an item for Collection 
    As a SystemPanda user,
    I press the add/create button, which will open a model with a form
    So that I can enter values of the Collection item and submit to create it

Scenario: On collection table screen,
    Given when the collection table screen is loaded
    When I click on add/create button, enter values of the collection, and submit the creation
    Then I should see that collection item added into the table