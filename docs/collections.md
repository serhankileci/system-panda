# **Collections**
Collections represent database tables. In your SystemPanda app, a collection can be defined as an object with an interface similar to and is at run-time mapped into a Prisma model.

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
