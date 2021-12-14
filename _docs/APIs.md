#### Current Constraints

1. There is no way to disable any API yet
2. Test Case Coverage (Jest) is not 100%
3. It is being developed to fit multiple use-cases

### Register

This is an obligatory endpoint that allows users to register themselves. The interesting bits of Access start becoming apparent right from this endpoint. 

Usually, register api decides what it wants to accept, "email", "mobile" etc., as key. Instead of that we took a different approach for future scalability, you mention the attribute user wants to use for registration in "value", and "type" suggests what is it. Access service defined what services are allowed. They are defined in: `src/functions/getAllowedTypes.js`. There is no Password Policy at this point of time.

Endpoint: `POST /register`

Request:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com",
    "password": "AnotherPassword"
}
```



