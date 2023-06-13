# Plugins

Plugins are reusable snippets of code stored in your project's /plugins directory, imported and evaluated at runtime, and their default export function is executed on their specified hook for every collection route. They can be managed through the admin UI.

### How to install
1. Head over to your app's "/plugins" route to fetch a list of public plugins.
2. Pick one by its name, for example "foobar", and from then on you can:
	- "/plugins/foobar" to get plugin info.
	- "/plugins/foobar/install (or uninstall)
	- After installing, "/plugins/foobar/enable" (or disable)
3. Restart your app.

### How to create
1. Create a function with a **context** parameter, you may import the specific type definition from the system-panda package.
2. Create a condition to set on which hook your plugin should be executed.
3. Handle your custom business logic. You may load the context.customVars object with any value you choose, or simply cause side-effects.
4. Export the function as **default**.

### How to publish
1. Bundle your plugin application (using a bundler such as esbuild).
2. Make a POST request with JSON data to SystemPanda's AWS Lambda service (temporary, this will be done with a form in your UI panel in the next version):
```
https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins
```
with the following data schema:
```js
{
  title: "Example",
  author: "I'm Batman",
  description: "Demonstrates the possible functionalities of a plugin.",
  version: "1.0.0",
  sourceCode: "var data = \"some data\";\nconsole.log(\"I am executed once at build-time!\");\nvar bundle_default = (context) => {\n  if (context.util.currentHook === \"afterOperation\") {\n    console.log(\"I am executed at run-time, for every afterOperation!\");\n    if (!context.customVars.testing) {\n      console.log(\"This should appear once.\");\n      context.customVars.testing = data;\n    }\n  }\n  console.log(\"This should log for every operation.\");\n};\nexport {\n  bundle_default as default\n};"
}
```

Make sure the sourceCode property is bundled Node.js.

At this stage of the application, public plugins are **not** vetted, use them at your own risk.

You can use a plugin as a CRUD hook operation by conditioning the hook and accessing data input.

Example plugin before it's bundled:
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
	if (context.util.currentHook === "afterOperation") {
		console.log("I am executed at run-time, for every afterOperation!");

		// limiting this operation to run once (the first time this hook is triggered)
		if (!context.customVars.foobar) {
			console.log("This should appear once.");
			// loading the customVars object with important values!
			context.customVars.foobar = foobar;
		}

		// by not limiting this logic, someFile will be called on every afterOperation hook
		someFile();
	}

	console.log("This should log for every operation.");

	// by not limiting this logic, anotherFile will be called for every hook
	anotherFile();
};
```

**Keep in mind** that some of the context object data will change throughout the lifecycle of a CRUD operation. Different hooks will have different data access, refer to [Hooks](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md), similarly, with a plugin that might be executed in an afterOperation hook to, for example, alter the context object, you will only see the up-to-date context object in operations during or after such a hook. Take a look at this example while keeping the plugin example above in mind.

```ts
// ...
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
},
// ...
```
