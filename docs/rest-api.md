# **Rest API**
A REST API for your collections are automatically generated for CRUD operations that you can make HTTP requests to. For GET, include the data as the query string. For the rest, as the request body. Query keywords are Prisma query method args. The where clause must be JSON. All four CRUD operations are executed with the ...many Prisma argument, but you can write your queries to affect one datum.

Example GET request (newlined the query string for readability):
```
?
take=10
&
skip=0
&
orderBy=id-asc,name-desc
&
distinct=foo,bar
&
cursor=email-foo,id-3
&
select=email-true,id-true
&
where={"field1":"value1","field2":{"subfield1":"subvalue1","subfield2":"subvalue2"},"field3":["value3","value4"]}
```
