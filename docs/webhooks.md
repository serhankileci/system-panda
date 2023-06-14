# **Webhooks**
Webhooks are HTTP requests that trigger after a specified operation, for example, you have an Albums collection and whenever a new album is inserted or an existing one is updated, you want to receive a notification or relay it to an internal or external API for additional processing.

Webhooks can be global (they run for every collection), or collection-specific.

While webhooks are generally POST requests and send data in the request body, you can also opt to send a GET request with the data to be sent via the query string. A webhook payload looks something like this:

```js
{
	event: "<specific CRUD operation>",
	collection: '<collection name>',
	data: '<whatever relevant data was created/read/updated/deleted>',
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
						method: "POST",
						on: ["create", "update"],
						headers: {
							authorization: "foobar"
						}
					},
					{
						name: "Viewed Album",
						api: process.env.HOST + "/some-internal-route",
						method: "GET",
						on: ["read"]
					},
				]
			}
		},
		webhooks: [
			{
				name: "Any Operation",
				api: process.env.HOST + "/some-internal-route",
				method: "POST",
				on: ["create", "read", "update", "delete"]
			},
		]
	},
	config: {
		port: process.env.PORT,
		extendServer: async (app, ctx) => {
			app
				.get("/some-internal-route", (req, res, next) => {
					console.log(req.query);
					res.sendStatus(200);
				})
				.post("/some-internal-route", (req, res, next) => {
					console.log(req.body);
					res.sendStatus(200);
				});
		}
	}
});
```
