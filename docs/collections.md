# **Collections**
***Not up-to-date yet, will be updated soon.***

SystemPanda uses Prisma as its database layer, letting you define your data as objects with an interface similar to a Prisma schema, that is then mapped to Prisma schema models.

## Example
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

You can also execute Prisma operations as mentioned in [CLI](https://github.com/serhankileci/system-panda/blob/main/docs/cli.md).
