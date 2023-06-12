# SystemPanda
Headless CMS for Node.js, written in TypeScript.

A hobby project that could turn into a production-grade Headless CMS, and will likely go through major changes until it's the way I originally planned it, which is a highly opinionated, architecturally rigid, yet deeply customizable system that aims to solve the limitations of Headless CMS' that hold developers back.

## Features
- ### [Hooks](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md)
	- Lifecycle hooks can be used for CRUD operations, including causing side-effects, input validation and modification, etc.
- ### [Webhooks](https://github.com/serhankileci/system-panda/blob/main/docs/webhooks.md)
	- Trigger API requests with data on specific hooks.
- ### [Plugins](https://github.com/serhankileci/system-panda/blob/main/docs/plugins.md)
	- Reusable snippets of bundled code that can be installed directly to your app.
- ### [Prisma ORM](https://github.com/serhankileci/system-panda/blob/main/docs/prisma-orm.md)
	- Database layer. Define your collections as objects, and they will be mapped into Prisma data models.
- ### [REST API](https://github.com/serhankileci/system-panda/blob/main/docs/rest-api.md)
	- Generated routes for your collections.
- ### [extendServer](https://github.com/serhankileci/system-panda/blob/main/docs/extend-server.md)
	- SystemPanda uses Express.js under the hood, enables commonly used middlewares by default, and lets you extend the internal server with your own routes and business logic.

## Planned Features
- Dashboard (UI panel to handle CRUD operations and manage plugins)
- Authentication
- Access Control (permission-based)
- Standard library of plugins
- Plugin system revisited
- Custom Hooks/Events
- Version Control support for rollbacks, etc.
- Task scheduling (at specified times/conditions) (?)
- i18n for the dashboard (providing default translations for the core application, as well as allowing custom translations collections)

## Example

```ts
import SystemPanda from "system-panda";

SystemPanda({
	collections: {
		albums: {
			fields: {
				title: {
					type: "text",
					required: true,
					unique: true,
					index: true
				},
				year: {
					type: "datetime",
					defaultValue: new Date().toISOString()
				},
			},
			webhooks: [
				{
					api: process.env.SOME_EXTERNAL_API + "/webhook",
					method: "GET",
					name: "Example Webhook",
					onOperation: ["read"],
					headers: {
						authorization: "some token",
					},
				},
			],
			hooks: {
				beforeOperation: [
					async ({ ctx, operation, existingData, inputData }) => {
						// whatever
					},
				],
			},
		},
	},
	config: {
		port: 3005,
		extendServer: async (app, ctx) => {},
		db: {
			URI: process.env.DATABASE_URL!,
		}
	}
	// etc.
});
```
