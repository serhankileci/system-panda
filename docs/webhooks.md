# Webhooks
Webhooks are HTTP requests that trigger after a specified operation, for example, you have an Albums collection and whenever a new album is inserted or an existing one is updated, you want to receive a notification or relay it to an internal or external API for additional processing.

Example:
```js
SystemPanda({
	content: {
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
					name: "Viewed Product",
					api: process.env.HOST + "/some-internal-route",
					method: "GET",
					on: ["read"]
				},
			]
		}
	}
	// other properties...
});
```
