## Intro

Access is a deployed microservice to handle common use-cases around: Authentication, Authorization, Teams and Members, Subscriptions, API Keys, Validating Tokens. It uses JWT Tokens and at this point, doesn't support even Refresh Token.

It is built on and dependent on:

1. NodeJS
2. Postgres

### Stories and APIs

- [Register](_docs/Register.md)
- [Login](_docs/Login.md)
- [Password](_docs/Password.md)

### Help Commands

- Prerelease:
  gh release create v1.1.2-alpha.42 --notes "v1.1.2-alpha.42" -p
