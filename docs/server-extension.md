# **Server Extension**
Extend the internal Express.js server to add new routes, middlewares, and business logic using the app argument. The internal server is packed with common middleware packages that are enabled by default that can be configured. You also have access to the CMS context object.

Keep in mind that your routes will be matched after any existing internal route and collection route.

## **Example**
```js
{
    config: {
        port: Number(process.env.PORT),
        extendServer: async (app, ctx) => {
            app.get("/foo", (req, res) => res.send("bar"));
        },
        defaultMiddlewares: {
            // configure the "cors" middleware
            cors: {
                origin: "*"
            },
            // turn off the "morgan" middleware
            morgan: false
        }
    }
}
```
