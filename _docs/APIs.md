It is being developed to fit multiple use-cases. So, in places it might feel "weird".

#### Current Limitations

1. There is no way to disable any API yet
2. Test Case Coverage (Jest) is not 100%

#### Login and Register Stories

| Story                              | Endpoint                     |
| ---------------------------------- | ---------------------------- |
| Users/CanRegister                  | /register                    |
| Users/RequestVerifyForRegistration | /request-verify-registration |
| Users/VerifyRegistration           | /verify-registration         |

### Register

This is an obligatory endpoint that allows users to register themselves. The interesting bits of Access start becoming apparent right from this endpoint.

Usually, register api decides what it wants to accept, "email", "mobile" etc., as key. Instead of that we took a different approach for future scalability, you mention the attribute user wants to use for registration in "value", and "type" suggests what is it. Access service defines what services are allowed. They are defined in: `src/functions/getAllowedTypes.js`. There is no Password Policy at this point of time.

We use bcrypt package to hash the password.

Endpoint: `POST /register`

Request:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com",
    "password": "AnotherPassword"
}
```

### Login

The value which is passed should be verified, else system won't allow to login. There is currently no way to override this.

Endpoint: `POST /login`

Request:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com",
    "password": "AnotherPassword"
}
```
