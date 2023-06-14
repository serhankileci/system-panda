# **Server Extension**
Extend the internal Express.js server to add new routes, middlewares, etc. using the Express app object and the context object args for the extendServer function. The internal server is packed with common middleware packages that are enabled by default, that can be configured.

```js
SystemPanda({
	// collections...

	config: {
		port: process.env.PORT,
		extendServer: async (app, ctx) => {
			// write Express code here using the "app" arg.
		}
	}
});
```
