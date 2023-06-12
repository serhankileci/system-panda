# Rest API
SystemPanda automatically generates a REST API for your collections for CRUD operations. **Until the next version which will include an UI panel to handle your collections, plugins, etc. you can make HTTP requests with the following API interface**:

For GET and DELETE requests, include the data as the query string.
For POST and PUT requests, in the request body.

Query keywords are Prisma query method args. The where clause must be JSON.

Example GET request (indented the query string for readability):
```
?
	take=10&
	skip=0&
	orderBy=id-asc,name-desc&
	distinct=foo,bar&
	cursor=email-foo,id-3&
	select=email-true,id-false&
	where={"field1":"value1","field2":{"subfield1":"subvalue1","subfield2":"subvalue2"},"field3":["value3","value4"]}
```
Depending on the request method, you might need only one keyword or many.
