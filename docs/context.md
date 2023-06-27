# **Context**
The context object is the heart of your SystemPanda app, here you have access to your collections, Prisma ORM methods, the Express.js request/response objects, utility variables, a custom object to store data in and make use of later in the lifecycle of your app, etc. The context object is available throughout your app; on hooks, the extended server, plugins, etc.

## **Interface**
```ts
{
    prisma,
    collections,
    express,
    sessionData,
    bools,
    util,
    customVars
}
```
