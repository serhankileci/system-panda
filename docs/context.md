# **Context**
The context object is the heart of your Content Kitty app, here you have access to your tables, Prisma ORM methods, the Express.js request/response objects, utility variables, a custom object to store data in and make use of later in the lifecycle of your app, etc. The context object is available throughout your app; on hooks, the extended server, plugins, etc.

## **Interface**
```ts
{
    prisma,
    tables,
    express,
    sessionData,
    util,
    custom
}
```
