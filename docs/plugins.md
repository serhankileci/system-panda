# **Plugins**
Plugins are reusable snippets of code stored in your database, imported and evaluated at runtime, and their default export function is executed. Until the UI is built, the following operations have to be done manually. At this stage of the application, public plugins are **NOT** vetted, use them at your own risk.

## **How to install**
1. Head over to your app's "/plugins" route to fetch a list of public plugins.
2. Pick one by name, then:
	- "/plugins/foobar" for plugin info
	- "/plugins/foobar/install (or uninstall)
	- After installing, "/plugins/foobar/enable" (or disable)

Then the plugin will be loaded into your app, no reload necessary.

## **How to create**
1. Create a function with a [**context**](https://github.com/serhankileci/system-panda/blob/main/docs/context.md) parameter (you can import the specific type-definition from "system-panda").
2. Create a condition to set on which hook your plugin should be executed.
3. Handle your custom business logic. You may load the context.customVars object with a value, or simply cause some side-effects.
4. Export the function as **default**.

## **How to publish**
1. Bundle your plugin application (using a bundler such as "esbuild").
2. Make a POST request with JSON data to SystemPanda's AWS Lambda service:
```
https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins
```
with the following JSON schema:
```js
{
    title: "My Plugin",
    author: "John Doe",
    description: "Demonstrates the possible functionalities of a plugin.",
    version: "0.1.0",
    sourceCode: "var data = \"some data\";\nconsole.log(\"I am executed once at build-time!\");\nvar bundle_default = (context) => {\n  if (context.util.currentHook === \"afterOperation\") {\n    console.log(\"I am executed at run-time, for every afterOperation!\");\n    if (!context.customVars.testing) {\n      console.log(\"This should appear once.\");\n      context.customVars.testing = data;\n    }\n  }\n  console.log(\"This should log for every operation.\");\n};\nexport {\n  bundle_default as default\n};"
}
```
The version property must be valid SemVer, and the sourceCode property must be a bundle string.

## **Example (pre-bundle)**
```ts
import { Context } from "system-panda";
import someFile from "./someFile.js";
import anotherFile from "./anotherFile.js";
import somePackage from "some-package";

const foobar = somePackage()
              .configure()
              .connect()
              .getData();

console.log("I am executed once at build-time!");

export default context => {
    // conditioning the plugin to only run during the afterOperation hook
    if (context.util.currentHook === "afterOperation") {
        console.log("I am executed at run-time, on every afterOperation hook!");

        // a way to limit this code-block to run only once
        if (!context.customVars.foobar) {
            console.log("This should appear once.");

            // loading the customVars object with important values!
            context.customVars.foobar = foobar;
        }

        // by not conditioning this part, someFile will be called on all afterOperation hooks
        someFile();
    }

    console.log("This should log for every operation.");

    // by not limiting this logic, anotherFile will be called for EVERY hook
    anotherFile();
};
```

**Keep in mind** that some of the context object data will change throughout the lifecycle of a CRUD operation. Different hooks will have different data access. Refer to [Hooks](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md); similarly, with a plugin that might be executed in an afterOperation hook to, for example, alter the context object, you will only see the up-to-date context object in operations during or after such a hook. Take a look at this example while keeping the plugin example above in mind. Let's say that plugin is active, and a CRUD operation has just occurred.

```ts
{
    hooks: {
        beforeOperation: [
            ({ ctx, operation, existingData, inputData }) => {
                console.log(ctx.customVars.foobar); // undefined
            },
        ],
        afterOperation: [
            ({ ctx, operation, existingData, inputData }) => {
                console.log(ctx.customVars.foobar); // some data
            },
        ],
    }
}
```
