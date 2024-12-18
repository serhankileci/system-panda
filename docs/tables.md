# **Tables**

Among other things, Content Kitty is an abstraction over Prisma ORM, using Prisma as your application's database layer and letting you easily define your data in JavaScript data structures that are then mapped to Prisma schema models.

Other *content* properties such as [**Webhooks**](https://github.com/serhankileci/content-kitty/blob/main/docs/webhooks.md) and [**Hooks**](https://github.com/serhankileci/content-kitty/blob/main/docs/hooks.md) were omitted from this example. You can also manually execute Prisma operations as mentioned in [**CLI**](https://github.com/serhankileci/content-kitty/blob/main/docs/cli.md).

Content Kitty supports media content such as images, videos, and files. Examples here...

## **Example**

```ts
{
    content: {
        tables: {
            song: {
                fields: {
                    title: {
                        type: "String",
                        required: true,
                    },

                    // one-to-many relation with "album" table
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

                // map custom name for table
                slug: "records",

                fields: {

                    // one-to-many relation with "song" table
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
