# **Webhooks**
Webhooks are HTTP requests that trigger after a specified operation, for example, you have an Albums collection and whenever a new album is inserted or an existing one is updated, you want to receive a notification or relay it to an internal or external API for additional processing. Webhooks can be global (they run for every collection), or collection-specific. Webhooks are POST requests and send data in the request body. A webhook payload looks something like this:

```js
{
	event: "<specific CRUD operation>",
	collection: '<collection name>',
	data: {
		before<Operation>: '<whatever relevant data was created/read/updated/deleted>',
		after<Operation>: '<whatever relevant data was created/read/updated/deleted>',
	}
	timestamp: '<ISO 8601 string>'
}
```

### **Example:**

```js
SystemPanda({
	content: {
		collections: {
			albums: {
				webhooks: [
					{
						name: "New/Updated Album",
						api: String(process.env.SOME_EXTERNAL_API),
						on: ["create", "update"],
						headers: {
							authorization: "foobar"
						}
					},
					{
						name: "Viewed Album",
						api: process.env.HOST + "/some-internal-route",
						on: ["read"]
					},
				]
			}
		},
		webhooks: [
			{
				name: "Any Operation",
				api: process.env.HOST + "/some-internal-route",
				on: ["create", "read", "update", "delete"]
			},
		]
	},
	config: {
		port: process.env.PORT,
		extendServer: async (app, ctx) => {
			app
				.post("/some-internal-route", (req, res, next) => {
					console.log(req.body);
					res.sendStatus(200);
				});
		}
	}
});
```
