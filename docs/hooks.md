# Hooks
Hooks are functions to validate and modify input and cause side-effects throughout the lifecycle of CRUD operations.

Before/after hooks don't need to return data, but validateInput and modifyInput must return the inputData argument after either validating or modifying it. You can throw a new Error during either modifyInput or validateInput to cancel the operation.

Example:
```js
SystemPanda({
	content: {
		albums: {
			hooks: {
				beforeOperation: [
					({ context, operation, existingData, inputData }) => {
						// do something. here you have access to input data if there is any input
						// but not allowed to modify it
					},
				],
				modifyInput: [
					({context, inputData, operation, existingData}) => {
						// modify inputData, reference existingData if it exists
						// condition the operation arg.

						return inputData;
					}
				],
				validateInput: [
					({ context, inputData, operation, existingData}) => {
						if (!/someRegex/.test(inputData.foobar)) {
							throw new Error("Some error here!");

							// or an object (must have a message property so that the admin UI can display the message)
							// throw new Error({ message: "some error message!", status: 500, foo: "bar" });
						}
					},
				],
				afterOperation: [
					({ context, operation, existingData, inputData }) => {
						// do something
					},
				],
			}
		}
	}
	// other properties...
});
```
