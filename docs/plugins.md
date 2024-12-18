# **Plugins**

for devs: Publish your plugin to NPM, paste the NPM package link to contentkittycms.com plugins repository or via your own Content Kitty admin panel plugins page.

for me: to keep track of what's installed, used or installed but not used, write to a json file like ck-plugins.json

Plugins are reusable snippets of code stored in your database, imported and evaluated at runtime, and their default export function is executed. At this stage of the application, public plugins are **NOT** vetted, use them at your own risk.

## **How to install**

Plugins are served through "/local" (plugins installed in your app) and "/remote" (plugins in the remote plugin repository) paths.

1. Head over to "/plugins/remote" to fetch a list of available, remote plugins ("/plugins/local" for installed).
2. Install/uninstall/enable/disable by name:

- "/plugins/remote/Example" for plugin info,
- "/plugins/remote/Example/install" to install,
- "/plugins/local/Example/(uninstall|enable|disable)"

Then the plugin will be loaded into your app, no reload necessary.

## **How to create**

1. Create a function with a [**context**](https://github.com/serhankileci/content-kitty/blob/main/docs/context.md) parameter (you can import the specific type-definition from "content-kitty").
2. Create a condition to set on which hook your plugin should be executed.
3. Handle your custom business logic. You may load the context.custom object with a value, or simply cause some side-effects.
4. Export the function as **default**.

## **How to publish**

1. Bundle your plugin application (using a bundler such as "esbuild").
2. Make a POST request with JSON data to Content Kitty's AWS Lambda service:

```bash
https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins
```

with the following JSON schema:

```js
{
    title: "My Plugin",
    author: "John Doe",
    description: "Demonstrates the possible functionalities of a plugin.",
    version: "0.1.0",
    sourceCode: "var data = \"some data\";\nconsole.log(\"I am executed once at build-time!\");\nvar bundle_default = (context) => {\n  if (context.util.currentHook === \"afterOperation\") {\n    console.log(\"I am executed at run-time, for every afterOperation!\");\n    if (!context.custom.testing) {\n      console.log(\"This should appear once.\");\n      context.custom.testing = data;\n    }\n  }\n  console.log(\"This should log for every operation.\");\n};\nexport {\n  bundle_default as default\n};"
}
```

The version property must be valid SemVer, and the sourceCode property must be a bundle string.

## **Example (pre-bundle)**

```ts
import { Context } from "content-kitty";
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
        if (!context.custom.foobar) {
            console.log("This should appear once.");

            // loading the custom object with important values!
            context.custom.foobar = foobar;
        }

        // by not conditioning this part, someFile will be called on all afterOperation hooks
        someFile();
    }

    console.log("This should log for every operation.");

    // by not limiting this logic, anotherFile will be called for EVERY hook
    anotherFile();
};
```

**Keep in mind** that some of the context object data will change throughout the lifecycle of a CRUD operation. Different hooks will have different data access. Refer to [Hooks](https://github.com/serhankileci/content-kitty/blob/main/docs/hooks.md); similarly, with a plugin that might be executed in an afterOperation hook to, for example, alter the context object, you will only see the up-to-date context object in operations during or after such a hook. Take a look at this example while keeping the plugin example above in mind. Let's say that plugin is active, and a CRUD operation has just occurred.

```ts
{
    hooks: {
        beforeOperation: [
            ({ ctx, operation, existingData, inputData }) => {
                console.log(ctx.custom.foobar); // undefined
            },
        ],
        afterOperation: [
            ({ ctx, operation, existingData, inputData }) => {
                console.log(ctx.custom.foobar); // some data
            },
        ],
    }
}
```
