# Prisma ORM
SystemPanda uses Prisma as its database layer, letting you define your data as a JavaScript object with an interface similar to a Prisma schema, that is then mapped to a Prisma data model.

```js
SystemPanda({
	content: {
		collections: {
			albums: {
				fields: {
					year: {
						type: "number",
						defaultValue: 1999
					},
					title: {
						type: "text",
						required: true,
						unique: true,
						index: true
					},
				},
			}
		}
	},
	// more props...
});
```

You can execute Prisma operations yourself as mentioned in [CLI](https://github.com/serhankileci/system-panda/blob/main/docs/cli.md).
