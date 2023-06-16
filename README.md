![](https://img.shields.io/npm/v/system-panda?style=for-the-badge)
![](https://img.shields.io/npm/dt/system-panda?style=for-the-badge)
![](https://img.shields.io/github/last-commit/serhankileci/system-panda?style=for-the-badge)
![](https://img.shields.io/github/license/serhankileci/system-panda?style=for-the-badge)

# **SystemPanda**
Headless CMS for Node.js, written in TypeScript.

A hobby project that could turn into a production-grade Headless CMS, and will likely go through major changes until it's the way I originally planned it, which is a highly opinionated, architecturally rigid, yet deeply customizable system that aims to solve the limitations of Headless CMS' that hold developers back.

## **Features**
- ### [**Hooks**](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md)
	Lifecycle hooks can be used for CRUD operations, including causing side-effects, input validation and modification, etc.
- ### [**Plugins**](https://github.com/serhankileci/system-panda/blob/main/docs/plugins.md)
	Reusable snippets of bundled code that can be installed directly to your app.
- ### [**Webhooks**](https://github.com/serhankileci/system-panda/blob/main/docs/webhooks.md)
	Trigger API requests with data on specific hooks.
- ### [**Prisma ORM**](https://github.com/serhankileci/system-panda/blob/main/docs/prisma-orm.md)
	Database layer with full access to Prisma throughout the lifecycle of your app.
- ### [**Collections**](https://github.com/serhankileci/system-panda/blob/main/docs/collections.md)
	Define your collections as objects with an API similar to a Prisma model, and they will be mapped into Prisma data models.
- ### [**REST API**](https://github.com/serhankileci/system-panda/blob/main/docs/rest-api.md)
	Generated routes for your collections that serve data.
- ### [**Server Extension**](https://github.com/serhankileci/system-panda/blob/main/docs/server-extension.md)
	SystemPanda uses Express.js under the hood, enables commonly used middlewares by default, and lets you extend the internal server with your own routes and business logic.

## **To-do**
- Dashboard (UI panel to handle CRUD operations and manage plugins)
- Extended Prisma ORM support
	- Type-safety for CRUD hook args (existingData and inputData should reflect the relevant Prisma model)
- Authentication
- Access Control
- Standard library of plugins
- Plugin system revisited
- Custom Hooks/Events
- Version Control support for rollbacks, etc.
- Task scheduling (at specified times/conditions)
- i18n (1. default translations for the core application, 2. allowing custom translations for collections)

## **Example**
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
