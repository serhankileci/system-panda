# System Panda: Front End

## Work-in-Progress Architecture

### Gateway files
- Transient
- hold url for api
- always instantiated as a transient and will be stored on Repository files
- Related to infrastructure and IO such as push notifications, localStorage, HTTP/API
- HTTP gateway returns DTO, Repository will use that to set Programmer's Model

### Repository
- Singleton
- Holds our Programmer's Model. It's like the application state
- Authentication
- Uses gateways to get data

### Programmer's Model (pm, PM, Pm)
- How the software engineer interprets the business logic
- Will reside in Repository files
- (Re)mapping for clarity and shows better errors when backend code has been updated
- Stored in Repository
- Typically becomes our observable state

Example:
```ts
const pluginsPm = {
    plugins: {
        activePlugins: [],
        inactivePlugins: [],
    }
}
```

### ViewModel (viewModel, vm, Vm)
- Represents information that the View needs; what the Component only requires
- (Re)mapping for clarity that makes sense to the software engineer when they're rendering data on the UI

Example:
```ts
const pluginsVm = {
    plugins: {
        enabledPlugins: [],
        disabledPlugins: [],
    }
}
```

### Presenter
- Transient
- Can store state for toggling component views like a sidebar
- Holds validation messages

### Data Transfer Object (dto, Dto, DTO)

<br> 

## DX and Testing

### Data Stubs
- Our inbound data
- In tests, we mock the implementation of our gateways and stub data into it for TDD
- While working on the front end, we also set stubs in `Mock Service Worker`'s `handlers`. This helps us work on the UI without having to go to our starter test app to repeatedly test the changes; however, it's best to remember to test the build.

### Test Suites and Test Harnesses
- We create test suites to make sure there are no side effects between tests. So we reset our variables and states before each test and that should not be affecting other test suites. We would place this under each test group (typically `jest`'s `describe()`). We're using `jest-cucumber`, so we would put them inside `defineFeature` instead of describe(). This allows us to horizontally scale our tests.
- Next, we can transform our test suites into test harnesses to vertically scale our tests. This happens when we see duplicate code between test suites. So we should transform those into test harnesses.

### Million.js
- Whatever component is not dynamic and just static content (dumb Components), we will create them as `Block` components

### Routing (Experimental)
- Trying out TanStack Router and structuring our code to act like file-based routing.