![](https://img.shields.io/npm/v/system-panda?style=for-the-badge)
![](https://img.shields.io/npm/dt/system-panda?style=for-the-badge)
![](https://img.shields.io/github/last-commit/serhankileci/system-panda?style=for-the-badge)
![](https://img.shields.io/github/license/serhankileci/system-panda?style=for-the-badge)

# **SystemPanda** 🐼
Headless CMS for Node.js, written in TypeScript.

## **Installation**
```
npm install system-panda
```

Check out the [**example app**](https://github.com/serhankileci/system-panda/blob/main/docs/get-started.md).

## **Features**
- ### [**Hooks**](https://github.com/serhankileci/system-panda/blob/main/docs/hooks.md)
	Lifecycle hooks for CRUD operations, such as causing side-effects, and validating and modifying input.
- ### [**Plugins**](https://github.com/serhankileci/system-panda/blob/main/docs/plugins.md)
	Reusable snippets of code that can be installed directly to your app.
- ### [**Webhooks**](https://github.com/serhankileci/system-panda/blob/main/docs/webhooks.md)
	Trigger API requests with data on specific hooks/operations.
- ### [**Collections**](https://github.com/serhankileci/system-panda/blob/main/docs/collections.md)
	With Prisma ORM as the database layer, define your data as objects that are mapped to Prisma schema models.
- ### [**REST API**](https://github.com/serhankileci/system-panda/blob/main/docs/rest-api.md)
	Generated REST API for your collections that serve data.
- ### [**Server Extension**](https://github.com/serhankileci/system-panda/blob/main/docs/server-extension.md)
	Extend the internal Express.js server with custom routes, middlewares, and business logic.
- ### [**User Management**](https://github.com/serhankileci/system-panda/blob/main/docs/user-management.md)
	Authentication and Access Control.

## **Working On**
- Content media support
- Standard library of plugins
- Revisit plugin system (routes for uploading plugins to remote repository, etc.)
- Custom Hooks/Events
- Version Control (for rollbacks, etc.)
- Task scheduling (at specified times/conditions)
- i18n (default translations for the core app and allowing custom translations for collections)
