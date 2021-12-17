Getting Started:

- Clone Access Repo: `git clone git@github.com:nobejs/access.git`
- Install Packages: `yarn`
- create database
- copy .env to .env.example, add DB credentials and run `yarn db:migrate`
- start server: `yarn serve`

- Add keys to .env (How to generate?)

````PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEILiLApra/MeO5vaAs1mqpawrPXAxzBPzupuKwES71PB1\n-----END PRIVATE KEY-----\n'
PUBLIC_KEY='-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA6tW2DLeQIZOLWT3hQz5AM49yBC3BTUEW48GobKa93Wc=\n-----END PUBLIC KEY-----\n'```






## Migrating Teams Microservice

- Migrate from nobejs/teams to nobejs/access


### Implementation Notes:
- To authenticate add the Public and private keys in the


* Stack Overflow question:
    - KeyObject instances for symmetric algorithms must be of type "secret" while Decoding token.

     -ANS: it comes when the auth token is not signed by the key. As the token couldn't be verified from the key.
```

1. yarn bump
2. gh release create v1.1.2-alpha.4 --notes "v1.1.2-alpha.4" -p




````
