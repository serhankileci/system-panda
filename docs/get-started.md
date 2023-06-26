# **Get Started**
***Not up-to-date yet, will be updated soon.***

Here is a basic, example application that uses most of what SystemPanda has to offer.

```ts
import SystemPanda from "system-panda";

SystemPanda({
    content: {
        // define your data models
		// 2 example collections with one-to-many relation
        collections: {
			song: {
				fields: {
					title: {
						type: "String",
						required: true,
					},
					relation_album: {
						type: "relation",
						ref: "album.id",
						many: false,
					},
				},
			},
            album: {
				id: {
					name: "id",
					type: "uuid",
				},

				// map custom name for collection
                slug: "records",
				fields: {
					relation_song: {
						type: "relation",
						ref: "song",
						many: true,
					},
                    name: {
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
                    collection: 'album',
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
