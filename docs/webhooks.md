# **Webhooks**
Webhooks are HTTP requests that trigger after a specified operation. For example, you have an "Album" data collection, and whenever a new album is inserted or an existing one is updated, you want to relay it to an internal or external API for additional processing.

Webhooks can be global (running for every collection operation), or collection-specific. A POST request is made when the webhook is triggered, with data in the request body.

## **Example Webhook**
```ts
{
	webhooks: [
		{
			name: "New/Updated Data",

			// API to send request to
			api: process.env.SOME_EXTERNAL_API!,

			// list any CRUD operations
			onOperation: ["create", "read", "update", "delete"],

			// set up custom headers
			headers: { authorization: "foobar" },
		},
		{
			name: "Viewed Data",
			api: process.env.HOST + "/some-internal-route",
			onOperation: ["read"]
		},
	]
}
```

## **Example Request Body**
The data relayed to the specified API endpoint will have the following interface:
```ts
{
	// which CRUD operation occurred
	event: "update",

	// for which collection the CRUD operation happened
	collection: 'Album',

	/* what the data looked like before and after the CRUD operation,
	READ operations simply return the data that was read instead */
	data: {
		before: [{ title: "Thriller", year: 1982 }],
		after: [{ title: "Purple Rain", year: 1984 }]
	},

	// time of the operation in ISO 8601 format
	timestamp: '2023-06-16T20:26:31.485Z'
}
```
