# **Get Started**
Here is a basic, example application that uses most of what SystemPanda has to offer.

```ts
import SystemPanda from "system-panda";
import "dotenv/config";

SystemPanda({
    content: {
        // define your data models
        collections: {
            student: {
                id: {
                    name: "id",
                    type: "uuid",
                },
                fields: {
                    name: {
                        type: "String",
                    },
                    relation_classroom: {
                        type: "relation",
                        many: true,
                        ref: "classroom.id",
                    },
                },
            },
            classroom: {
                hooks: {
                    beforeOperation: [],
                    modifyInput: [],
                    validateInput: [],
                    afterOperation: [],
                },
                fields: {
                    name: {
                        type: "String",
                        required: true,
                    },
                    relation_student: {
                        type: "relation",
                        many: true,
                        ref: "student.id",
                    },
                },
            },
            song: {
                fields: {
                    title: {
                        type: "String",
                        required: true,
                    },
                    relation_album: {
                        type: "relation",
                        ref: "album.relation_song",
                        many: false,
                    },
                },
            },
            album: {
                slug: "record",
                fields: {
                    relation_song: {
                        type: "relation",
                        ref: "song.relation_album",
                        many: true,
                    },
                    year: {
                        type: "number",
                        subtype: "Int",
                        required: true,
                    },
                    title: {
                        type: "String",
                        required: true,
                        unique: true,
                        index: true,
                    },
                    dateCreated: {
                        type: "DateTime",
                        defaultValue: {
                            kind: "now",
                        },
                    },
                    mJson: {
                        type: "Json",
                        defaultValue: JSON.stringify({ hello: "world" }),
                    },
                },
                webhooks: [
                    {
                        api: localhost + "/webhook",
                        name: "All Operations",

                        // pick which operations should trigger the webhook
                        onOperation: ["create"],
                    },
                ],
                hooks: {
                    beforeOperation: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            // cause side-effect

                            const user_type = ctx.sessionData?.user_type;
                            const isUserAndReadOp = user_type === "user" && operation === "read";
                            const isAdmin = user_type === "admin";

                            return isUserAndReadOp || isAdmin;
                        },
                    ],
                    modifyInput: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            // modify request body
                            inputData.title = formatAlbumTitle(input.title);

                            return inputData;
                        },
                    ],
                    validateInput: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            // some kind of validation
                            if (!/\s/.test(inputData)) {
                                throw "Validation error!";
                            }

                            return inputData;
                        },
                    ],
                    afterOperation: [
                        async ({ ctx, operation, existingData, inputData }) => {
                            // cause side-effect
                        },
                    ],
                },
            },
        },
    },
    settings: {
        port: Number(process.env.PORT),
        db: {
            URI: process.env.DATABASE_URL!,
        },
        isAccessAllowed: ctx => {
            // allow access if authenticated
            return !!ctx.sessionData;
        },
        extendServer: async (app, ctx) => {
            // add custom server logic

            app.post("/webhook", (req, res, next) => {
                /*
                when, for example, a POST request is received with the following request body:
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

        authSession: {
            options: {
                secret: String(process.env.SECRET),
            },
            initFirstAuth: {
                email: "admin@system-panda.com",
                password: "1234",
            },
        },

        /*
            popular middlewares enabled by default
            configure their options or turn them off
        */
        defaultMiddlewares: {
            morgan: false,
        },
    },
});
```
