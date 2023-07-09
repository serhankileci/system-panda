# **Hooks**
Hooks are arrays of functions to cause side-effects, validate, and modify input throughout the lifecycle of CRUD operations.

- **beforeOperation** needs to return a boolean to indicate if the operation should be allowed.
- **modifyInput** and **validateInput** must return the *inputData* argument after either modifying/validating it.
**afterOperation** hooks don't need to return data.

Tip: You can throw an error on any hook except an **afterOperation** hook to cancel the current operation.

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

                const userType = ctx.sessionData?.userType;
                const isUserAndReadOp = userType === "user" && operation === "read";
                consts isAdmin = userType === "admin";

                return isUserAndReadOp || isAdmin;
            },
        ],
        modifyInput: [
            ({ context, operation, existingData, inputData }) => {
                inputData.foo = "bar";

                return inputData;
            }
        ],
        validateInput: [
            ({ context, operation, existingData, inputData }) => {
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
