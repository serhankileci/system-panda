# **Collections**
SystemPanda uses Prisma as its database layer, letting you define your data as objects with an interface similar to a Prisma schema, that is then mapped to Prisma schema models.

Other *content* properties such as [**Webhooks**](https://github.com/serhankileci/system-panda/blob/main/docs/webhooks.md) and [**Hooks**](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md) were omitted from this example. Refer to their pages for more info.

You can also execute Prisma operations as mentioned in [**CLI**](https://github.com/serhankileci/system-panda/blob/main/docs/cli.md).

## **Example**
```ts
{
    content: {
        collections: {
            song: {
                fields: {
                    title: {
                        type: "String",
                        required: true,
                    },

                    // one-to-many relation with "album" collection
                    relation_album: {
                        type: "relation",
                        ref: "album.id",
                        many: false,
                    },
                },
            },
            album: {
                // specify ID type, auto-increment by default
                id: {
                    name: "id",
                    type: "uuid",
                },

                // map custom name for collection
                slug: "records",

                fields: {

                    // one-to-many relation with "song" collection
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
                }
            }
        }
    }
}
```
