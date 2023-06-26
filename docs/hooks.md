# **Hooks**
Hooks are arrays of functions to cause side-effects, validate, and modify input throughout the lifecycle of CRUD operations.

- **beforeOperation** and **afterOperation** hooks don't need to return data.
- **modifyInput** and **validateInput** must return the *inputData* argument after either validating or modifying it.
- You can throw an error in any of the hooks until the **afterOperation** hook to cancel the current operation.

## **Order of execution**
1. beforeOperation
2. modifyInput
3. validateInput
4. afterOperation

## **Example**
```ts
{
	hooks: {
		beforeOperation: [
			({ context, operation, existingData, inputData }) => {
				// cause side-effect
			},
		],
		modifyInput: [
			({context, inputData, operation, existingData}) => {
				inputData.foo = "bar";

				return inputData;
			}
		],
		validateInput: [
			({ context, inputData, operation, existingData}) => {
				if (!someRegex.test(inputData.baz)) {
					throw new Error("Validation error!");
				}

				return inputData;
			},
		],
		afterOperation: [
			({ context, operation, existingData, inputData }) => {
				// cause side-effect
			},
		],
	}
}
```
