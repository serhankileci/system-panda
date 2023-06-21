![](https://img.shields.io/npm/v/system-panda?style=for-the-badge)
![](https://img.shields.io/npm/dt/system-panda?style=for-the-badge)
![](https://img.shields.io/github/last-commit/serhankileci/system-panda?style=for-the-badge)
![](https://img.shields.io/github/license/serhankileci/system-panda?style=for-the-badge)

# **SystemPanda** 🐼
Headless CMS for Node.js, written in TypeScript.

A hobby project that could turn into a production-grade Headless CMS, and will likely go through major changes until it's the way I originally planned it, which is a highly opinionated, architecturally rigid, yet deeply customizable system that aims to solve the limitations of Headless CMS' that hold developers back.

## **Features**
- ### [**Hooks**](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md)
	Lifecycle hooks for CRUD operations, such as causing side-effects, and validating and modifying input.
- ### [**Plugins**](https://github.com/serhankileci/system-panda/blob/main/docs/plugins.md)
	Reusable snippets of bundled code that can be installed directly to your app.
- ### [**Webhooks**](https://github.com/serhankileci/system-panda/blob/main/docs/webhooks.md)
	Trigger API requests with relevant data and metadata on specific hooks.
- ### [**Prisma ORM**](https://github.com/serhankileci/system-panda/blob/main/docs/prisma-orm.md)
	Database layer with full access to Prisma throughout the lifecycle of your app.
- ### [**Data Collections**](https://github.com/serhankileci/system-panda/blob/main/docs/collections.md)
	Define objects that represent your data that is then mapped to Prisma models.
- ### [**REST API**](https://github.com/serhankileci/system-panda/blob/main/docs/rest-api.md)
	Generated routes for your collections that serve data.
- ### [**Server Extension**](https://github.com/serhankileci/system-panda/blob/main/docs/server-extension.md)
	SystemPanda uses Express.js under the hood, enables commonly used middlewares by default, and lets you extend the internal server with your own routes and business logic.

## **To-do**
- Dashboard (UI panel to handle CRUD operations and manage plugins)
- File storage support
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

## **Installation**
```
npm install system-panda
```
You can also [download plugins](https://github.com/serhankileci/system-panda/blob/main/docs/plugins.md#how-to-install) for your app and SystemPanda will handle the installations. No configuration or import required.
## **Example App**
```ts
import SystemPanda from "system-panda";

SystemPanda({
    content: {
        // define your data models
        collections: {
            albums: {
                fields: {
                    title: {
                        type: "String",
                        required: true,
                        unique: true,
                        index: true,
                    },
                    year: {
                        type: "number",
                        kind: "Int",
                        required: true,
                    },
                    dateCreated: {
                        type: "DateTime",
                        defaultValue: {
                            kind: "now"
                        }
                    },
                    someJson: {
                        type: "Json",
                        defaultValue: JSON.stringify({ hello: "world" }),
                    },
                },
                webhooks: [
                    {
                        api: process.env.HOST + "/webhook",
                        name: "All Operations",

                        // pick which operations should trigger the webhook
                        onOperation: ["create", "read", "update", "delete"],
                    },
                ],
                hooks: {
                    beforeOperation: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            // cause side-effect
                        }
                    ],
                    modifyInput: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            inputData.foobar = inputData.barbaz;

                            return inputData;
                        },
                    ],
                    validateInput: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            if (!someRegex.test(inputData.foobar)) {
                                throw "Validation error!";
                            }

                            return inputData;
                        },
                    ],
                    afterOperation: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            // cause side-effect
                        }
                    ],
                },
            },
        },
    },
    config: {
        port: Number(process.env.PORT),
        db: {
            URI: process.env.DATABASE_URL!,
        },
        extendServer: async (app, ctx) => {
            // add custom server logic

            app.post("/webhook", (req, res, next) => {
                console.log(req.body);

                /*
                when, for example, a POST request is made:
                {
                    event: 'create',
                    collection: 'albums',
                    data: { beforeCreate: null, afterCreate: [ [Object] ] },
                    timestamp: '2023-06-16T20:26:31.485Z'
                }
                */

                res.sendStatus(200);
            });
        },

        // popular middlewares already enabled by default
        // configure their options or turn them off
        defaultMiddlewares: {
            morgan: false,
        },
    },
});
```
