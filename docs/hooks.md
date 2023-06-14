# **Hooks**
Hooks are functions to cause side-effects, validate, and modify input throughout the lifecycle of CRUD operations.

Before/after hooks don't need to return data, but validateInput and modifyInput must return the inputData argument after either validating or modifying it. You can throw an error in the first 3 hooks to cancel the current operation, the afterOperation hook is executed after the operation is completed.

## **Order of execution**
1. beforeOperation
2. modifyInput
3. validateInput
4. afterOperation

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
							// throw error here
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
