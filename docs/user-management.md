# **User Management**
## **Authentication**
SystemPanda uses cookie authentication. When you login, a session is created, its ID is set as a cookie, and you have access to pages that require authentication by default. You also have access to data related to your session via the context object which you can specify which fields should be included.
```ts
{
    authSession: {
        initFirstAuth: {
            email: "admin@system-panda.com",
            password: "1234",
        },

        // default: "*"
        sessionData: ["id", "email"],
    }
}
```

## **Access Control**
Inside a collection's **beforeOperation** hooks (refer to [**Hooks**](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md)), you can return a boolean to allow or deny access to an operation. Here's a role-based permission and operation-specific example with conditions:
```ts
{
    hooks: {
        beforeOperation: [
            ({ context, operation, existingData, inputData }) => {
                // cause side-effect

                const user_type = ctx.sessionData?.user_type;
                const isUserAndReadOp = user_type === "user" && operation === "read";
                const isAdmin = user_type === "admin";

                return isUserAndReadOp || isAdmin;
            },
        ]
    }
}
```
